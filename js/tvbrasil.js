// Datos de los canales de TV Brasil.
// El renderizado y la reproducción embebida están en js/tvplayer.js (initTvChannels).

const brazilChannels = [
  { id: 'band',       name: 'Band',        emoji: '📺',  url: 'http://45.190.28.50/BAND_HD/index.m3u8' },
  { id: 'cnn',        name: 'CNN',         emoji: '🌎',  url: 'https://d25usgadhphvwi.cloudfront.net/hls/stv-plus-640x360/playlist.m3u8' },
  { id: 'globo',      name: 'Globo',       emoji: '🇧🇷', url: 'http://45.190.28.50/GLOBO_HD/index.m3u8' },
  { id: 'globonews',  name: 'Globo News',  emoji: '📰',  url: 'http://177.52.24.163/GLOBO-NEWS-HD/index.m3u8' },
  { id: 'record',     name: 'Record',      emoji: '📡',  url: 'http://45.190.28.50/RECORD/index.m3u8' },
  { id: 'recordnews', name: 'Record News', emoji: '📰',  url: 'http://45.162.64.114/RECORD_NEWS/index.m3u8' },
  { id: 'redetv',     name: 'RedeTV',      emoji: '🌐',  url: 'https://geo.dailymotion.com/player.html?video=kYe5OYErhldJ75Azib2' },
  { id: 'sbt',        name: 'SBT',         emoji: '🎬',  url: 'https://cdn.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/chunklist.m3u8' }
];

initTvChannels(brazilChannels);
