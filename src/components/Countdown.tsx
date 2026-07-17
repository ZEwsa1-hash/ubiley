import { useEffect, useMemo, useState } from 'react'

type CountdownProps = {
  targetDate: string
}

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const zeroTime: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 }

function calculateTimeLeft(target: number): TimeLeft {
  const difference = target - Date.now()
  if (difference <= 0) return zeroTime
  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
  }
}

export function Countdown({ targetDate }: CountdownProps) {
  const target = useMemo(() => new Date(targetDate).getTime(), [targetDate])
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(target))

  useEffect(() => {
    const timer = window.setInterval(() => setTimeLeft(calculateTimeLeft(target)), 1_000)
    return () => window.clearInterval(timer)
  }, [target])

  const started = Object.values(timeLeft).every((value) => value === 0)

  if (started) {
    return <p className="countdown-started">Волшебный вечер начался</p>
  }

  const units = [
    { value: timeLeft.days, label: 'дней' },
    { value: timeLeft.hours, label: 'часов' },
    { value: timeLeft.minutes, label: 'минут' },
    { value: timeLeft.seconds, label: 'секунд' },
  ]

  return (
    <div className="countdown" aria-label="Обратный отсчёт до события" aria-live="polite">
      {units.map((unit) => (
        <div className="countdown__unit" key={unit.label}>
          <span>{String(unit.value).padStart(2, '0')}</span>
          <small>{unit.label}</small>
        </div>
      ))}
    </div>
  )
}
