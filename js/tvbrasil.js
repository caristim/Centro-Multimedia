document.addEventListener('DOMContentLoaded', () => {
  const channelsList = document.getElementById('channels-list');

  const brazilChannels = [
    { id: 'sbt',      name: 'SBT',        emoji: '📺',  url: 'https://cdn.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/chunklist.m3u8', color: '#1a6d9c' },
    { id: 'redetv',   name: 'RedeTV!',    emoji: '📡',  url: 'https://5b7f3c45ab7c2.streamlock.net/arapuan/ngrp:arapuan_all/playlist.m3u8', color: '#2b5797' },
    { id: 'band',     name: 'Band TV',    emoji: '📺',  url: 'http://45.190.28.50/BAND_HD/index.m3u8', color: '#ff6600' },
    { id: 'record',   name: 'Record TV',  emoji: '📡',  url: 'http://45.190.28.50/RECORD/index.m3u8', color: '#b30000' },
    { id: 'recordnews', name: 'Record News', emoji: '📰', url: 'http://45.162.64.114/RECORD_NEWS/index.m3u8', color: '#004080' },
    { id: 'globo',    name: 'Globo TV',   emoji: '🇧🇷', url: 'http://45.190.28.50/GLOBO_HD/index.m3u8', color: '#008000' }
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
        // Abrir el stream en una nueva ventana/pestaña
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
