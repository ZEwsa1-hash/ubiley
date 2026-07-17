import { FormEvent, useState } from 'react'
import { eventConfig } from '../eventConfig'
import type { Attendance, ChildrenAnswer, RsvpPayload } from '../types'

const alcoholOptions = ['Игристое', 'Белое вино', 'Красное вино', 'Крепкий алкоголь', 'Без алкоголя', 'Другое']

type FormState = {
  fullName: string
  attendance: Attendance | ''
  alcohol: string[]
  alcoholOther: string
  children: ChildrenAnswer | ''
  childrenCount: string
  website: string
}

const initialForm: FormState = {
  fullName: '',
  attendance: '',
  alcohol: [],
  alcoholOther: '',
  children: '',
  childrenCount: '',
  website: '',
}

export function RsvpForm() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [serverMessage, setServerMessage] = useState('')
  const isAttending = form.attendance === 'yes'

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function toggleAlcohol(option: string) {
    const selected = form.alcohol.includes(option)
      ? form.alcohol.filter((item) => item !== option)
      : [...form.alcohol, option]
    update('alcohol', selected)
  }

  function validate() {
    const nextErrors: Record<string, string> = {}
    if (!form.fullName.trim()) nextErrors.fullName = 'Напишите, пожалуйста, ваше имя'
    if (!form.attendance) nextErrors.attendance = 'Выберите один из вариантов'

    if (isAttending) {
      if (form.alcohol.length === 0) nextErrors.alcohol = 'Выберите хотя бы один вариант'
      if (form.alcohol.includes('Другое') && !form.alcoholOther.trim()) {
        nextErrors.alcoholOther = 'Уточните ваш вариант'
      }
      if (!form.children) nextErrors.children = 'Укажите, будут ли с вами дети'
      if (form.children === 'yes' && (!form.childrenCount || Number(form.childrenCount) < 1)) {
        nextErrors.childrenCount = 'Укажите количество детей'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return
    if (form.website) return

    const endpoint = import.meta.env.VITE_RSVP_ENDPOINT
    if (!endpoint || endpoint.includes('REPLACE_ME')) {
      setStatus('error')
      setServerMessage('Анкета ещё не подключена. Пожалуйста, сообщите ответ Кристине по телефону или WhatsApp.')
      return
    }

    const payload: RsvpPayload = {
      fullName: form.fullName.trim(),
      attendance: form.attendance as Attendance,
      alcohol: isAttending ? form.alcohol : [],
      alcoholOther: isAttending ? form.alcoholOther.trim() : '',
      hasChildren: isAttending && form.children === 'yes',
      childrenCount: isAttending && form.children === 'yes' ? Number(form.childrenCount) : 0,
    }

    setStatus('submitting')
    setServerMessage('')

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({ ok: response.ok })) as { ok?: boolean; error?: string }
      if (!response.ok || result.ok === false) throw new Error(result.error || 'Не удалось отправить анкету')
      setStatus('success')
    } catch {
      setStatus('error')
      setServerMessage('Не удалось отправить ответ. Проверьте интернет и попробуйте ещё раз или напишите Кристине.')
    }
  }

  if (status === 'success') {
    return (
      <div className="rsvp-success" role="status">
        <span aria-hidden="true">✦</span>
        <h3>Ваш ответ принят</h3>
        <p>{isAttending ? 'До встречи в нашей восточной сказке!' : 'Спасибо, что дали нам знать.'}</p>
      </div>
    )
  }

  return (
    <form className="rsvp-form" onSubmit={submit} noValidate>
      <div className="form-field form-field--wide">
        <label htmlFor="fullName">Ваши имя и фамилия</label>
        <input
          id="fullName"
          name="fullName"
          value={form.fullName}
          onChange={(event) => update('fullName', event.target.value)}
          placeholder="Например, Анна Иванова"
          autoComplete="name"
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
        />
        {errors.fullName && <span className="field-error" id="fullName-error">{errors.fullName}</span>}
      </div>

      <fieldset className="form-field form-field--wide">
        <legend>Сможете ли вы быть с нами?</legend>
        <div className="choice-row choice-row--two">
          <Choice checked={form.attendance === 'yes'} name="attendance" label="Буду" onChange={() => update('attendance', 'yes')} />
          <Choice checked={form.attendance === 'no'} name="attendance" label="Не смогу присутствовать" onChange={() => update('attendance', 'no')} />
        </div>
        {errors.attendance && <span className="field-error">{errors.attendance}</span>}
      </fieldset>

      {isAttending && (
        <>
          <fieldset className="form-field form-field--wide form-appear">
            <legend>Какой алкоголь вы предпочитаете?</legend>
            <p className="field-hint">Можно выбрать несколько вариантов</p>
            <div className="choice-grid">
              {alcoholOptions.map((option) => (
                <Choice
                  key={option}
                  type="checkbox"
                  checked={form.alcohol.includes(option)}
                  name="alcohol"
                  label={option}
                  onChange={() => toggleAlcohol(option)}
                />
              ))}
            </div>
            {errors.alcohol && <span className="field-error">{errors.alcohol}</span>}
          </fieldset>

          {form.alcohol.includes('Другое') && (
            <div className="form-field form-field--wide form-appear">
              <label htmlFor="alcoholOther">Ваш вариант</label>
              <input
                id="alcoholOther"
                value={form.alcoholOther}
                onChange={(event) => update('alcoholOther', event.target.value)}
                placeholder="Напишите, что предпочитаете"
                aria-invalid={Boolean(errors.alcoholOther)}
              />
              {errors.alcoholOther && <span className="field-error">{errors.alcoholOther}</span>}
            </div>
          )}

          <fieldset className="form-field form-appear">
            <legend>Будут ли с вами дети?</legend>
            <div className="choice-row choice-row--two">
              <Choice checked={form.children === 'yes'} name="children" label="Да" onChange={() => update('children', 'yes')} />
              <Choice checked={form.children === 'no'} name="children" label="Нет" onChange={() => update('children', 'no')} />
            </div>
            {errors.children && <span className="field-error">{errors.children}</span>}
          </fieldset>

          {form.children === 'yes' && (
            <div className="form-field form-appear">
              <label htmlFor="childrenCount">Количество детей</label>
              <input
                id="childrenCount"
                type="number"
                inputMode="numeric"
                min="1"
                max="10"
                value={form.childrenCount}
                onChange={(event) => update('childrenCount', event.target.value)}
                placeholder="1"
                aria-invalid={Boolean(errors.childrenCount)}
              />
              {errors.childrenCount && <span className="field-error">{errors.childrenCount}</span>}
            </div>
          )}
        </>
      )}

      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Ваш сайт</label>
        <input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update('website', event.target.value)} />
      </div>

      {status === 'error' && <p className="form-server-error" role="alert">{serverMessage}</p>}

      <button className="gold-button form-submit" type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Отправляем…' : 'Подтвердить ответ'}
      </button>
      <p className="form-deadline">Пожалуйста, ответьте до {eventConfig.rsvpDeadline}</p>
    </form>
  )
}

type ChoiceProps = {
  checked: boolean
  name: string
  label: string
  onChange: () => void
  type?: 'radio' | 'checkbox'
}

function Choice({ checked, name, label, onChange, type = 'radio' }: ChoiceProps) {
  return (
    <label className={`choice${checked ? ' is-checked' : ''}`}>
      <input type={type} name={name} checked={checked} onChange={onChange} />
      <span className="choice__mark" aria-hidden="true" />
      <span>{label}</span>
    </label>
  )
}
