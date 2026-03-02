export type EngineACCNumber = 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107 | 108
export type EngineBCCNumber = 109 | 110 | 111 | 112 | 113 | 114 | 115 | 116 | 117

export const ENGINE_A_CC = {
  mode: 100,
  ratio: 101,
  mix: 102,
  volume: 103,
  feedback: 104,
  tone: 105,
  thing1: 106,
  thing2: 107,
  delaySource: 108,
} as const satisfies Record<string, EngineACCNumber>

export const ENGINE_B_CC = {
  mode: 109,
  ratio: 110,
  mix: 111,
  volume: 112,
  feedback: 113,
  tone: 114,
  thing1: 115,
  thing2: 116,
  delaySource: 117,
} as const satisfies Record<string, EngineBCCNumber>

export type EngineParamName = keyof typeof ENGINE_A_CC

export const ENGINE_CC = {
  A: ENGINE_A_CC,
  B: ENGINE_B_CC,
} as const

export type EngineId = keyof typeof ENGINE_CC

export const GLOBAL_CC = {
  expression: 10,
  loadPreset: 11,
  tap: 35,
  scroll: 36,
  bypass: 37,
  shift: 38,
  savePreset: 39,
  engineOrder: 40,
  soloA: 41,
  soloB: 42,
  clockA: 51,
  clockB: 52,
  engageBypass: 60,
  routing: 118,
} as const

export const DEFAULT_MIDI_CHANNEL = 6
export const MAX_PRESETS = 36

/** Reverse lookup: CC number → engine/param or global target */
export type CCTarget =
  | { type: 'engineParam'; engine: EngineId; param: EngineParamName }
  | { type: 'global'; param: keyof typeof GLOBAL_CC }

export const CC_TO_TARGET: ReadonlyMap<number, CCTarget> = (() => {
  const map = new Map<number, CCTarget>()
  for (const [param, cc] of Object.entries(ENGINE_A_CC)) {
    map.set(cc, { type: 'engineParam', engine: 'A', param: param as EngineParamName })
  }
  for (const [param, cc] of Object.entries(ENGINE_B_CC)) {
    map.set(cc, { type: 'engineParam', engine: 'B', param: param as EngineParamName })
  }
  for (const [param, cc] of Object.entries(GLOBAL_CC)) {
    map.set(cc, { type: 'global', param: param as keyof typeof GLOBAL_CC })
  }
  return map
})()
