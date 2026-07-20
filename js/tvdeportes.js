// Datos de los canales de TV Deportes.
// El renderizado y la reproducción embebida están en js/tvplayer.js (initTvChannels).

const deportesChannels = [
  { id: 'dsports1',    name: 'DSports1',           emoji: '⚽', url: 'https://streamvidex.qzz.io/videx/dsportsar/index.m3u8' },
  { id: 'dsportsplus', name: 'DSports+',           emoji: '🏆', url: 'https://streamvidex.qzz.io/videx/dsportsplus/index.m3u8' },
  { id: 'espn',        name: 'ESPN',               emoji: '⚽', url: 'http://190.108.83.69:8000/play/a08t/index.m3u8' },
  { id: 'espn1',       name: 'ESPN1',              emoji: '⚽', url: 'http://190.108.83.69:8000/play/a03s/index.m3u8' },
  { id: 'espn2',       name: 'ESPN2',              emoji: '⚽', url: 'http://190.108.83.69:8000/play/a0an/index.m3u8' },
  { id: 'espn3',       name: 'ESPN3',              emoji: '⚽', url: 'http://190.108.83.69:8000/play/a039/index.m3u8' },
  { id: 'espn4',       name: 'ESPN4',              emoji: '⚽', url: 'http://190.108.83.69:8000/play/a04h/index.m3u8' },
  { id: 'espn5',       name: 'ESPN5',              emoji: '⚽', url: 'http://190.108.83.69:8000/play/a032/index.m3u8' },
  { id: 'espn6',       name: 'ESPN6',              emoji: '⚽', url: 'http://190.108.83.69:8000/play/a02w/index.m3u8' },
  { id: 'espn7',       name: 'ESPN7',              emoji: '⚽', url: 'http://190.108.83.69:8000/play/a049/index.m3u8' },
  { id: 'espnpremium', name: 'ESPN Premium',       emoji: '🏆', url: 'http://190.108.83.69:8000/play/a03w/index.m3u8' },
  { id: 'movistar',    name: 'Movistar Deportes',  emoji: '📡', url: 'http://190.108.83.69:8000/play/a07o/index.m3u8' },
  { id: 'tntsports',   name: 'TNT Sports Premium', emoji: '🏆', url: 'http://190.108.83.69:8000/play/a03i/index.m3u8' }
];

initTvChannels(deportesChannels);
