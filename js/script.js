(() => {
  'use strict';
  const config = window.INVITATION_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Smooth reveal.
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Map URL kept in config for quick replacement.
  const mapLink = $('.map-link');
  if (mapLink && config.mapUrl) mapLink.href = config.mapUrl;

  // Keep media completely idle until the guest explicitly opens the invitation.
  const audio = $('#background-music');
  const musicButton = $('.music-button');
  const toast = $('#toast');
  const musicSource = config.musicFile || audio?.dataset.src || '';
  let toastTimer;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  };

  const syncMusicButton = () => {
    musicButton?.setAttribute('aria-pressed', String(Boolean(audio && !audio.paused)));
  };

  const ensureMusicSource = () => {
    if (!audio || !musicSource || audio.hasAttribute('src')) return;
    audio.src = musicSource;
    audio.load();
  };

  const startMusic = async (reportFailure = false) => {
    if (!audio || !musicSource) return false;
    if (!audio.paused) {
      syncMusicButton();
      return true;
    }
    ensureMusicSource();
    try {
      await audio.play();
      return true;
    } catch {
      syncMusicButton();
      if (reportFailure) showToast('Не удалось включить музыку. Попробуйте ещё раз.');
      return false;
    }
  };

  audio?.addEventListener('play', syncMusicButton);
  audio?.addEventListener('pause', syncMusicButton);
  audio?.addEventListener('error', syncMusicButton);
  syncMusicButton();

  // Prevent wheel, swipe and keyboard scrolling until the hero button is used.
  let invitationOpened = !document.documentElement.classList.contains('invitation-locked');
  const scrollKeys = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ']);
  const preventLockedScroll = (event) => {
    if (!invitationOpened) event.preventDefault();
  };
  const preventLockedKeyboardScroll = (event) => {
    const interactiveSpace = event.key === ' '
      && event.target instanceof Element
      && event.target.closest('button, input, select, textarea, a');
    if (!invitationOpened && scrollKeys.has(event.key) && !interactiveSpace) event.preventDefault();
  };

  document.addEventListener('wheel', preventLockedScroll, { passive: false });
  document.addEventListener('touchmove', preventLockedScroll, { passive: false });
  document.addEventListener('keydown', preventLockedKeyboardScroll, { capture: true });

  const unlockInvitation = () => {
    if (invitationOpened) return;
    invitationOpened = true;
    document.documentElement.classList.remove('invitation-locked');
    document.removeEventListener('wheel', preventLockedScroll);
    document.removeEventListener('touchmove', preventLockedScroll);
    document.removeEventListener('keydown', preventLockedKeyboardScroll, { capture: true });
  };

  $('.hero-open')?.addEventListener('click', () => {
    unlockInvitation();
    void startMusic();
    $('#program')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  musicButton?.addEventListener('click', async () => {
    if (!audio) return;
    if (audio.paused) await startMusic(true);
    else audio.pause();
  });

  // Countdown to Chelyabinsk time (UTC+5).
  const target = new Date(config.eventDate || '2026-10-24T17:00:00+05:00').getTime();
  const numberNodes = {
    days: $('.countdown-days'),
    hours: $('.countdown-hours'),
    minutes: $('.countdown-minutes'),
    seconds: $('.countdown-seconds')
  };
  const finishedNode = $('.countdown-finished');
  const pad = (value, length = 2) => String(value).padStart(length, '0');

  const updateCountdown = () => {
    let diff = target - Date.now();
    if (diff <= 0) {
      diff = 0;
      if (finishedNode) finishedNode.hidden = false;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    if (numberNodes.days) numberNodes.days.textContent = String(days);
    if (numberNodes.hours) numberNodes.hours.textContent = pad(hours);
    if (numberNodes.minutes) numberNodes.minutes.textContent = pad(minutes);
    if (numberNodes.seconds) numberNodes.seconds.textContent = pad(seconds);
  };
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // RSVP form behavior.
  const form = $('#guest-form');
  const children = $('#children');
  const childrenCount = $('#childrenCount');
  children?.addEventListener('change', () => {
    const hasChildren = children.value === 'Да';
    if (childrenCount) {
      childrenCount.disabled = !hasChildren;
      childrenCount.required = hasChildren;
      if (!hasChildren) childrenCount.value = '0';
    }
  });

  const status = $('.form-status');
  const submitButton = $('.submit-button');
  const googleScriptUrl = typeof config.googleScriptUrl === 'string'
    ? config.googleScriptUrl.trim()
    : '';
  const hasGoogleEndpoint = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(googleScriptUrl);
  const setStatus = (message, type = '') => {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status ${type}`.trim();
  };

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus('Пожалуйста, заполните обязательные поля.', 'error');
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    data.childrenCount = data.children === 'Да' ? (data.childrenCount || '0') : '0';
    data.submittedAt = new Date().toISOString();
    data.pageUrl = location.href;
    data.userAgent = navigator.userAgent;

    submitButton?.setAttribute('disabled', 'disabled');
    form.setAttribute('aria-busy', 'true');
    setStatus('Отправляем ответ…');

    try {
      if (hasGoogleEndpoint) {
        await fetch(googleScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(data)
        });
      } else {
        const saved = JSON.parse(localStorage.getItem('karina-rsvp') || '[]');
        saved.push(data);
        localStorage.setItem('karina-rsvp', JSON.stringify(saved));
        setStatus('Ответ сохранён только на этом устройстве. Google Таблица ещё не подключена.', 'pending');
        showToast('Нужно подключить Google Таблицу.');
        return;
      }
      setStatus('Спасибо! Ваш ответ отправлен.', 'success');
      form.reset();
      if (childrenCount) {
        childrenCount.disabled = true;
        childrenCount.required = false;
      }
      showToast('Спасибо! Ответ сохранён.');
    } catch (error) {
      console.error(error);
      setStatus('Не удалось отправить ответ. Проверьте интернет и попробуйте ещё раз.', 'error');
    } finally {
      submitButton?.removeAttribute('disabled');
      form.removeAttribute('aria-busy');
    }
  });
})();
