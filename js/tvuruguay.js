// Datos de los canales de TV Uruguay.
// El renderizado y la reproducción embebida están en js/tvplayer.js (initTvChannels).
//
// Nota: el canal "5" usa un link acortado (tinyurl) en lugar de una URL de
// stream directa. Si el reproductor embebido no logra abrirlo, el botón
// "Abrir en pestaña nueva" sigue el acortador igual, así que como mínimo
// se puede ver ahí.

const uruguayChannels = [
  { id: 'canal5', name: 'Canal 5', emoji: '📺', url: 'https://tinyurl.com/canal5uy' }
];

initTvChannels(uruguayChannels);
