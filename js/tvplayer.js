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

    // ========== PROXY (opcional) ==========
    // Si en algún momento desplegás tu propio proxy (por ejemplo un Cloudflare
    // Worker), pegá acá la URL base y se usará como último recurso cuando un
    // canal no pueda reproducirse ni en su URL original ni en su versión https.
    // Ejemplo: 'https://mi-proxy.mi-usuario.workers.dev/?url='
    const PROXY_BASE = '';
    // =======================================

    const pageIsSecure = window.location.protocol === 'https:';

    // Genera la lista de URLs candidatas a intentar, en orden, para un canal.
    // (Los canales http:// ya se filtran antes de llegar acá, ver playChannel).
    function buildCandidateUrls(originalUrl) {
      const candidates = [{ url: originalUrl }];
      if (PROXY_BASE) {
        candidates.push({
          url: PROXY_BASE + encodeURIComponent(originalUrl),
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

    // Muestra, dentro de la barra del reproductor, un aviso con un botón para
    // abrir el canal en una pestaña nueva. El click en ese botón es un gesto
    // real del usuario, así que el navegador SIEMPRE lo deja abrir — a
    // diferencia de intentar abrirlo solo por código, que es poco confiable.
    function showOpenExternallyPrompt(channel, message) {
      currentNameSpan.innerHTML = '';
      const span = document.createElement('span');
      span.textContent = message;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'open-external-btn';
      btn.textContent = '🔗 Abrir en pestaña nueva';
      btn.addEventListener('click', () => {
        window.open(channel.url, '_blank');
      });
      currentNameSpan.appendChild(span);
      currentNameSpan.appendChild(btn);
      playerWrap.classList.add('has-error');
    }

    function playChannel(channel, itemElement) {
      const myToken = ++attemptToken;
      let hasStartedPlaying = false;
      let mediaRecoverAttempts = 0;
      let networkRecoverAttempts = 0;
      let loadTimeoutId = null;

      const LOAD_TIMEOUT_MS = 12000; // si no arranca en 12s, dejamos de esperar

      function clearLoadTimeout() {
        if (loadTimeoutId) {
          clearTimeout(loadTimeoutId);
          loadTimeoutId = null;
        }
      }

      const isInsecureChannel = channel.url.startsWith('http://') && pageIsSecure;

      if (isInsecureChannel) {
        // Esta URL es http:// y la página es https://: el navegador SIEMPRE
        // va a bloquear esto si lo intentamos embeber (contenido mixto), sin
        // importar qué tan bien armado esté el código. No tiene sentido
        // mostrar un reproductor "cargando" que nunca va a arrancar: abrimos
        // el canal directo en una pestaña nueva, como funcionaba antes.
        video.pause();
        if (hls) { hls.destroy(); hls = null; }
        video.removeAttribute('src');
        playerWrap.hidden = true;
        markActiveItem(null);
        window.open(channel.url, '_blank');
        return;
      }

      video.pause();
      if (hls) { hls.destroy(); hls = null; }
      video.removeAttribute('src');
      video.load();

      playerWrap.hidden = false;
      playerWrap.classList.remove('has-error');
      currentNameSpan.textContent = `Cargando ${channel.name}...`;
      playerWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });

      loadTimeoutId = setTimeout(() => {
        if (myToken !== attemptToken || hasStartedPlaying) return;
        showOpenExternallyPrompt(
          channel,
          `"${channel.name}" está tardando demasiado en cargar (posible bloqueo de CORS o servidor lento). `
        );
      }, LOAD_TIMEOUT_MS);

      const candidates = buildCandidateUrls(channel.url);
      let candidateIndex = 0;

      function tryNextCandidate() {
        if (myToken !== attemptToken) return;
        if (candidateIndex >= candidates.length) {
          clearLoadTimeout();
          showOpenExternallyPrompt(
            channel,
            `"${channel.name}" no se pudo reproducir embebido en este navegador (bloqueo de contenido inseguro o códec no soportado). `
          );
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
            if (!data.fatal) return;

            if (!hasStartedPlaying) {
              // Nunca llegó a reproducir con este candidato: pasamos al
              // siguiente (o al botón de respaldo si no quedan más).
              tryNextCandidate();
              return;
            }

            // Ya se había visto/escuchado el canal y se cortó (fluctuación
            // de señal, buffer). Intentamos recuperar sin reiniciar todo el
            // flujo, para no mostrar "no se pudo reproducir" sobre algo que
            // en realidad sí se estaba viendo.
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRecoverAttempts < 2) {
              mediaRecoverAttempts++;
              try { hls.recoverMediaError(); return; } catch (e) { /* sigue abajo */ }
            } else if (data.type === Hls.ErrorTypes.NETWORK_ERROR && networkRecoverAttempts < 2) {
              networkRecoverAttempts++;
              try { hls.startLoad(); return; } catch (e) { /* sigue abajo */ }
            }

            showOpenExternallyPrompt(
              channel,
              `La señal de "${channel.name}" se cortó y no se pudo recuperar. `
            );
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
        clearLoadTimeout();
        hasStartedPlaying = true;
        currentChannel = channel;
        currentNameSpan.textContent = channel.name;
        playerWrap.classList.remove('has-error');
        markActiveItem(itemElement);
      }

      tryNextCandidate();
    }

    if (closePlayerBtn) {
      closePlayerBtn.addEventListener('click', () => {
        attemptToken++; // invalida cualquier intento en curso
        video.pause();
        if (hls) { hls.destroy(); hls = null; }
        video.removeAttribute('src');
        video.load();
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
      attemptToken++;
      video.pause();
      if (hls) { hls.destroy(); hls = null; }
      video.src = '';
      window.location.href = 'index.html';
    });

    renderChannels();
  });
}
