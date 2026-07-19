// Datos de los canales de TV Argentina.
// El renderizado y la reproducción embebida están en js/tvplayer.js (initTvChannels).

const argentinaChannels = [
  { id: 'america',  name: 'America',  emoji: '📺', url: 'http://190.108.83.69:8000/play/a00f/index.m3u8' },
  { id: 'c5n',      name: 'C5N',      emoji: '📰', url: 'http://190.7.19.197:232/play/a040/index.m3u8' },
  { id: 'canal26',  name: 'Canal 26', emoji: '📡', url: 'https://stream-gtlc.telecentro.net.ar/hls/canal26hls/main.m3u8' },
  { id: 'elnueve',  name: 'El Nueve', emoji: '🎬', url: 'http://190.7.19.197:232/play/a03k/index.m3u8' },
  { id: 'eltrece',  name: 'El Trece', emoji: '📺', url: 'http://190.108.83.69:8000/play/a01d/index.m3u8' },
  { id: 'telefe',   name: 'Telefe',   emoji: '📺', url: 'http://190.108.83.69:8000/play/a08l/index.m3u8' }
];

initTvChannels(argentinaChannels);
