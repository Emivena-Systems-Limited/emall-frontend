export const INSTRUMENT_SANS = '"Instrument Sans", sans-serif'

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
  fill: '#64748b',
  fontFamily: INSTRUMENT_SANS,
}

export function donutCenterValueStyle(fontSize = 24) {
  return {
    fontSize,
    fontWeight: 800,
    fill: '#0f8f9c',
    fontFamily: INSTRUMENT_SANS,
  }
}
