import JSZip from 'jszip'
import type { MidiValue } from './midi-types'
import type { Preset, EngineState, DelaySource, Routing } from './echosystem'
import { MODE_DEFINITIONS, getModeDefinition, getSubModeDefinition } from './echosystem'

const KNOB_MAX = 4095
const ROUTING_OFFSET = 0x4a
const ENGINE_1_OFFSET = 0x4c
const BINARY_HEADER_SIZE = 156

function knobToMidi(knobValue: number): MidiValue {
  return Math.round((knobValue / KNOB_MAX) * 127) as MidiValue
}

function midiToKnob(midiValue: MidiValue): number {
  return Math.round(((midiValue as number) / 127) * KNOB_MAX)
}

function parseEngineBlock(view: DataView, offset: number): EngineState {
  const modeRaw = view.getUint16(offset, true)
  const modeIndex = Math.floor(modeRaw / 8)
  const subModeIndex = modeRaw % 8

  const delayTime = view.getUint16(offset + 2, true)
  const mix = view.getUint16(offset + 4, true)
  const volume = view.getUint16(offset + 6, true)
  const feedback = view.getUint16(offset + 8, true)
  const tone = view.getUint16(offset + 10, true)
  const thing1 = view.getUint16(offset + 12, true)
  const thing2 = view.getUint16(offset + 14, true)
  const delaySourceRaw = view.getUint16(offset + 16, true)

  const sourceMap: Record<number, DelaySource> = { 0: 'knob', 1: 'global', 2: 'local' }
  const delaySource = sourceMap[delaySourceRaw] ?? 'global'

  return {
    modeIndex,
    subModeIndex,
    ratio: knobToMidi(delayTime),
    mix: knobToMidi(mix),
    volume: knobToMidi(volume),
    feedback: knobToMidi(feedback),
    tone: knobToMidi(tone),
    thing1: knobToMidi(thing1),
    thing2: knobToMidi(thing2),
    delaySource,
  }
}

function writeEngineBlock(view: DataView, offset: number, engine: EngineState) {
  const modeValue = engine.modeIndex * 8 + engine.subModeIndex
  view.setUint16(offset, modeValue, true)

  view.setUint16(offset + 2, midiToKnob(engine.ratio), true)
  view.setUint16(offset + 4, midiToKnob(engine.mix), true)
  view.setUint16(offset + 6, midiToKnob(engine.volume), true)
  view.setUint16(offset + 8, midiToKnob(engine.feedback), true)
  view.setUint16(offset + 10, midiToKnob(engine.tone), true)
  view.setUint16(offset + 12, midiToKnob(engine.thing1), true)
  view.setUint16(offset + 14, midiToKnob(engine.thing2), true)

  const sourceMap: Record<DelaySource, number> = { knob: 0, global: 1, local: 2 }
  view.setUint16(offset + 16, sourceMap[engine.delaySource], true)

  for (let i = 0; i < 18; i++) {
    view.setUint16(offset + 18 + i * 2, 0xffff, true)
  }

  for (let i = 0; i < 5; i++) {
    view.setUint32(offset + 54 + i * 4, 0, true)
  }
}

function generateTextSection(preset: Preset): string {
  const lines: string[] = []
  lines.push(
    '** The text below is a human-readable representation of the binary information above. The pedal only reads the binary information above when importing presets. **',
  )
  lines.push('')
  lines.push('Product: \tEmpress Echosystem')
  lines.push('Version:\t2.20')
  lines.push('')

  const routingNames: Record<Routing, string> = {
    single: 'Single',
    parallel: 'Parallel',
    serial: 'Serial',
    leftRight: 'Left/Right',
  }
  lines.push(`Routing Mode:\t${routingNames[preset.global.routing]}`)
  lines.push('')

  for (let e = 0; e < 2; e++) {
    const engine = e === 0 ? preset.engineA : preset.engineB
    lines.push(`Engine ${e}`)
    lines.push('')

    const mode = getModeDefinition(engine.modeIndex)
    const subMode = getSubModeDefinition(engine.modeIndex, engine.subModeIndex)
    lines.push(`-Mode:\t${mode?.name ?? 'Unknown'}`)
    lines.push(`-Submode:\t${subMode?.name ?? 'Unknown'}`)
    lines.push('')

    lines.push('-Knob Settings')
    lines.push(`--Delay Time:\t${((engine.ratio as number) / 127).toFixed(2)}`)
    lines.push(`--Mix:\t${((engine.mix as number) / 127).toFixed(2)}`)
    lines.push(`--Output:\t${((engine.volume as number) / 127).toFixed(2)}`)
    lines.push(`--Feedback:\t${((engine.feedback as number) / 127).toFixed(2)}`)
    lines.push(`--Tone:\t${((engine.tone as number) / 127).toFixed(2)}`)
    lines.push(`--Thing 1:\t${((engine.thing1 as number) / 127).toFixed(2)}`)
    lines.push(`--Thing 2:\t${((engine.thing2 as number) / 127).toFixed(2)}`)
    lines.push('')
  }

  return lines.join('\n')
}

export function parsePresetBin(bytes: Uint8Array, slotId: number): Preset {
  if (bytes.length >= BINARY_HEADER_SIZE) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

    const engineA = parseEngineBlock(view, 0)

    const routingRaw = view.getUint16(ROUTING_OFFSET, true)
    const routingMap: Record<number, Routing> = {
      0: 'single',
      1: 'parallel',
      2: 'serial',
      3: 'leftRight',
    }

    const engineB = parseEngineBlock(view, ENGINE_1_OFFSET)

    let textStart = -1
    for (let i = BINARY_HEADER_SIZE - 10; i < bytes.length - 2; i++) {
      if (bytes[i] === 0x0a && bytes[i + 1] === 0x0a && bytes[i + 2] === 0x0a) {
        textStart = i + 3
        break
      }
    }

    let name = `Preset ${slotId + 1}`
    if (textStart > 0) {
      const textDecoder = new TextDecoder('utf-8')
      const textSection = textDecoder.decode(bytes.slice(textStart))

      const modeMatch = textSection.match(/-Mode:\t(.+)/)
      const subModeMatch = textSection.match(/-Submode:\t(.+)/)
      if (modeMatch && subModeMatch) {
        name = `${modeMatch[1].trim()} - ${subModeMatch[1].trim()}`
      }
    }

    return {
      id: slotId,
      name,
      engineA,
      engineB,
      global: {
        routing: routingMap[routingRaw] ?? 'single',
        bypassed: false,
        tempo: 64 as MidiValue,
      },
    }
  }

  const textDecoder = new TextDecoder('utf-8')
  const text = textDecoder.decode(bytes)
  return parsePresetText(text, slotId)
}

function parsePresetText(text: string, slotId: number): Preset {
  const lines = text.split('\n')

  let currentEngine = -1
  let currentSection = ''
  const engines: [Partial<EngineState>, Partial<EngineState>] = [{}, {}]
  let routing: Routing = 'single'

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('**')) continue

    if (trimmed.startsWith('Routing Mode:')) {
      const val = trimmed.split('\t').pop()?.trim() ?? ''
      const map: Record<string, Routing> = {
        Single: 'single',
        Parallel: 'parallel',
        Serial: 'serial',
        'Left/Right': 'leftRight',
      }
      routing = map[val] ?? 'single'
      continue
    }

    if (trimmed.match(/^Engine \d/)) {
      currentEngine = parseInt(trimmed.replace('Engine ', ''), 10)
      continue
    }

    if (currentEngine < 0 || currentEngine > 1) continue

    if (trimmed.startsWith('-Mode:')) {
      const modeName = trimmed.split('\t').pop()?.trim() ?? ''
      const mode = MODE_DEFINITIONS.find((m) => m.name === modeName)
      if (mode) engines[currentEngine].modeIndex = mode.index
    } else if (trimmed.startsWith('-Submode:')) {
      const subName = trimmed.split('\t').pop()?.trim() ?? ''
      const modeIdx = engines[currentEngine].modeIndex ?? 0
      const mode = getModeDefinition(modeIdx)
      const sub = mode?.subModes.find((s) => s.name === subName)
      if (sub) engines[currentEngine].subModeIndex = sub.index
    } else if (trimmed.startsWith('-Knob')) {
      currentSection = 'knob'
    } else if (trimmed.startsWith('-Expression')) {
      currentSection = 'expr'
    } else if (currentSection === 'knob' && trimmed.startsWith('--')) {
      const parts = trimmed.replace('--', '').split('\t')
      const key = parts[0]?.replace(':', '').trim()
      const val = parseFloat(parts[1]?.trim() ?? '0')
      const midiVal = Math.round(val * 127) as MidiValue

      const eng = engines[currentEngine]
      switch (key) {
        case 'Delay Time':
          eng.ratio = midiVal
          break
        case 'Mix':
          eng.mix = midiVal
          break
        case 'Output':
          eng.volume = midiVal
          break
        case 'Feedback':
          eng.feedback = midiVal
          break
        case 'Tone':
          eng.tone = midiVal
          break
        case 'Thing 1':
          eng.thing1 = midiVal
          break
        case 'Thing 2':
          eng.thing2 = midiVal
          break
      }
    }
  }

  const defaults = {
    modeIndex: 0,
    subModeIndex: 0,
    ratio: 64 as MidiValue,
    mix: 64 as MidiValue,
    volume: 100 as MidiValue,
    feedback: 64 as MidiValue,
    tone: 64 as MidiValue,
    thing1: 64 as MidiValue,
    thing2: 64 as MidiValue,
    delaySource: 'global' as DelaySource,
  }

  const modeName = MODE_DEFINITIONS.find((m) => m.index === (engines[0].modeIndex ?? 0))?.name ?? 'Unknown'

  return {
    id: slotId,
    name: `${modeName} - Preset ${slotId + 1}`,
    engineA: { ...defaults, ...engines[0] },
    engineB: { ...defaults, ...engines[1] },
    global: {
      routing,
      bypassed: false,
      tempo: 64 as MidiValue,
    },
  }
}

export function buildPresetBin(preset: Preset): Uint8Array {
  const buffer = new ArrayBuffer(BINARY_HEADER_SIZE)
  const view = new DataView(buffer)

  writeEngineBlock(view, 0, preset.engineA)

  const routingMap: Record<Routing, number> = { single: 0, parallel: 1, serial: 2, leftRight: 3 }
  view.setUint16(ROUTING_OFFSET, routingMap[preset.global.routing], true)

  writeEngineBlock(view, ENGINE_1_OFFSET, preset.engineB)

  const binaryPart = new Uint8Array(buffer)
  const textPart = new TextEncoder().encode('\n\n\n' + generateTextSection(preset))

  const result = new Uint8Array(binaryPart.length + textPart.length)
  result.set(binaryPart)
  result.set(textPart, binaryPart.length)
  return result
}

export async function exportAllPresetsAsZip(presets: Preset[]) {
  const zip = new JSZip()
  const folder = zip.folder('to_echosystem')!

  for (const preset of presets) {
    const data = buildPresetBin(preset)
    const filename = `${String(preset.id).padStart(2, '0')}_echosystem.bin`
    folder.file(filename, data)
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'echosystem_presets.zip'
  a.click()
  URL.revokeObjectURL(url)
}
