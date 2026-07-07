document.addEventListener('DOMContentLoaded', () => {
  const stationsList = document.getElementById('stations-list');
  const audio = document.getElementById('audio-player');
  const playBtn = document.getElementById('play-btn');
  const volumeSlider = document.getElementById('volume-slider');
  const volumeIcon = document.getElementById('volume-icon');
  const currentNameSpan = document.getElementById('current-station-name');

  let currentStation = null;
  let isPlaying = false;
  let hls = null;
  let retryCount = 0;
  const MAX_RETRIES = 2;

  function renderStations() {
    stationsList.innerHTML = '';
    stations.forEach((station, index) => {
      const item = document.createElement('div');
      item.className = 'station-item';
      item.setAttribute('role', 'listitem');
      item.setAttribute('tabindex', '0');
      item.dataset.index = index;
      item.innerHTML = `
        <span class="emoji">${station.emoji || '📡'}</span>
        <span class="sname">${station.name}</span>
        <span class="status-badge">▶️</span>
      `;
      const badge = item.querySelector('.status-badge');
      badge.style.opacity = '0';

      item.addEventListener('click', () => playStation(station, item));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          playStation(station, item);
        }
      });
      stationsList.appendChild(item);
    });

    const first = stationsList.querySelector('.station-item');
    if (first) first.focus();

    const items = Array.from(stationsList.querySelectorAll('.station-item'));
    document.addEventListener('keydown', (e) => {
      const active = document.activeElement;
      if (!active || !active.classList.contains('station-item')) return;
      const idx = items.indexOf(active);
      let newIdx = idx;
      if (e.key === 'ArrowDown') {
        newIdx = (idx + 1) % items.length;
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        newIdx = (idx - 1 + items.length) % items.length;
        e.preventDefault();
      } else return;
      items[newIdx].focus();
    });
  }

  function playStation(station, itemElement) {
    // Si es la misma estación, solo pausar/reanudar
    if (currentStation && currentStation.id === station.id) {
      togglePlayPause();
      return;
    }

    // Detener reproducción anterior
    audio.pause();
    if (hls) { hls.destroy(); hls = null; }
    retryCount = 0;

    const url = station.url;
    const isHls = url.includes('.m3u8') || url.includes('m3u8');

    // Función para intentar reproducir
    function attemptPlay(attemptUrl) {
      if (isHls && window.Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(attemptUrl);
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          audio.play().then(() => {
            setPlayingState(station, itemElement);
          }).catch(e => {
            handleError(station, attemptUrl);
          });
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            handleError(station, attemptUrl);
          }
        });
      } else {
        audio.src = attemptUrl;
        audio.load();
        audio.play().then(() => {
          setPlayingState(station, itemElement);
        }).catch(e => {
          handleError(station, attemptUrl);
        });
      }
    }

    // Manejador de errores con reintento
    function handleError(station, currentUrl) {
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        // Si estamos usando la URL original, probar con proxy
        if (currentUrl === station.url) {
          const proxyUrl = 'https://cors-anywhere.herokuapp.com/' + station.url;
          console.log(`Reintento ${retryCount} con proxy para ${station.name}`);
          attemptPlay(proxyUrl);
        } else {
          // Si ya estamos con proxy, probar sin proxy (o fallar)
          console.log(`Reintento ${retryCount} sin proxy para ${station.name}`);
          attemptPlay(station.url);
        }
      } else {
        // Si fallaron todos los intentos, mostrar mensaje pero no alertar si ya está sonando
        if (!audio.paused && audio.currentTime > 0) {
          // Ya está sonando, no hacer nada
          console.warn(`Error pero el audio ya está reproduciendo ${station.name}`);
          return;
        }
        alert(`No se pudo reproducir "${station.name}". Verifica la URL.`);
        resetPlayerUI();
      }
    }

    // Iniciar reproducción con la URL original (sin proxy primero)
    attemptPlay(url);

    // Actualizar UI de lista
    document.querySelectorAll('.station-item').forEach(el => {
      el.classList.remove('active');
      el.querySelector('.status-badge').style.opacity = '0';
    });
    if (itemElement) {
      itemElement.classList.add('active');
      const badge = itemElement.querySelector('.status-badge');
      badge.style.opacity = '1';
      badge.textContent = '🔊';
    }
    currentStation = station;
    currentNameSpan.textContent = station.name;
    playBtn.textContent = '⏸️';
    isPlaying = true;
  }

  function setPlayingState(station, itemElement) {
    // Actualizar badge
    document.querySelectorAll('.station-item').forEach(el => {
      el.classList.remove('active');
      el.querySelector('.status-badge').style.opacity = '0';
    });
    if (itemElement) {
      itemElement.classList.add('active');
      const badge = itemElement.querySelector('.status-badge');
      badge.style.opacity = '1';
      badge.textContent = '🔊';
    }
    currentStation = station;
    currentNameSpan.textContent = station.name;
    playBtn.textContent = '⏸️';
    isPlaying = true;
  }

  function togglePlayPause() {
    if (!currentStation) {
      const firstItem = stationsList.querySelector('.station-item');
      if (firstItem) {
        const idx = parseInt(firstItem.dataset.index);
        playStation(stations[idx], firstItem);
      }
      return;
    }
    if (audio.paused) {
      audio.play().then(() => {
        playBtn.textContent = '⏸️';
        isPlaying = true;
        document.querySelectorAll('.station-item').forEach(el => {
          if (el.classList.contains('active')) {
            el.querySelector('.status-badge').textContent = '🔊';
            el.querySelector('.status-badge').style.opacity = '1';
          }
        });
        currentNameSpan.textContent = currentStation.name;
      }).catch(e => console.warn('Error al reanudar:', e));
    } else {
      audio.pause();
      playBtn.textContent = '▶️';
      isPlaying = false;
      document.querySelectorAll('.station-item').forEach(el => {
        if (el.classList.contains('active')) {
          el.querySelector('.status-badge').textContent = '⏸️';
          el.querySelector('.status-badge').style.opacity = '1';
        }
      });
    }
  }

  function resetPlayerUI() {
    playBtn.textContent = '▶️';
    isPlaying = false;
    if (hls) { hls.destroy(); hls = null; }
    document.querySelectorAll('.station-item').forEach(el => {
      el.querySelector('.status-badge').style.opacity = '0';
      el.classList.remove('active');
    });
    if (currentStation) currentNameSpan.textContent = `${currentStation.name} (detenida)`;
  }

  // Eventos
  playBtn.addEventListener('click', togglePlayPause);
  volumeSlider.addEventListener('input', (e) => {
    const vol = e.target.value / 100;
    audio.volume = vol;
    volumeIcon.textContent = vol === 0 ? '🔇' : (vol < 0.5 ? '🔉' : '🔊');
  });

  audio.addEventListener('ended', () => {
    if (currentStation && isPlaying) {
      if (!hls) { audio.load(); audio.play().catch(() => resetPlayerUI()); }
    } else resetPlayerUI();
  });

  audio.addEventListener('error', (e) => {
    console.warn('Error en audio:', e);
    // No resetear inmediatamente, dejar que el manejo de errores de playStation actúe
  });

  document.getElementById('back-button').addEventListener('click', () => {
    audio.pause();
    if (hls) { hls.destroy(); hls = null; }
    audio.src = '';
    window.location.href = 'index.html';
  });

  renderStations();
  audio.volume = volumeSlider.value / 100;
});
