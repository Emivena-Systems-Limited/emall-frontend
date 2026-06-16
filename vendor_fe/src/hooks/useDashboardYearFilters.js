import { useState } from 'react'

export function useDashboardYearFilters() {
  const currentYear = new Date().getFullYear()
  const [revenueYear, setRevenueYear] = useState(currentYear)
  const [fulfillmentYear, setFulfillmentYear] = useState(currentYear)
  const [categoryYear, setCategoryYear] = useState(currentYear)
  const [activityYear, setActivityYear] = useState(currentYear)

  return {
    revenueYear,
    setRevenueYear,
    fulfillmentYear,
    setFulfillmentYear,
    categoryYear,
    setCategoryYear,
    activityYear,
    setActivityYear,
  }
}
