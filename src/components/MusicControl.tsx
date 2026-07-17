import { useRef, useState } from 'react'

const defaultTrack = `${import.meta.env.BASE_URL}music/arabskaya-noch.mp3`

export function MusicControl() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [message, setMessage] = useState('')
  const musicUrl = import.meta.env.VITE_MUSIC_URL || defaultTrack

  async function toggleMusic() {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    try {
      await audio.play()
      setIsPlaying(true)
      setMessage('')
    } catch {
      setMessage('Музыкальный файл будет добавлен чуть позже')
      setIsPlaying(false)
    }
  }

  return (
    <div className="music-wrap">
      <audio
        ref={audioRef}
        src={musicUrl}
        preload="none"
        loop
        onEnded={() => setIsPlaying(false)}
        onError={() => setMessage('Музыкальный файл будет добавлен чуть позже')}
      />
      <button
        className={`music-control${isPlaying ? ' is-playing' : ''}`}
        type="button"
        onClick={toggleMusic}
        aria-label={isPlaying ? 'Поставить музыку на паузу' : 'Включить музыку'}
        aria-pressed={isPlaying}
      >
        <span className="music-control__icon" aria-hidden="true">{isPlaying ? 'Ⅱ' : '♪'}</span>
        <span className="music-control__copy">
          <small>{isPlaying ? 'Сейчас звучит' : 'Музыка вечера'}</small>
          <strong>Арабская ночь</strong>
        </span>
      </button>
      {message && <span className="music-message" role="status">{message}</span>}
    </div>
  )
}
