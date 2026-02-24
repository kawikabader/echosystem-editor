import { setThrottleOutput, throttledSendCC } from './midi-throttle'
import { logCC, logPC } from './midi-log'

let midiAccess: MIDIAccess | null = null
let selectedOutput: MIDIOutput | null = null
let stateChangeCallback: (() => void) | null = null

export async function requestAccess(): Promise<MIDIAccess> {
  if (midiAccess) return midiAccess
  midiAccess = await navigator.requestMIDIAccess({ sysex: false })
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
  selectedOutput.send([0xb0 | ((channel - 1) & 0x0f), cc & 0x7f, value & 0x7f])
  logCC(channel, cc, value)
}

/**
 * Send a CC message through the coalescing throttle (~83Hz).
 * Use for slider drags. Channel is 1-indexed (1-16).
 */
export function sendCCThrottled(channel: number, cc: number, value: number) {
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

/**
 * Send multiple CC messages with staggered timing for preset loads.
 * Channel is 1-indexed (1-16). Spacing in ms between messages.
 */
export function sendBulkCC(
  channel: number,
  messages: Array<{ cc: number; value: number }>,
  spacingMs = 3,
) {
  if (!selectedOutput) return
  const now = performance.now()
  const ch = (channel - 1) & 0x0f

  messages.forEach((msg, i) => {
    selectedOutput!.send(
      [0xb0 | ch, msg.cc & 0x7f, msg.value & 0x7f],
      now + i * spacingMs,
    )
    logCC(channel, msg.cc, msg.value)
  })
}

export function autoDetectOutput(preferredName = 'USB Uno MIDI Interface'): MIDIOutput | null {
  const outputs = getOutputs()
  return outputs.find((o) => o.name?.includes(preferredName)) ?? outputs[0] ?? null
}
