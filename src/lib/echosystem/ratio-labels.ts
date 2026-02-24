export interface RatioPoint {
  midi: number
  label: string
}

export const RATIO_POINTS: RatioPoint[] = [
  { midi: 0, label: '1/32' },
  { midi: 8, label: '1/16T' },
  { midi: 16, label: '1/16' },
  { midi: 24, label: '.1/16' },
  { midi: 32, label: '1/8T' },
  { midi: 42, label: '1/8' },
  { midi: 52, label: '.1/8' },
  { midi: 58, label: '1/4T' },
  { midi: 64, label: '1/4' },
  { midi: 74, label: '.1/4' },
  { midi: 80, label: '1/2T' },
  { midi: 85, label: '1/2' },
  { midi: 95, label: '.1/2' },
  { midi: 106, label: 'Whole' },
  { midi: 117, label: '.Whole' },
  { midi: 127, label: '2x' },
]

export function midiToRatioLabel(midiValue: number): string {
  let closest = RATIO_POINTS[0]
  let minDist = Math.abs(midiValue - closest.midi)

  for (const point of RATIO_POINTS) {
    const dist = Math.abs(midiValue - point.midi)
    if (dist < minDist) {
      minDist = dist
      closest = point
    }
  }

  if (minDist <= 3) {
    return closest.label
  }

  return closest.label + '~'
}
