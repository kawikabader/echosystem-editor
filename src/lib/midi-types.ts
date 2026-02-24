declare const __brand: unique symbol
type Brand<T, B extends string> = T & { readonly [__brand]: B }

/** MIDI data value: 0-127 */
export type MidiValue = Brand<number, 'MidiValue'>
