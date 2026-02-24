export interface SubModeDefinition {
  readonly index: number
  readonly name: string
  readonly thing1: string
  readonly thing2: string
}

export interface ModeDefinition {
  readonly index: number
  readonly name: string
  readonly subModes: readonly SubModeDefinition[]
}

export const MODE_DEFINITIONS: readonly ModeDefinition[] = [
  {
    index: 0,
    name: 'Digital',
    subModes: [
      { index: 0, name: 'Pristine', thing1: 'Modulation Depth', thing2: 'Modulation Rate' },
      { index: 1, name: 'Short Stuff 1980', thing1: 'Mod Depth', thing2: 'Bandwidth' },
      { index: 2, name: 'Ping Pong', thing1: 'Modulation Depth', thing2: 'Modulation Rate' },
      { index: 3, name: 'Dynamic Duck', thing1: 'Duck Amount', thing2: 'Release Speed' },
      { index: 4, name: 'Dynamic Feedback', thing1: 'Duck Amount', thing2: 'Duck Threshold' },
    ],
  },
  {
    index: 1,
    name: 'Tape',
    subModes: [
      { index: 0, name: 'New Tape', thing1: 'Modulation Depth', thing2: 'Modulation Rate' },
      { index: 1, name: 'Old Tape', thing1: 'Modulation Depth', thing2: 'Modulation Rate' },
      { index: 2, name: 'Echoplex', thing1: 'Saturation', thing2: 'Modulation Width' },
      { index: 3, name: 'Space Echo', thing1: 'Input Drive', thing2: 'Modulation Width' },
    ],
  },
  {
    index: 2,
    name: 'Analog',
    subModes: [
      { index: 0, name: 'BBD', thing1: 'Saturation', thing2: 'Modulation' },
      { index: 1, name: 'Tube BBD', thing1: 'Saturation', thing2: 'Modulation' },
      { index: 2, name: 'Deluxe Memory Boy', thing1: 'Vibrato Amount', thing2: 'Chorus Amount' },
      { index: 3, name: 'Echorec', thing1: 'Playback Heads Out', thing2: 'Playback Heads Record' },
    ],
  },
  {
    index: 3,
    name: 'Multi',
    subModes: [
      { index: 0, name: 'Digital Multi', thing1: 'Intensities', thing2: 'Depth & Pan Width' },
      { index: 1, name: 'Tone Taps', thing1: 'Tone Variations', thing2: 'Depth & Pan Width' },
      { index: 2, name: 'Preset Pattern', thing1: 'Delay Time Pattern', thing2: 'Volume & Pan Variation' },
    ],
  },
  {
    index: 4,
    name: 'Mod',
    subModes: [
      { index: 0, name: 'Panning Delay', thing1: 'Pan Width', thing2: 'Pan Speed' },
      { index: 1, name: 'Trem Delay', thing1: 'Trem Depth', thing2: 'Trem Speed' },
      { index: 2, name: 'Waveform', thing1: 'Waveform', thing2: 'Modulation' },
    ],
  },
  {
    index: 5,
    name: 'Filter',
    subModes: [
      { index: 0, name: 'Filter Pulse', thing1: 'Center Frequency', thing2: 'Pulse Speed' },
      { index: 1, name: 'Filter Warp', thing1: 'Filter Sensitivity', thing2: 'Response Speed' },
      { index: 2, name: 'Swoosh Echo', thing1: 'Modulation', thing2: 'Swoosh Speed' },
    ],
  },
  {
    index: 6,
    name: 'Ambient',
    subModes: [
      { index: 0, name: 'Drunk Ewok', thing1: 'Delay Pattern', thing2: 'Diffusion' },
      { index: 1, name: 'Triggered Swell', thing1: 'Swell Time', thing2: 'Modulation' },
      { index: 2, name: 'Triggered Multi Swell', thing1: 'Swell Time', thing2: 'Flanger Amount' },
      { index: 3, name: 'Long Delay', thing1: 'Modulation Depth', thing2: 'Modulation Rate' },
      { index: 4, name: 'Input Rider', thing1: 'Level Into Delay', thing2: 'All-pass Filter' },
      { index: 5, name: 'Freezification', thing1: 'Fade-in Time', thing2: 'Fade-out Time' },
    ],
  },
  {
    index: 7,
    name: 'Delay + Reverb',
    subModes: [
      { index: 0, name: 'Hall', thing1: 'Delay/Reverb Mix', thing2: 'Reverb Decay' },
      { index: 1, name: 'Plate', thing1: 'Delay/Reverb Mix', thing2: 'Reverb Decay' },
    ],
  },
  {
    index: 8,
    name: 'Reverse',
    subModes: [
      { index: 0, name: 'Reverse Delay', thing1: 'HF Roll-Off', thing2: 'Compression' },
      { index: 1, name: 'Reverse Dual Pitch', thing1: 'Pitch Delay 1', thing2: 'Pitch Delay 2' },
      { index: 2, name: 'Triggered Reverse', thing1: 'Swell Time', thing2: 'Chorus Level' },
    ],
  },
  {
    index: 9,
    name: 'Stutter',
    subModes: [
      { index: 0, name: 'Chop Mode', thing1: 'Chop Speed', thing2: 'Modulation' },
      { index: 1, name: 'Auto Stutter', thing1: 'Filter Sequence', thing2: 'Filter Aggressiveness' },
      { index: 2, name: 'Granular', thing1: 'Grain Size', thing2: 'Randomness' },
    ],
  },
  {
    index: 10,
    name: 'Lo-Fi',
    subModes: [
      { index: 0, name: 'Old Timer', thing1: 'Oldness', thing2: 'Break-up Amount' },
      { index: 1, name: 'Digital Death Robot', thing1: 'Aliasing Freq', thing2: 'Alias Blend' },
      { index: 2, name: 'Distorted Swells', thing1: 'Drive Amount', thing2: 'Compressor Threshold' },
    ],
  },
  {
    index: 11,
    name: 'Whisky',
    subModes: [
      { index: 0, name: "Knobs' Seesaw", thing1: 'Pitch Quiet', thing2: 'Pitch Loud' },
      { index: 1, name: 'Christopher Glitchens', thing1: 'Pitch Delay 1', thing2: 'Pitch Delay 2' },
      { index: 2, name: 'Shimmery Fixed Pitch', thing1: 'Pitch Semitones', thing2: 'Modulation Amount' },
    ],
  },
] as const

export function computeModeCC(modeIndex: number, subModeIndex: number): number {
  const value = modeIndex * 8 + subModeIndex
  if (value < 0 || value > 127) {
    throw new RangeError(`Mode CC value out of range: mode=${modeIndex}, sub=${subModeIndex} => ${value}`)
  }
  return value
}

export function decodeModeCC(ccValue: number): { modeIndex: number; subModeIndex: number } {
  return {
    modeIndex: Math.floor(ccValue / 8),
    subModeIndex: ccValue % 8,
  }
}

export function getModeDefinition(modeIndex: number): ModeDefinition | undefined {
  return MODE_DEFINITIONS.find((m) => m.index === modeIndex)
}

export function getSubModeDefinition(modeIndex: number, subModeIndex: number): SubModeDefinition | undefined {
  const mode = getModeDefinition(modeIndex)
  return mode?.subModes.find((s) => s.index === subModeIndex)
}
