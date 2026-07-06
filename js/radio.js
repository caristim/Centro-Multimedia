// js/radio.js
document.addEventListener('DOMContentLoaded', () => {
  const stationsList = document.getElementById('stations-list');
  const audio = document.getElementById('audio-player');
  const playBtn = document.getElementById('play-btn');
  const volumeSlider = document.getElementById('volume-slider');
  const volumeIcon = document.getElementById('volume-icon');
  const currentNameSpan = document.getElementById('current-station-name');

  let currentStation = null;
  let isPlaying = false;
  let hls = null; // instancia de Hls

  // ----------------- PROXY CORS (opcional) -----------------
  // Si algunas radios requieren proxy, descomenta y usa:
  // const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
  // function getStreamUrl(url) { return CORS_PROXY + url; }
  // Para no usar proxy, simplemente devolvemos la url original.
  function getStreamUrl(url) {
    return url; // sin proxy por defecto
  }
  // ---------------------------------------------------------

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
      } else {
        return;
      }
      items[newIdx].focus();
    });
  }

  function playStation(station, itemElement) {
    // Si es la misma estación, toggle play/pause
    if (currentStation && currentStation.id === station.id) {
      togglePlayPause();
      return;
    }

    // Detener cualquier reproducción anterior
    stopCurrentPlayback();

    const url = getStreamUrl(station.url);
    const isHls = url.includes('.m3u8') || url.includes('m3u8');

    if (isHls && window.Hls && Hls.isSupported()) {
      // --- Reproducción con hls.js ---
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(url);
      hls.attachMedia(audio);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        audio.play()
          .then(() => {
            setPlayingState(station, itemElement);
          })
          .catch(err => {
            console.warn('Error al reproducir HLS:', err);
            alert(`No se pudo reproducir "${station.name}". Verifica la URL.`);
            resetPlayerUI();
          });
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('Error fatal en HLS:', data);
          alert(`Error al reproducir "${station.name}". El stream podría no estar disponible.`);
          resetPlayerUI();
          // Intentar recargar?
        }
      });
    } else {
      // --- Reproducción directa con audio (MP3, AAC, etc.) ---
      audio.src = url;
      audio.load();
      audio.play()
        .then(() => {
          setPlayingState(station, itemElement);
        })
        .catch(error => {
          console.warn('Error al reproducir (CORS o formato):', error);
          alert(`No se pudo reproducir "${station.name}". Puede ser por CORS o formato no soportado.`);
          resetPlayerUI();
        });
    }

    // Actualizar UI
    document.querySelectorAll('.station-item').forEach(el => {
      el.classList.remove('active');
      const badge = el.querySelector('.status-badge');
      badge.style.opacity = '0';
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

  function stopCurrentPlayback() {
    // Detener hls si existe
    if (hls) {
      hls.destroy();
      hls = null;
    }
    audio.pause();
    audio.src = '';
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
          const badge = el.querySelector('.status-badge');
          if (el.classList.contains('active')) {
            badge.textContent = '🔊';
            badge.style.opacity = '1';
          }
        });
        currentNameSpan.textContent = currentStation.name;
      }).catch(e => console.warn('Error al reanudar:', e));
    } else {
      audio.pause();
      playBtn.textContent = '▶️';
      isPlaying = false;
      document.querySelectorAll('.station-item').forEach(el => {
        const badge = el.querySelector('.status-badge');
        if (el.classList.contains('active')) {
          badge.textContent = '⏸️';
          badge.style.opacity = '1';
        }
      });
    }
  }

  function resetPlayerUI() {
    playBtn.textContent = '▶️';
    isPlaying = false;
    document.querySelectorAll('.station-item').forEach(el => {
      const badge = el.querySelector('.status-badge');
      badge.style.opacity = '0';
      el.classList.remove('active');
    });
    if (currentStation) {
      currentNameSpan.textContent = `${currentStation.name} (detenida)`;
    }
  }

  function setPlayingState(station, item) {
    // ya se actualiza en playStation
  }

  // Eventos del reproductor
  playBtn.addEventListener('click', togglePlayPause);

  volumeSlider.addEventListener('input', (e) => {
    const vol = e.target.value / 100;
    audio.volume = vol;
    volumeIcon.textContent = vol === 0 ? '🔇' : (vol < 0.5 ? '🔉' : '🔊');
  });

  audio.addEventListener('ended', () => {
    // Si el stream termina y estábamos reproduciendo, intentamos recargar
    if (currentStation && isPlaying) {
      if (hls) {
        // hls maneja el rebuffer automáticamente, no hacemos nada
      } else {
        audio.load();
        audio.play().catch(() => resetPlayerUI());
      }
    } else {
      resetPlayerUI();
    }
  });

  audio.addEventListener('error', (e) => {
    console.warn('Error en el audio:', e);
    // Si es un error de red, podemos intentar recargar
    if (audio.error && audio.error.code === 4) {
      alert('El stream no permite conexión desde esta página (CORS) o la URL no es válida.');
    }
    resetPlayerUI();
  });

  document.getElementById('back-button').addEventListener('click', () => {
    stopCurrentPlayback();
    window.location.href = 'index.html';
  });

  renderStations();
  audio.volume = volumeSlider.value / 100;
});
