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

  // ========== PROXY DESACTIVADO ==========
  function getProxiedUrl(url) {
    return url; // Devuelve la URL original sin modificar
  }
  // ======================================

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
    if (currentStation && currentStation.id === station.id) {
      togglePlayPause();
      return;
    }

    audio.pause();
    if (hls) { hls.destroy(); hls = null; }

    const url = getProxiedUrl(station.url);
    const isHls = url.includes('.m3u8') || url.includes('m3u8');

    function attemptPlay() {
      if (isHls && window.Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          audio.play().then(() => setPlayingState(station, itemElement))
            .catch(() => showError(station));
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) showError(station);
        });
      } else {
        audio.src = url;
        audio.load();
        audio.play().then(() => setPlayingState(station, itemElement))
          .catch(() => showError(station));
      }
    }

    function showError(station) {
      alert(`No se pudo reproducir "${station.name}". Verifica la URL o intenta más tarde.`);
      resetPlayerUI();
    }

    attemptPlay();

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

  function setPlayingState(station, item) {
    // Ya se maneja en playStation
  }

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
