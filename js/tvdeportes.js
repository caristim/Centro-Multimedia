document.addEventListener('DOMContentLoaded', () => {
  const channelsList = document.getElementById('channels-list');

  const deportesChannels = [
    { id: 'espn',        name: 'ESPN',                emoji: '⚽', url: 'http://190.108.83.69:8000/play/a08t/index.m3u8', color: '#ff0000' },
    { id: 'espn1',       name: 'ESPN1',               emoji: '⚽', url: 'http://190.108.83.69:8000/play/a03s/index.m3u8', color: '#ff0000' },
    { id: 'espn2',       name: 'ESPN2',               emoji: '⚽', url: 'http://190.108.83.69:8000/play/a0an/index.m3u8', color: '#ff0000' },
    { id: 'espn3',       name: 'ESPN3',               emoji: '⚽', url: 'http://190.108.83.69:8000/play/a039/index.m3u8', color: '#ff0000' },
    { id: 'espn4',       name: 'ESPN4',               emoji: '⚽', url: 'http://190.108.83.69:8000/play/a04h/index.m3u8', color: '#ff0000' },
    { id: 'espn5',       name: 'ESPN5',               emoji: '⚽', url: 'http://190.108.83.69:8000/play/a032/index.m3u8', color: '#ff0000' },
    { id: 'espn6',       name: 'ESPN6',               emoji: '⚽', url: 'http://190.108.83.69:8000/play/a02w/index.m3u8', color: '#ff0000' },
    { id: 'espn7',       name: 'ESPN7',               emoji: '⚽', url: 'http://190.108.83.69:8000/play/a049/index.m3u8', color: '#ff0000' },
    { id: 'espnpremium', name: 'ESPN Premium',        emoji: '🏆', url: 'http://190.108.83.69:8000/play/a03w/index.m3u8', color: '#ff0000' },
    { id: 'movistar',    name: 'Movistar Deportes',   emoji: '📡', url: 'http://190.108.83.69:8000/play/a07o/index.m3u8', color: '#019df4' },
    { id: 'tntsports',   name: 'TNT Sports Premium',  emoji: '🏆', url: 'http://190.108.83.69:8000/play/a03i/index.m3u8', color: '#f2a900' }
  ];

  function renderChannels() {
    channelsList.innerHTML = '';
    deportesChannels.forEach((channel, index) => {
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
