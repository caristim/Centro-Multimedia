document.addEventListener('DOMContentLoaded', () => {
  const channelsList = document.getElementById('channels-list');

  const brazilChannels = [
    { id: 'sbt',        name: 'SBT',          emoji: '🎬',  url: 'https://cdn.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/chunklist.m3u8', color: '#1a6d9c' },
    { id: 'redetv',     name: 'RedeTV!',      emoji: '🌐',  url: 'https://redetv.uol.com.br/aovivo', color: '#2b5797' },
    { id: 'band',       name: 'Band TV',      emoji: '📺',  url: 'http://45.190.28.50/BAND_HD/index.m3u8', color: '#ff6600' },
    { id: 'record',     name: 'Record TV',    emoji: '📡',  url: 'http://45.190.28.50/RECORD/index.m3u8', color: '#b30000' },
    { id: 'recordnews', name: 'Record News',  emoji: '📰',  url: 'http://45.162.64.114/RECORD_NEWS/index.m3u8', color: '#8b0000' },
    { id: 'globo',      name: 'Globo TV',     emoji: '🇧🇷', url: 'http://45.190.28.50/GLOBO_HD/index.m3u8', color: '#008000' },
    { id: 'globonews',  name: 'Globo News',   emoji: '📰',  url: 'http://79.127.238.228:14093/', color: '#1a4d8c' },
    { id: 'cnn',        name: 'CNN',          emoji: '🌎',  url: 'https://d25usgadhphvwi.cloudfront.net/hls/stv-plus-640x360/playlist.m3u8', color: '#cc0000' }
  ];

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
