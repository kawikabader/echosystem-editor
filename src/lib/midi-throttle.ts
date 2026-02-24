const MIDI_INTERVAL_MS = 12 // ~83 Hz cap

interface PendingCC {
  channel: number
  cc: number
  value: number
}

let pendingMessages = new Map<string, PendingCC>()
let rafId: number | null = null
let lastSendTime = 0
let outputRef: MIDIOutput | null = null

function flush() {
  const now = performance.now()
  if (now - lastSendTime < MIDI_INTERVAL_MS) {
    rafId = requestAnimationFrame(flush)
    return
  }

  if (!outputRef || pendingMessages.size === 0) {
    rafId = null
    return
  }

  for (const [, msg] of pendingMessages) {
    outputRef.send([0xb0 | (msg.channel & 0x0f), msg.cc & 0x7f, msg.value & 0x7f])
  }

  lastSendTime = now
  pendingMessages = new Map()
  rafId = null
}

export function setThrottleOutput(output: MIDIOutput | null) {
  outputRef = output
}

export function throttledSendCC(channel: number, cc: number, value: number) {
  const key = `${channel}:${cc}`
  pendingMessages.set(key, { channel, cc, value })

  if (rafId === null) {
    rafId = requestAnimationFrame(flush)
  }
}
