import { PROMOTION_TYPES } from '../constants/promotions'

export const PROMOTION_SCHEDULE_CONFIG = {
  [PROMOTION_TYPES.TODAYS_DEALS]: {
    title: 'Daily deal window',
    description: 'Pick the deal day and the hours it runs. The promotion applies for that day only.',
    mode: 'single_day_times',
  },
  [PROMOTION_TYPES.FLASH_SALES]: {
    title: 'Flash sale window',
    description: 'Set a precise start and end date/time for this short-lived sale.',
    mode: 'datetime_range',
  },
  [PROMOTION_TYPES.CLEARANCE]: {
    title: 'Clearance period',
    description: 'Choose the date range for this longer-running clearance campaign.',
    mode: 'date_range',
  },
}

export function getPromotionScheduleConfig(type) {
  return PROMOTION_SCHEDULE_CONFIG[type] ?? PROMOTION_SCHEDULE_CONFIG[PROMOTION_TYPES.FLASH_SALES]
}

function padTimePart(value) {
  return String(value).padStart(2, '0')
}

export function toDateInputValue(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 10)
}

export function toTimeInputValue(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${padTimePart(date.getHours())}:${padTimePart(date.getMinutes())}`
}

export function toDateTimeLocalValue(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

export function fromDateTimeLocalValue(value) {
  if (!value) return ''
  return new Date(value).toISOString()
}

export function combineDateAndTime(dateValue, timeValue, { endOfDay = false } = {}) {
  if (!dateValue) return ''

  const time = timeValue || (endOfDay ? '23:59' : '00:00')
  return new Date(`${dateValue}T${time}`).toISOString()
}

export function validatePromotionSchedule(form) {
  const { type } = form
  const config = getPromotionScheduleConfig(type)

  if (config.mode === 'single_day_times') {
    const dealDate = toDateInputValue(form.startDate)
    const startTime = toTimeInputValue(form.startDate)
    const endTime = toTimeInputValue(form.endDate)

    if (!dealDate) return 'Deal date is required.'
    if (!startTime || !endTime) return 'Start and end times are required.'
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      return 'End time must be after the start time.'
    }
    return null
  }

  if (config.mode === 'date_range') {
    if (!form.startDate || !form.endDate) return 'Start and end dates are required.'
    if (new Date(form.endDate) < new Date(form.startDate)) {
      return 'End date must be on or after the start date.'
    }
    return null
  }

  if (!form.startDate || !form.endDate) return 'Start and end dates are required.'
  if (new Date(form.endDate) <= new Date(form.startDate)) {
    return 'End date must be after the start date.'
  }
  return null
}

export function buildScheduleDefaultsForType(type) {
  return {
    startDate: '',
    endDate: '',
  }
}
