document.addEventListener('DOMContentLoaded', () => {
  const channelsList = document.getElementById('channels-list');

  const brazilChannels = [
    { id: 'globo',    name: 'Globo TV',   emoji: '🇧🇷', url: 'https://globoplay.globo.com', color: '#008000' },
    { id: 'band',     name: 'Band TV',    emoji: '📺',  url: 'https://band.com.br', color: '#ff6600' },
    { id: 'bandnews', name: 'Band News',  emoji: '📰',  url: 'https://bandnewsfm.com.br', color: '#1a4d8c' },
    { id: 'sbt',      name: 'SBT',        emoji: '🎬',  url: 'https://www.sbt.com.br', color: '#1a6d9c' },
    { id: 'record',   name: 'Record TV',  emoji: '📡',  url: 'https://recordtv.r7.com', color: '#b30000' },
    { id: 'redetv',   name: 'RedeTV!',    emoji: '🌐',  url: 'https://redetv.uol.com.br/aovivo', color: '#2b5797' }
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
