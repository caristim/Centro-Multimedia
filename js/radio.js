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
  let attemptToken = 0; // evita que intentos viejos (de otra radio) sigan corriendo

  // ========== PROXY (opcional) ==========
  // Si en algún momento desplegás tu propio proxy (por ejemplo un Cloudflare
  // Worker, ver "cloudflare-worker-proxy.js.txt" incluido junto a este proyecto),
  // pegá acá la URL base y se usará como último recurso cuando una radio no
  // pueda reproducirse ni en su URL original ni en su versión https.
  // Ejemplo: 'https://mi-proxy.mi-usuario.workers.dev/?url='
  const PROXY_BASE = '';
  // =======================================

  const pageIsSecure = window.location.protocol === 'https:';

  // Genera la lista de URLs candidatas a intentar, en orden, para una emisora.
  function buildCandidateUrls(originalUrl) {
    const candidates = [];
    const isInsecure = originalUrl.startsWith('http://');

    if (isInsecure && pageIsSecure) {
      // La página es https y el stream es http: el navegador va a bloquear
      // esto por "contenido mixto". Probamos primero la versión https del
      // mismo servidor, que muchas veces sí funciona.
      candidates.push({
        url: 'https://' + originalUrl.slice('http://'.length),
        upgraded: true
      });
      // Dejamos la original como intento de respaldo (funcionará si el
      // usuario abre el archivo localmente o desde un sitio http).
      candidates.push({ url: originalUrl, upgraded: false, insecure: true });
    } else {
      candidates.push({ url: originalUrl, upgraded: false });
    }

    if (PROXY_BASE) {
      candidates.push({
        url: PROXY_BASE + encodeURIComponent(originalUrl),
        upgraded: false,
        proxied: true
      });
    }

    return candidates;
  }

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

    const myToken = ++attemptToken;

    audio.pause();
    if (hls) { hls.destroy(); hls = null; }

    const candidates = buildCandidateUrls(station.url);
    let candidateIndex = 0;

    function showError(lastCandidate) {
      if (myToken !== attemptToken) return; // el usuario ya cambió de radio
      const wasInsecure = lastCandidate && lastCandidate.insecure;
      const msg = wasInsecure
        ? `No se pudo reproducir "${station.name}". El navegador bloqueó la conexión insegura (http) de esta emisora. El servidor de la radio no ofrece una versión https disponible.`
        : `No se pudo reproducir "${station.name}". Verifica la URL o intenta más tarde.`;
      alert(msg);
      resetPlayerUI();
    }

    function tryNextCandidate() {
      if (myToken !== attemptToken) return;
      if (candidateIndex >= candidates.length) {
        showError(candidates[candidates.length - 1]);
        return;
      }
      const candidate = candidates[candidateIndex];
      candidateIndex++;
      attemptPlay(candidate);
    }

    function attemptPlay(candidate) {
      const url = candidate.url;
      const isHls = url.includes('.m3u8');

      if (hls) { hls.destroy(); hls = null; }
      audio.removeAttribute('src');

      if (isHls && window.Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (myToken !== attemptToken) return;
          audio.play()
            .then(() => onPlaySuccess(candidate))
            .catch(() => tryNextCandidate());
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (myToken !== attemptToken) return;
          if (data.fatal) tryNextCandidate();
        });
      } else if (isHls && audio.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari reproduce HLS de forma nativa, sin hls.js
        audio.src = url;
        audio.load();
        audio.play()
          .then(() => onPlaySuccess(candidate))
          .catch(() => tryNextCandidate());
      } else {
        audio.src = url;
        audio.load();
        audio.play()
          .then(() => onPlaySuccess(candidate))
          .catch(() => tryNextCandidate());
      }
    }

    function onPlaySuccess(candidate) {
      if (myToken !== attemptToken) return;
      setPlayingState(station, itemElement);

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

    tryNextCandidate();
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
    // Ya se maneja en onPlaySuccess
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
