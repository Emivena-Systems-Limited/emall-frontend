import { PROMOTION_TYPES } from '../../constants/promotions'
import {
  combineDateAndTime,
  fromDateTimeLocalValue,
  getPromotionScheduleConfig,
  toDateInputValue,
  toDateTimeLocalValue,
  toTimeInputValue,
} from '../../utils/promotionSchedule'

function FieldLabel({ children, required = false }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
      {required && <span className="text-brand"> *</span>}
    </span>
  )
}

function DateTimeRangeFields({ form, readOnly, onStartChange, onEndChange }) {
  return (
    <>
      <label className="block">
        <FieldLabel required>Start Date and Time</FieldLabel>
        <input
          type="datetime-local"
          value={toDateTimeLocalValue(form.startDate)}
          disabled={readOnly}
          onChange={(event) => onStartChange(fromDateTimeLocalValue(event.target.value))}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:bg-slate-50"
        />
      </label>
      <label className="block">
        <FieldLabel required>End Date and Time</FieldLabel>
        <input
          type="datetime-local"
          value={toDateTimeLocalValue(form.endDate)}
          disabled={readOnly}
          onChange={(event) => onEndChange(fromDateTimeLocalValue(event.target.value))}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:bg-slate-50"
        />
      </label>
    </>
  )
}

function SingleDayTimeFields({ form, readOnly, onChange }) {
  const dealDate = toDateInputValue(form.startDate) || toDateInputValue(form.endDate)
  const startTime = toTimeInputValue(form.startDate)
  const endTime = toTimeInputValue(form.endDate)

  const updateDealDate = (nextDate) => {
    onChange({
      startDate: combineDateAndTime(nextDate, startTime || '00:00'),
      endDate: combineDateAndTime(nextDate, endTime || '23:59'),
    })
  }

  const updateStartTime = (nextTime) => {
    onChange({
      startDate: combineDateAndTime(dealDate, nextTime),
      endDate: form.endDate || combineDateAndTime(dealDate, endTime || '23:59'),
    })
  }

  const updateEndTime = (nextTime) => {
    onChange({
      startDate: form.startDate || combineDateAndTime(dealDate, startTime || '00:00'),
      endDate: combineDateAndTime(dealDate, nextTime),
    })
  }

  return (
    <>
      <label className="block md:col-span-2">
        <FieldLabel required>Deal Date</FieldLabel>
        <input
          type="date"
          value={dealDate}
          disabled={readOnly}
          onChange={(event) => updateDealDate(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:bg-slate-50"
        />
      </label>
      <label className="block">
        <FieldLabel required>Start Time</FieldLabel>
        <input
          type="time"
          value={startTime}
          disabled={readOnly}
          onChange={(event) => updateStartTime(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:bg-slate-50"
        />
      </label>
      <label className="block">
        <FieldLabel required>End Time</FieldLabel>
        <input
          type="time"
          value={endTime}
          disabled={readOnly}
          onChange={(event) => updateEndTime(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:bg-slate-50"
        />
      </label>
    </>
  )
}

function DateRangeFields({ form, readOnly, onStartChange, onEndChange }) {
  return (
    <>
      <label className="block">
        <FieldLabel required>Start Date</FieldLabel>
        <input
          type="date"
          value={toDateInputValue(form.startDate)}
          disabled={readOnly}
          onChange={(event) => onStartChange(combineDateAndTime(event.target.value, '00:00'))}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:bg-slate-50"
        />
      </label>
      <label className="block">
        <FieldLabel required>End Date</FieldLabel>
        <input
          type="date"
          value={toDateInputValue(form.endDate)}
          disabled={readOnly}
          onChange={(event) => onEndChange(combineDateAndTime(event.target.value, '23:59', { endOfDay: true }))}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand-light disabled:bg-slate-50"
        />
      </label>
    </>
  )
}

export default function PromotionScheduleSection({ form, readOnly, onChange }) {
  const scheduleConfig = getPromotionScheduleConfig(form.type)

  const updateSchedule = (patch) => {
    onChange({ ...form, ...patch })
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <h2 className="text-sm font-bold text-slate-950">Schedule</h2>
      <p className="mt-1 text-sm text-slate-500">{scheduleConfig.description}</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {scheduleConfig.mode === 'single_day_times' && (
          <SingleDayTimeFields
            form={form}
            readOnly={readOnly}
            onChange={updateSchedule}
          />
        )}

        {scheduleConfig.mode === 'datetime_range' && (
          <DateTimeRangeFields
            form={form}
            readOnly={readOnly}
            onStartChange={(value) => updateSchedule({ startDate: value })}
            onEndChange={(value) => updateSchedule({ endDate: value })}
          />
        )}

        {scheduleConfig.mode === 'date_range' && (
          <DateRangeFields
            form={form}
            readOnly={readOnly}
            onStartChange={(value) => updateSchedule({ startDate: value })}
            onEndChange={(value) => updateSchedule({ endDate: value })}
          />
        )}
      </div>
    </section>
  )
}

export function handlePromotionTypeChange(form, nextType) {
  const currentType = form.type
  if (currentType === nextType) return form

  return {
    ...form,
    type: nextType,
    startDate: '',
    endDate: '',
  }
}
