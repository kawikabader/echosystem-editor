declare const __brand: unique symbol
type Brand<T, B extends string> = T & { readonly [__brand]: B }

/** User-facing MIDI channel: 1-16 */
export type MidiChannel = Brand<number, 'MidiChannel'>

/** Wire-format MIDI channel: 0-15 */
export type MidiChannelIndex = Brand<number, 'MidiChannelIndex'>

/** MIDI data value: 0-127 */
export type MidiValue = Brand<number, 'MidiValue'>

export function midiChannel(n: number): MidiChannel {
  if (!Number.isInteger(n) || n < 1 || n > 16) {
    throw new RangeError(`MIDI channel must be 1–16, got ${n}`)
  }
  return n as MidiChannel
}

export function midiChannelIndex(n: number): MidiChannelIndex {
  if (!Number.isInteger(n) || n < 0 || n > 15) {
    throw new RangeError(`MIDI channel index must be 0–15, got ${n}`)
  }
  return n as MidiChannelIndex
}

export function midiValue(n: number): MidiValue {
  if (!Number.isInteger(n) || n < 0 || n > 127) {
    throw new RangeError(`MIDI value must be 0–127, got ${n}`)
  }
  return n as MidiValue
}

export function channelToIndex(ch: MidiChannel): MidiChannelIndex {
  return ((ch as number) - 1) as MidiChannelIndex
}

export function indexToChannel(idx: MidiChannelIndex): MidiChannel {
  return ((idx as number) + 1) as MidiChannel
}

export function clampMidiValue(n: number): MidiValue {
  return Math.max(0, Math.min(127, Math.round(n))) as MidiValue
}
