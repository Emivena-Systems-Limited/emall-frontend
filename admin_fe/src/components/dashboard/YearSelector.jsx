import ChartSelect from './ChartSelect'

export default function YearSelector({ id, value, years, onChange, label = 'Select year' }) {
  return (
    <ChartSelect
      id={id}
      value={String(value)}
      label={label}
      options={years.map((year) => ({ value: String(year), label: String(year) }))}
      onChange={(next) => onChange(Number(next))}
    />
  )
}
