// Datos de los canales de TV Argentina.
// El renderizado y la reproducción embebida están en js/tvplayer.js (initTvChannels).

const argentinaChannels = [
  { id: 'a24',      name: 'A24',      emoji: '📰', url: 'https://g1.vxral-hor.transport.edge-access.net/a15/ngrp:a24-100056_all/a24-100056.m3u8' },
  { id: 'america',  name: 'America',  emoji: '📺', url: 'https://raw.githubusercontent.com/MachineSystems/archived_m3u8/main/america_hls.m3u8' },
  { id: 'c5n',      name: 'C5N',      emoji: '📰', url: 'http://190.7.19.197:232/play/a040/index.m3u8' },
  { id: 'canal26',  name: 'Canal 26', emoji: '📡', url: 'https://stream-gtlc.telecentro.net.ar/hls/canal26hls/main.m3u8' },
  { id: 'elnueve',  name: 'El Nueve', emoji: '🎬', url: 'http://190.7.19.197:232/play/a03k/index.m3u8' },
  { id: 'eltrece',  name: 'El Trece', emoji: '📺', url: 'http://190.108.83.69:8000/play/a01d/index.m3u8' },
  { id: 'telefe',   name: 'Telefe',   emoji: '📺', url: 'http://190.108.83.69:8000/play/a08l/index.m3u8' }
];

initTvChannels(argentinaChannels);
