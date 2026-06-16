import { useState } from 'react'
import { getDefaultCustomRange } from '../utils/salesOverview'

export function useSalesOverviewRange() {
  const [range, setRange] = useState('week')
  const [customRange, setCustomRange] = useState(getDefaultCustomRange)

  const setCustomStartDate = (startDate) => {
    setCustomRange((prev) => ({ ...prev, startDate }))
  }

  const setCustomEndDate = (endDate) => {
    setCustomRange((prev) => ({ ...prev, endDate }))
  }

  return {
    range,
    setRange,
    customRange,
    setCustomStartDate,
    setCustomEndDate,
  }
}
