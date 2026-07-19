// Reproductor embebido compartido por todas las páginas de TV
// (TV Brasil, TV Argentina, TV Deportes, TV Cultural, TV Internacional).
// Cada página solo define su propio array de canales y llama a initTvChannels(canales).

function initTvChannels(channels) {
  document.addEventListener('DOMContentLoaded', () => {
    const channelsList = document.getElementById('channels-list');
    const playerWrap = document.getElementById('player-wrap');
    const video = document.getElementById('tv-video');
    const currentNameSpan = document.getElementById('current-channel-name');
    const closePlayerBtn = document.getElementById('close-player');

    let currentChannel = null;
    let hls = null;
    let attemptToken = 0; // evita que intentos viejos (de otro canal) sigan corriendo
    let fallbackTab = null;

    function closeFallbackTab() {
      if (fallbackTab && !fallbackTab.closed) {
        try { fallbackTab.close(); } catch (e) { /* ignore */ }
      }
      fallbackTab = null;
    }

    // ========== PROXY (opcional) ==========
    // Si en algún momento desplegás tu propio proxy (por ejemplo un Cloudflare
    // Worker), pegá acá la URL base y se usará como último recurso cuando un
    // canal no pueda reproducirse ni en su URL original ni en su versión https.
    // Ejemplo: 'https://mi-proxy.mi-usuario.workers.dev/?url='
    const PROXY_BASE = '';
    // =======================================

    const pageIsSecure = window.location.protocol === 'https:';

    // Genera la lista de URLs candidatas a intentar, en orden, para un canal.
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

    function renderChannels() {
      channelsList.innerHTML = '';
      channels.forEach((channel, index) => {
        const item = document.createElement('div');
        item.className = 'channel-item';
        item.setAttribute('role', 'listitem');
        item.setAttribute('tabindex', '0');
        item.dataset.index = index;

        item.innerHTML = `
          <span class="emoji">${channel.emoji || '📺'}</span>
          <span class="cname">${channel.name}</span>
          <span class="badge">▶️</span>
        `;

        item.addEventListener('click', () => playChannel(channel, item));
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            playChannel(channel, item);
          }
        });

        channelsList.appendChild(item);
      });

      const first = channelsList.querySelector('.channel-item');
      if (first) first.focus();

      const items = Array.from(channelsList.querySelectorAll('.channel-item'));
      document.addEventListener('keydown', (e) => {
        const active = document.activeElement;
        if (!active || !active.classList.contains('channel-item')) return;
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

    function markActiveItem(itemElement) {
      document.querySelectorAll('.channel-item').forEach(el => {
        el.classList.remove('active');
        const b = el.querySelector('.badge');
        if (b) b.textContent = '▶️';
      });
      if (itemElement) {
        itemElement.classList.add('active');
        const b = itemElement.querySelector('.badge');
        if (b) b.textContent = '🔴';
      }
    }

    function playChannel(channel, itemElement) {
      const myToken = ++attemptToken;

      video.pause();
      if (hls) { hls.destroy(); hls = null; }
      video.removeAttribute('src');
      video.load();
      closeFallbackTab();

      // Abrimos una pestaña en blanco YA, dentro del mismo click del usuario.
      // Así, si el reproductor embebido no puede con el canal (bloqueo por
      // contenido mixto, códec no soportado, etc.), podemos navegarla al
      // stream original como respaldo, sin que el navegador la bloquee como
      // popup (los popups solo se permiten si se originan en un gesto del
      // usuario, y aquí lo hacemos de entrada por las dudas).
      try { fallbackTab = window.open('', '_blank'); } catch (e) { fallbackTab = null; }

      playerWrap.hidden = false;
      playerWrap.classList.remove('has-error');
      currentNameSpan.textContent = `Cargando ${channel.name}...`;
      playerWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });

      const candidates = buildCandidateUrls(channel.url);
      let candidateIndex = 0;

      function openFallbackTab() {
        if (myToken !== attemptToken) return;
        if (fallbackTab && !fallbackTab.closed) {
          currentNameSpan.textContent = `"${channel.name}" no se pudo reproducir embebido (bloqueo del navegador o códec no soportado). Lo abrimos en una pestaña nueva.`;
          fallbackTab.location.href = channel.url;
        } else {
          currentNameSpan.textContent = `No se pudo reproducir "${channel.name}" embebido, y el navegador bloqueó la pestaña de respaldo. Abrilo manualmente: ${channel.url}`;
          playerWrap.classList.add('has-error');
        }
      }

      function tryNextCandidate() {
        if (myToken !== attemptToken) return;
        if (candidateIndex >= candidates.length) {
          openFallbackTab();
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
        video.removeAttribute('src');
        playerWrap.classList.remove('has-error');

        if (isHls && window.Hls && Hls.isSupported()) {
          hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (myToken !== attemptToken) return;
            video.play()
              .then(() => onPlaySuccess())
              .catch(() => tryNextCandidate());
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (myToken !== attemptToken) return;
            if (data.fatal) tryNextCandidate();
          });
        } else if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari e iOS reproducen HLS de forma nativa, sin hls.js
          video.src = url;
          video.load();
          video.play()
            .then(() => onPlaySuccess())
            .catch(() => tryNextCandidate());
        } else {
          video.src = url;
          video.load();
          video.play()
            .then(() => onPlaySuccess())
            .catch(() => tryNextCandidate());
        }
      }

      function onPlaySuccess() {
        if (myToken !== attemptToken) return;
        closeFallbackTab();
        currentChannel = channel;
        currentNameSpan.textContent = channel.name;
        markActiveItem(itemElement);
      }

      tryNextCandidate();
    }

    if (closePlayerBtn) {
      closePlayerBtn.addEventListener('click', () => {
        video.pause();
        if (hls) { hls.destroy(); hls = null; }
        video.removeAttribute('src');
        video.load();
        closeFallbackTab();
        playerWrap.hidden = true;
        playerWrap.classList.remove('has-error');
        currentChannel = null;
        document.querySelectorAll('.channel-item').forEach(el => {
          el.classList.remove('active');
          const b = el.querySelector('.badge');
          if (b) b.textContent = '▶️';
        });
      });
    }

    document.getElementById('back-button').addEventListener('click', () => {
      video.pause();
      if (hls) { hls.destroy(); hls = null; }
      video.src = '';
      closeFallbackTab();
      window.location.href = 'index.html';
    });

    renderChannels();
  });
}
