import { useEffect, useState } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { hu } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { ApiError, getCarAvailability, type BookedRange } from '../api'

interface DateRangePickerProps {
  carId: number
  startDate: string
  endDate: string
  onChange: (startDate: string, endDate: string) => void
  excludeRentalId?: number
}

function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseISODate(value: string): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function DateRangePicker({ carId, startDate, endDate, onChange, excludeRentalId }: DateRangePickerProps) {
  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getCarAvailability(carId, excludeRentalId)
      .then((ranges) => {
        if (!cancelled) setBookedRanges(ranges)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Váratlan hiba történt.')
      })
    return () => {
      cancelled = true
    }
  }, [carId, excludeRentalId])

  // The return day itself is free for a new pickup, so the last blocked
  // night is the day before end_date.
  const blockedRanges: DateRange[] = bookedRanges.map((range) => {
    const from = parseISODate(range.start_date)!
    const to = parseISODate(range.end_date)!
    to.setDate(to.getDate() - 1)
    return { from, to: to < from ? from : to }
  })

  function handleSelect(range: DateRange | undefined) {
    if (!range?.from) {
      onChange('', '')
      return
    }
    onChange(toISODate(range.from), range.to ? toISODate(range.to) : '')
  }

  return (
    <div className="date-range-picker">
      <DayPicker
        mode="range"
        locale={hu}
        selected={{ from: parseISODate(startDate), to: parseISODate(endDate) }}
        onSelect={handleSelect}
        disabled={[...blockedRanges, { before: startOfToday() }]}
        modifiers={{ booked: blockedRanges }}
        modifiersClassNames={{ booked: 'date-range-picker-booked' }}
        showOutsideDays
        fixedWeeks
      />
      <p className="date-range-picker-legend small text-body-secondary mb-0">
        <span className="date-range-picker-legend-swatch" /> Foglalt napok
      </p>
      {error && <p className="text-danger small mb-0">{error}</p>}
    </div>
  )
}

export default DateRangePicker
