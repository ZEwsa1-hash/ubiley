import { useEffect } from 'react'
import { Countdown } from './components/Countdown'
import { MusicControl } from './components/MusicControl'
import { RsvpForm } from './components/RsvpForm'
import { eventConfig } from './eventConfig'
import { useReveal } from './hooks/useReveal'

const base = import.meta.env.BASE_URL

function App() {
  useReveal()

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    let frame = 0
    const updateParallax = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--hero-shift', `${Math.min(window.scrollY * 0.16, 100)}px`)
      })
    }
    window.addEventListener('scroll', updateParallax, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateParallax)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <main>
      <header className="topbar">
        <a className="monogram" href="#top" aria-label="В начало страницы">К</a>
        <nav className="topnav" aria-label="Навигация по приглашению">
          <a href="#story">О Карине</a>
          <a href="#program">Программа</a>
          <a href="#venue">Место</a>
          <a href="#rsvp">Анкета</a>
        </nav>
        <MusicControl />
      </header>

      <section className="hero" id="top">
        <div className="hero__backdrop" aria-hidden="true" />
        <div className="stars" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
        </div>
        <div className="hero__content">
          <p className="eyebrow hero__eyebrow">Приглашение на день рождения</p>
          <div className="hero__title-wrap">
            <span className="hero__pretitle">Карине</span>
            <h1>{eventConfig.age}</h1>
          </div>
          <p className="hero__tagline">Приглашаем Вас в сказку</p>
          <div className="hero__date" aria-label={`${eventConfig.dateLabel}, начало в ${eventConfig.timeLabel}`}>
            <span>24</span>
            <div><strong>октября</strong><small>2026 · {eventConfig.timeLabel}</small></div>
          </div>
          <a className="hero__scroll" href="#story">
            <span>Открыть приглашение</span>
            <i aria-hidden="true">↓</i>
          </a>
        </div>
      </section>

      <section className="story section" id="story">
        <div className="section-glow section-glow--left" aria-hidden="true" />
        <div className="container story__grid">
          <div className="portrait-frame" data-reveal>
            <div className="portrait-frame__arch">
              <img src={`${base}images/karina.webp`} alt="Карина в образе восточной принцессы" />
            </div>
            <span className="portrait-frame__spark portrait-frame__spark--one" aria-hidden="true">✦</span>
            <span className="portrait-frame__spark portrait-frame__spark--two" aria-hidden="true">✧</span>
          </div>
          <div className="story__copy" data-reveal>
            <SectionKicker>Главная героиня вечера</SectionKicker>
            <h2>Карина,<br /><em>она же Жасмин</em></h2>
            <div className="ornament" aria-hidden="true"><span>◆</span></div>
            <p>Карина — воплощение доброты, мудрости и вдохновения. Её сердце освещает путь близким, а энергия создаёт вокруг неё атмосферу волшебства.</p>
            <p className="story__final">Этот вечер — для неё<br />и вместе с ней.</p>
          </div>
        </div>
      </section>

      <section className="countdown-section section" aria-labelledby="countdown-heading">
        <div className="container" data-reveal>
          <SectionKicker>До встречи осталось</SectionKicker>
          <h2 id="countdown-heading">Время до волшебства</h2>
          <Countdown targetDate={eventConfig.dateISO} />
          <p className="timezone-note">Отсчёт идёт по времени Челябинска</p>
        </div>
      </section>

      <section className="program section" id="program">
        <div className="container">
          <div className="section-heading" data-reveal>
            <SectionKicker>Одна ночь · тысяча воспоминаний</SectionKicker>
            <h2>Программа вечера</h2>
            <p>Каждая глава этой сказки начнётся вовремя</p>
          </div>
          <div className="timeline">
            {eventConfig.program.map((item, index) => (
              <article className="timeline__item" data-reveal style={{ '--delay': `${index * 90}ms` } as React.CSSProperties} key={item.time}>
                <div className="timeline__time">{item.time}</div>
                <div className="timeline__gem" aria-hidden="true"><span>◆</span></div>
                <div className="timeline__copy">
                  <h3>{item.title}</h3>
                  <p>{item.note}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="venue section" id="venue">
        <div className="container venue__grid">
          <div className="venue__image-wrap" data-reveal>
            <img src={`${base}images/venue.webp`} alt="Интерьер банкетного зала Панорама Аморе" />
            <span className="venue__number" aria-hidden="true">01</span>
          </div>
          <div className="venue__copy" data-reveal>
            <SectionKicker>Место встречи</SectionKicker>
            <h2>Там, где<br /><em>оживает сказка</em></h2>
            <p className="venue__type">{eventConfig.venue.type}</p>
            <h3>«{eventConfig.venue.name}»</h3>
            <p className="venue__address">{eventConfig.venue.address}</p>
            <a className="gold-button" href={eventConfig.venue.mapUrl} target="_blank" rel="noreferrer">
              <MapPinIcon />
              Открыть в Яндекс Картах
            </a>
          </div>
        </div>
      </section>

      <section className="dress section" id="dress-code">
        <div className="container dress__grid">
          <div className="dress__copy" data-reveal>
            <SectionKicker>Дресс-код</SectionKicker>
            <h2>{eventConfig.dressCode.title}</h2>
            <p>{eventConfig.dressCode.description}</p>
            <div className="palette" aria-label="Рекомендуемая палитра">
              <span style={{ background: '#071a45' }} title="Глубокий синий" />
              <span style={{ background: '#3b1766' }} title="Фиолетовый" />
              <span style={{ background: '#0d716d' }} title="Изумрудный" />
              <span style={{ background: '#c73d85' }} title="Фуксия" />
              <span style={{ background: '#e1aa46' }} title="Золото" />
            </div>
            <p className="dress__note">Позвольте образу быть ярким — сегодня можно всё.</p>
          </div>
          <div className="dress__image" data-reveal>
            <img src={`${base}images/dress-code.webp`} alt="Бархатная подушка с золотым восточным орнаментом" />
          </div>
        </div>
      </section>

      <section className="wishes section">
        <div className="container">
          <div className="section-heading" data-reveal>
            <SectionKicker>Несколько пожеланий</SectionKicker>
            <h2>Главное — быть рядом</h2>
          </div>
          <div className="wish-grid">
            <article className="wish-card" data-reveal>
              <span className="wish-card__icon" aria-hidden="true">✦</span>
              <h3>Вместо цветов</h3>
              <p>Карина будет рада бутылке любимого напитка или сертификату — пусть подарок продолжит радовать после праздника.</p>
            </article>
            <article className="wish-card wish-card--accent" data-reveal>
              <span className="wish-card__icon" aria-hidden="true">☾</span>
              <h3>Творческие сюрпризы</h3>
              <p>Если вы готовите номер, поздравление или секрет, заранее свяжитесь с организатором или ведущим.</p>
            </article>
            <article className="wish-card" data-reveal>
              <span className="wish-card__icon" aria-hidden="true">♡</span>
              <h3>Тёплое настроение</h3>
              <p>Берите с собой улыбки, желание танцевать и готовность стать частью нашей восточной сказки.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="rsvp section" id="rsvp">
        <div className="rsvp__backdrop" aria-hidden="true" />
        <div className="container rsvp__inner">
          <div className="section-heading rsvp__heading" data-reveal>
            <SectionKicker>Станете частью истории?</SectionKicker>
            <h2>Анкета гостя</h2>
            <p>Ваш ответ поможет нам окружить каждого заботой</p>
          </div>
          <div className="rsvp__panel" data-reveal>
            <RsvpForm />
          </div>
        </div>
      </section>

      <section className="contacts section" id="contacts">
        <div className="container">
          <div className="section-heading" data-reveal>
            <SectionKicker>Мы всегда на связи</SectionKicker>
            <h2>Остались вопросы?</h2>
            <p>Звоните или пишите по вопросам творческих подарков, сюрпризов и организации</p>
          </div>
          <div className="contact-grid">
            {eventConfig.contacts.map((contact) => (
              <article className="contact-card" data-reveal key={contact.name}>
                <small>{contact.role}</small>
                <h3>{contact.name}</h3>
                <a className="contact-card__phone" href={`tel:${contact.phoneLink}`}>{contact.phone}</a>
                <div className="contact-card__actions">
                  <a href={`tel:${contact.phoneLink}`} aria-label={`Позвонить: ${contact.name}`}><PhoneIcon />Позвонить</a>
                  <a href={`https://wa.me/${contact.whatsApp}`} target="_blank" rel="noreferrer" aria-label={`Написать в WhatsApp: ${contact.name}`}><MessageIcon />WhatsApp</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer__ornament" aria-hidden="true">✦</div>
        <p className="footer__script">До встречи в сказке</p>
        <p>{eventConfig.dateLabel} · {eventConfig.celebrant} {eventConfig.age}</p>
        <a href="#top">Наверх ↑</a>
      </footer>
    </main>
  )
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return <p className="section-kicker"><span aria-hidden="true" />{children}<span aria-hidden="true" /></p>
}

function MapPinIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
}

function PhoneIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 3h3l1.5 4.3-2 1.7a15.6 15.6 0 0 0 5.3 5.3l1.7-2 4.3 1.5v3c0 1.2-1 2.2-2.2 2.2A15.8 15.8 0 0 1 3 3.2C3 2 4 1 5.2 1" /></svg>
}

function MessageIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2-5.2A8.5 8.5 0 1 1 21 11.5Z" /><path d="M8 9.5c1.3 2.5 2.3 3.5 5 5" /></svg>
}

export default App
