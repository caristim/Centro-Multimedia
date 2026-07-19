// Datos de los canales de TV Cultural.
// El renderizado y la reproducción embebida están en js/tvplayer.js (initTvChannels).

const culturalChannels = [
  { id: 'animalplanet',   name: 'Animal Planet',     emoji: '🐾', url: 'http://190.108.83.69:8000/play/a043/index.m3u8' },
  { id: 'discovery',      name: 'Discovery Channel', emoji: '🔎', url: 'http://190.108.83.69:8000/play/a044/index.m3u8' },
  { id: 'discoveryworld', name: 'Discovery World',   emoji: '🌐', url: 'http://190.108.83.69:8000/play/a036/index.m3u8' },
  { id: 'history',        name: 'History',           emoji: '🏛️', url: 'http://190.108.83.69:8000/play/a0b6/index.m3u8' },
  { id: 'history2',       name: 'History2',          emoji: '🏛️', url: 'http://190.108.83.69:8000/play/a0b5/index.m3u8' },
  { id: 'lovenature',     name: 'Love Nature',       emoji: '🌿', url: 'http://190.108.83.69:8000/play/a085/index.m3u8' },
  { id: 'natgeo',         name: 'NatGeo',            emoji: '🌎', url: 'http://190.108.83.69:8000/play/a0a1/index.m3u8' }
];

initTvChannels(culturalChannels);
