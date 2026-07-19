document.addEventListener('DOMContentLoaded', () => {
  const channelsList = document.getElementById('channels-list');

  const internacionalChannels = [
    { id: 'cgtn',     name: 'CGTN',      emoji: '🌏', url: 'http://190.108.83.69:8000/play/a0ao/index.m3u8', color: '#c8102e' },
    { id: 'cnn',      name: 'CNN',       emoji: '🌎', url: 'http://190.108.83.69:8000/play/a023/index.m3u8', color: '#cc0000' },
    { id: 'dw',       name: 'DW',        emoji: '🇩🇪', url: 'https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/stream04/streamPlaylist.m3u8', color: '#0044a3' },
    { id: 'euronews', name: 'Euronews',  emoji: '📰', url: 'https://cdn-euronews.akamaized.net/live/eds/euronews-es/25053/index.m3u8', color: '#002B5C' },
    { id: 'france24', name: 'France24',  emoji: '🇫🇷', url: 'http://190.108.83.69:8000/play/a01j/index.m3u8', color: '#00318b' },
    { id: 'rt',       name: 'RT',        emoji: '🌐', url: 'https://rt-esp.rttv.com/dvr/rtesp/playlist.m3u8', color: '#7f7f7f' },
    { id: 'rtve',     name: 'RTVE',      emoji: '🇪🇸', url: 'https://ztnr.rtve.es/ztnr/1694255.m3u8', color: '#e60023' },
    { id: 'telesur',  name: 'Telesur',   emoji: '📡', url: 'https://mblesmain01.telesur.ultrabase.net/mbliveMain/hd/chunklist.m3u8', color: '#e30613' }
  ];

  function renderChannels() {
    channelsList.innerHTML = '';
    internacionalChannels.forEach((channel, index) => {
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

      item.addEventListener('click', () => {
        window.open(channel.url, '_blank');
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.open(channel.url, '_blank');
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

  document.getElementById('back-button').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  renderChannels();
});
