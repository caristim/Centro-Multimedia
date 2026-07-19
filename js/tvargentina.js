document.addEventListener('DOMContentLoaded', () => {
  const channelsList = document.getElementById('channels-list');

  const argentinaChannels = [
    { id: 'america',  name: 'America',   emoji: '📺', url: 'http://190.108.83.69:8000/play/a00f/index.m3u8', color: '#75aadb' },
    { id: 'c5n',       name: 'C5N',       emoji: '📰', url: 'http://190.7.19.197:232/play/a040/index.m3u8', color: '#75aadb' },
    { id: 'canal26',   name: 'Canal 26',  emoji: '📡', url: 'https://stream-gtlc.telecentro.net.ar/hls/canal26hls/main.m3u8', color: '#75aadb' },
    { id: 'elnueve',   name: 'El Nueve',  emoji: '🎬', url: 'http://190.7.19.197:232/play/a03k/index.m3u8', color: '#75aadb' },
    { id: 'eltrece',   name: 'El Trece',  emoji: '📺', url: 'http://190.108.83.69:8000/play/a01d/index.m3u8', color: '#75aadb' },
    { id: 'telefe',    name: 'Telefe',    emoji: '📺', url: 'http://190.108.83.69:8000/play/a08l/index.m3u8', color: '#75aadb' }
  ];

  function renderChannels() {
    channelsList.innerHTML = '';
    argentinaChannels.forEach((channel, index) => {
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
