document.addEventListener('DOMContentLoaded', () => {
  const channelsList = document.getElementById('channels-list');

  const culturalChannels = [
    { id: 'animalplanet',   name: 'Animal Planet',    emoji: '🐾', url: 'http://190.108.83.69:8000/play/a043/index.m3u8', color: '#1a6d9c' },
    { id: 'discovery',      name: 'Discovery Channel', emoji: '🔎', url: 'http://190.108.83.69:8000/play/a044/index.m3u8', color: '#004a8f' },
    { id: 'discoveryworld', name: 'Discovery World',  emoji: '🌐', url: 'http://190.108.83.69:8000/play/a036/index.m3u8', color: '#004a8f' },
    { id: 'history',        name: 'History',          emoji: '🏛️', url: 'http://190.108.83.69:8000/play/a0b6/index.m3u8', color: '#8b6b3d' },
    { id: 'history2',       name: 'History2',         emoji: '🏛️', url: 'http://190.108.83.69:8000/play/a0b5/index.m3u8', color: '#8b6b3d' },
    { id: 'lovenature',     name: 'Love Nature',      emoji: '🌿', url: 'http://190.108.83.69:8000/play/a085/index.m3u8', color: '#2e8b57' },
    { id: 'natgeo',         name: 'NatGeo',           emoji: '🌎', url: 'http://190.108.83.69:8000/play/a0a1/index.m3u8', color: '#ffcc00' }
  ];

  function renderChannels() {
    channelsList.innerHTML = '';
    culturalChannels.forEach((channel, index) => {
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
