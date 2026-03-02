import { setThrottleOutput, throttledSendCC } from './midi-throttle'
import { logCC, logPC, logSysEx } from './midi-log'

// Universal SysEx Identity Reply — unlocks CC feedback from Empress Echosystem
const SYSEX_IDENTITY_REPLY = new Uint8Array([
  0xf0, 0x7e, 0x00, 0x06, 0x02,
  0x00, 0x01, 0x00,       // manufacturer
  0x01, 0x00,             // family
  0x01, 0x00,             // model
  0x01, 0x00, 0x00, 0x00, // version
  0xf7,
])

type IncomingCCHandler = (channel: number, cc: number, value: number) => void
type IncomingPCHandler = (channel: number, program: number) => void

let midiAccess: MIDIAccess | null = null
let selectedOutput: MIDIOutput | null = null
let selectedInput: MIDIInput | null = null
let stateChangeCallback: (() => void) | null = null
let onIncomingCC: IncomingCCHandler | null = null
let onIncomingPC: IncomingPCHandler | null = null

// Echo suppression: ignore incoming CCs that we just sent (pedal echoes old value briefly)
const ECHO_WINDOW_MS = 200
const recentOutgoingCC = new Map<number, number>() // cc → timestamp

export async function requestAccess(): Promise<MIDIAccess> {
  if (midiAccess) return midiAccess
  midiAccess = await navigator.requestMIDIAccess({ sysex: true })
  midiAccess.onstatechange = () => {
    stateChangeCallback?.()
  }
  return midiAccess
}

export function onStateChange(cb: (() => void) | null) {
  stateChangeCallback = cb
}

export function getOutputs(): MIDIOutput[] {
  if (!midiAccess) return []
  return Array.from(midiAccess.outputs.values())
}

export function selectOutput(port: MIDIOutput | null) {
  selectedOutput = port
  setThrottleOutput(port)
}

export function getSelectedOutput(): MIDIOutput | null {
  return selectedOutput
}

export function isConnected(): boolean {
  return selectedOutput !== null && selectedOutput.state === 'connected'
}

/**
 * Send a CC message immediately (bypasses throttle).
 * Channel is 1-indexed (1-16).
 */
export function sendCC(channel: number, cc: number, value: number) {
  if (!selectedOutput) return
  recentOutgoingCC.set(cc, performance.now())
  selectedOutput.send([0xb0 | ((channel - 1) & 0x0f), cc & 0x7f, value & 0x7f])
  logCC(channel, cc, value)
}

/**
 * Send a CC message through the coalescing throttle (~83Hz).
 * Use for slider drags. Channel is 1-indexed (1-16).
 */
export function sendCCThrottled(channel: number, cc: number, value: number) {
  recentOutgoingCC.set(cc, performance.now())
  throttledSendCC(channel - 1, cc, value)
  logCC(channel, cc, value)
}

/**
 * Send a Program Change message. Channel is 1-indexed (1-16).
 */
export function sendPC(channel: number, program: number) {
  if (!selectedOutput) return
  selectedOutput.send([0xc0 | ((channel - 1) & 0x0f), program & 0x7f])
  logPC(channel, program)
}

export function getInputs(): MIDIInput[] {
  if (!midiAccess) return []
  return Array.from(midiAccess.inputs.values())
}

export function setIncomingCCHandler(handler: IncomingCCHandler | null) {
  onIncomingCC = handler
}

export function setIncomingPCHandler(handler: IncomingPCHandler | null) {
  onIncomingPC = handler
}

export function sendSysEx(data: Uint8Array | number[]) {
  if (!selectedOutput) return
  selectedOutput.send(data instanceof Uint8Array ? data : new Uint8Array(data))
}

function handleSysEx(data: Uint8Array) {
  // Universal SysEx Identity Request: F0 7E xx 06 01 F7
  if (
    data.length === 6 &&
    data[1] === 0x7e &&
    data[3] === 0x06 &&
    data[4] === 0x01
  ) {
    sendSysEx(SYSEX_IDENTITY_REPLY)
    logSysEx('Identity Request → reply sent')
  }
}

function handleMidiMessage(event: MIDIMessageEvent) {
  const data = event.data
  if (!data || data.length < 1) return

  // SysEx message
  if (data[0] === 0xf0) {
    handleSysEx(data)
    return
  }

  if (data.length < 2) return

  const status = data[0] & 0xf0
  const channel = (data[0] & 0x0f) + 1

  if (status === 0xb0 && data.length >= 3) {
    const cc = data[1]
    logCC(channel, cc, data[2], 'in')
    const sentAt = recentOutgoingCC.get(cc)
    if (sentAt && performance.now() - sentAt < ECHO_WINDOW_MS) return
    recentOutgoingCC.delete(cc)
    onIncomingCC?.(channel, cc, data[2])
  } else if (status === 0xc0) {
    logPC(channel, data[1], 'in')
    onIncomingPC?.(channel, data[1])
  }
}

export function selectInput(port: MIDIInput | null) {
  if (selectedInput) {
    selectedInput.onmidimessage = null
  }
  selectedInput = port
  if (selectedInput) {
    selectedInput.onmidimessage = handleMidiMessage
  }
}

export function getSelectedInput(): MIDIInput | null {
  return selectedInput
}

export function autoDetectInput(preferredName = 'USB Uno MIDI Interface'): MIDIInput | null {
  const inputs = getInputs()
  return inputs.find((i) => i.name?.includes(preferredName)) ?? inputs[0] ?? null
}

export function autoDetectOutput(preferredName = 'USB Uno MIDI Interface'): MIDIOutput | null {
  const outputs = getOutputs()
  return outputs.find((o) => o.name?.includes(preferredName)) ?? outputs[0] ?? null
}
