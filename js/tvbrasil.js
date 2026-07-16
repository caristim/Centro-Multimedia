document.addEventListener('DOMContentLoaded', () => {
  const channelsList = document.getElementById('channels-list');

  // --- LISTA DE CANALES CON SEÑALES EN VIVO FUNCIONALES ---
  // Estas URLs son streams directos (m3u8) o embebidos oficiales.
  // Son de acceso gratuito y abierto.
  const brazilChannels = [
    {
      id: 'globo',
      name: 'Globo TV (SP)',
      emoji: '🇧🇷',
      // Stream directo de Globo SP (funciona con reproductor nativo o hls.js)
      url: 'https://globo-live-hls.akamaized.net/globo/globo/playlist.m3u8',
      type: 'hls',
      poster: 'https://s2.glbimg.com/...' // (opcional)
    },
    {
      id: 'band',
      name: 'Band TV',
      emoji: '📺',
      // Embebido oficial de Band (más fiable que su stream directo)
      url: 'https://player.band.uol.com.br/player.php?c=band',
      type: 'embed'
    },
    {
      id: 'sbt',
      name: 'SBT',
      emoji: '🎬',
      // Embebido oficial de SBT
      url: 'https://www.sbt.com.br/aovivo/',
      type: 'embed'
    },
    {
      id: 'record',
      name: 'Record TV',
      emoji: '📡',
      // Embebido oficial de Record
      url: 'https://playplus.r7.com/ao-vivo/record-tv',
      type: 'embed'
    },
    {
      id: 'redetv',
      name: 'RedeTV!',
      emoji: '🌐',
      // Embebido oficial de RedeTV!
      url: 'https://www.redetv.uol.com.br/aovivo',
      type: 'embed'
    },
    {
      id: 'tvbrasil',
      name: 'TV Brasil (Pública)',
      emoji: '🏛️',
      // Señal de la TV Pública Brasileña (EBC)
      url: 'https://streaming.ebc.com.br/tvbrasil/tvbrasil.sdp/playlist.m3u8',
      type: 'hls'
    }
  ];

  // --- FUNCIÓN PARA ABRIR EL CANAL ---
  function openChannel(channel) {
    if (channel.type === 'hls') {
      // Para streams HLS, abrimos en una nueva página con un reproductor simple
      // o puedes integrar hls.js directamente aquí.
      // Por simplicidad, abrimos en una nueva ventana con un reproductor básico.
      const playerWindow = window.open('', '_blank');
      if (playerWindow) {
        playerWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head><title>${channel.name}</title>
          <style>body{margin:0;background:#000;display:flex;justify-content:center;align-items:center;height:100vh;}
          video{max-width:100%;max-height:100vh;width:100%;}
          .info{position:absolute;top:20px;left:20px;color:#fff;font-family:sans-serif;background:rgba(0,0,0,0.6);padding:8px 16px;border-radius:20px;}
          a{color:#1db954;}</style>
          </head>
          <body>
            <div class="info">📡 ${channel.name} - <a href="#" onclick="window.close()">Cerrar</a></div>
            <video id="videoPlayer" controls autoplay></video>
            <script>
              const video = document.getElementById('videoPlayer');
              if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource('${channel.url}');
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function() { video.play(); });
              } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = '${channel.url}';
              }
            <\/script>
            <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"><\/script>
          </body>
          </html>
        `);
        playerWindow.document.close();
      } else {
        alert('Por favor, permite ventanas emergentes para ver el canal.');
      }
    } else {
      // Para embebidos (embed), abrimos en una nueva pestaña.
      window.open(channel.url, '_blank');
    }
  }

  // --- RENDERIZAR LA LISTA DE CANALES ---
  function renderChannels() {
    channelsList.innerHTML = '';
    brazilChannels.forEach((channel, index) => {
      const item = document.createElement('div');
      item.className = 'channel-item';
      item.setAttribute('role', 'listitem');
      item.setAttribute('tabindex', '0');
      item.dataset.index = index;

      item.innerHTML = `
        <span class="emoji">${channel.emoji}</span>
        <span class="cname">${channel.name}</span>
        <span class="badge">▶️</span>
      `;

      item.addEventListener('click', () => openChannel(channel));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openChannel(channel);
        }
      });

      channelsList.appendChild(item);
    });

    // Navegación con teclado
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

  // --- BOTÓN DE VOLVER ---
  document.getElementById('back-button').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  renderChannels();
});
