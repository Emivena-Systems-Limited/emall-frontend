export const INSTRUMENT_SANS = '"Onest", sans-serif'

export const CHART_AXIS_TICK = {
  fontSize: 11,
  fill: '#94a3b8',
  fontFamily: INSTRUMENT_SANS,
}

export const CHART_AXIS_TICK_Y = {
  fontSize: 10,
  fill: '#94a3b8',
  fontFamily: INSTRUMENT_SANS,
}

export const DONUT_CENTER_LABEL = {
  fontSize: 11,
  fill: '#94a3b8',
  fontFamily: INSTRUMENT_SANS,
  fontWeight: 600,
}

export function donutCenterValueStyle(fontSize = 22) {
  return {
    fontSize,
    fontWeight: 700,
    fill: '#0f172a',
    fontFamily: INSTRUMENT_SANS,
  }
}
