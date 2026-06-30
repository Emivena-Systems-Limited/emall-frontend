export const CUSTOMERS_PAGE_SIZE = 10

export const CUSTOMER_SEGMENTS = {
  ALL: 'all',
  NEW_THIS_MONTH: 'new-this-month',
}

export const ORDER_DATE_FILTERS = {
  ALL: 'all',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  LAST_90_DAYS: 'last_90_days',
  THIS_YEAR: 'this_year',
}

export const ORDER_DATE_FILTER_OPTIONS = [
  { value: ORDER_DATE_FILTERS.ALL, label: 'All order dates' },
  { value: ORDER_DATE_FILTERS.LAST_7_DAYS, label: 'Last 7 days' },
  { value: ORDER_DATE_FILTERS.LAST_30_DAYS, label: 'Last 30 days' },
  { value: ORDER_DATE_FILTERS.LAST_90_DAYS, label: 'Last 90 days' },
  { value: ORDER_DATE_FILTERS.THIS_YEAR, label: 'This year' },
]

export const SPEND_FILTERS = {
  ALL: 'all',
  UNDER_200: 'under_200',
  BETWEEN_200_500: '200_500',
  OVER_500: 'over_500',
}

export const SPEND_FILTER_OPTIONS = [
  { value: SPEND_FILTERS.ALL, label: 'All spend levels' },
  { value: SPEND_FILTERS.UNDER_200, label: 'Under GH₵ 200' },
  { value: SPEND_FILTERS.BETWEEN_200_500, label: 'GH₵ 200 – 500' },
  { value: SPEND_FILTERS.OVER_500, label: 'Over GH₵ 500' },
]

export const SUMMARY_CARD_ROUTES = {
  total: '/customers',
  newThisMonth: '/customers?segment=new-this-month',
  reviews: '/reviews',
}
