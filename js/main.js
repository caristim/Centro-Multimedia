document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('services-grid');

  services.forEach((service, index) => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.setAttribute('role', 'gridcell');
    card.setAttribute('tabindex', '0');
    card.dataset.index = index;
    card.dataset.color = service.color;
    card.style.setProperty('--card-bg', service.color + '33');

    card.innerHTML = `
      <span class="icon">${service.icon}</span>
      <span class="name">${service.name}</span>
    `;

    card.addEventListener('click', () => launchService(service));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        launchService(service);
      }
    });

    grid.appendChild(card);
  });

  const firstCard = grid.querySelector('.service-card');
  if (firstCard) firstCard.focus();

  const cards = Array.from(grid.querySelectorAll('.service-card'));
  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    if (!active || !active.classList.contains('service-card')) return;
    const current = cards.indexOf(active);
    let newIndex = current;
    switch (e.key) {
      case 'ArrowRight': newIndex = (current + 1) % cards.length; e.preventDefault(); break;
      case 'ArrowLeft': newIndex = (current - 1 + cards.length) % cards.length; e.preventDefault(); break;
      case 'ArrowDown': newIndex = (current + 4) % cards.length; e.preventDefault(); break;
      case 'ArrowUp': newIndex = (current - 4 + cards.length) % cards.length; e.preventDefault(); break;
      default: return;
    }
    cards[newIndex].focus();
  });
});

function launchService(service) {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

  // Primero probar deep link
  if (service.deepLink) {
    window.location.href = service.deepLink;
    setTimeout(() => fallbackToWeb(service), 2000);
    return;
  }

  // Android app por intent
  if (isAndroid && service.androidApp) {
    const intentUrl = `intent://${service.androidApp}/#Intent;package=${service.androidApp};end`;
    window.location.href = intentUrl;
    setTimeout(() => fallbackToWeb(service), 2000);
    return;
  }

  // iOS scheme
  if (isIOS && service.iosApp) {
    window.location.href = `${service.iosApp}://`;
    setTimeout(() => fallbackToWeb(service), 2000);
    return;
  }

  fallbackToWeb(service);
}

function fallbackToWeb(service) {
  if (service.webUrl) {
    window.open(service.webUrl, '_blank');
  } else {
    alert(`No se puede abrir ${service.name}. Verifica la configuración.`);
  }
}

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registrado', reg))
    .catch(err => console.log('SW falló', err));
}