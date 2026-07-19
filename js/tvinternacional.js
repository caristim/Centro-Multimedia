// Datos de los canales de TV Internacional.
// El renderizado y la reproducción embebida están en js/tvplayer.js (initTvChannels).

const internacionalChannels = [
  { id: 'cgtn',     name: 'CGTN',     emoji: '🌏', url: 'http://190.108.83.69:8000/play/a0ao/index.m3u8' },
  { id: 'cnn',      name: 'CNN',      emoji: '🌎', url: 'http://190.108.83.69:8000/play/a023/index.m3u8' },
  { id: 'dw',       name: 'DW',       emoji: '🇩🇪', url: 'https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/stream04/streamPlaylist.m3u8' },
  { id: 'euronews', name: 'Euronews', emoji: '📰', url: 'https://cdn-euronews.akamaized.net/live/eds/euronews-es/25053/index.m3u8' },
  { id: 'france24', name: 'France24', emoji: '🇫🇷', url: 'http://190.108.83.69:8000/play/a01j/index.m3u8' },
  { id: 'rt',       name: 'RT',       emoji: '🌐', url: 'https://rt-esp.rttv.com/dvr/rtesp/playlist.m3u8' },
  { id: 'rtve',     name: 'RTVE',     emoji: '🇪🇸', url: 'https://ztnr.rtve.es/ztnr/1694255.m3u8' },
  { id: 'telesur',  name: 'Telesur',  emoji: '📡', url: 'https://mblesmain01.telesur.ultrabase.net/mbliveMain/hd/chunklist.m3u8' }
];

initTvChannels(internacionalChannels);
