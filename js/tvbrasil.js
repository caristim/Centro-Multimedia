// Listado de canales de TV de Brasil actualizados
const tvChannels = [
    {
        name: "SBT",
        url: "https://cdn.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/chunklist.m3u8",
        logo: "icons/sbt.png" // Puedes ajustar la ruta del logo si la tienes
    },
    {
        name: "RedeTV",
        url: "https://5b7f3c45ab7c2.streamlock.net/arapuan/ngrp:arapuan_all/playlist.m3u8",
        logo: "icons/redetv.png"
    },
    {
        name: "Band",
        url: "http://45.190.28.50/BAND_HD/index.m3u8",
        logo: "icons/band.png"
    },
    {
        name: "Record",
        url: "http://45.190.28.50/RECORD/index.m3u8",
        logo: "icons/record.png"
    },
    {
        name: "Record News",
        url: "http://45.162.64.114/RECORD_NEWS/index.m3u8",
        logo: "icons/recordnews.png"
    },
    {
        name: "Globo",
        url: "http://45.190.28.50/GLOBO_HD/index.m3u8",
        logo: "icons/globo.png"
    }
];

// Función para inicializar y renderizar los canales en el contenedor de la app
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("tv-container") || document.querySelector(".channels-grid") || document.body;
    
    if (container) {
        container.innerHTML = ""; // Limpiamos el contenedor anterior
        
        tvChannels.forEach(channel => {
            const channelEl = document.createElement("div");
            channelEl.className = "channel-card";
            channelEl.innerHTML = `
                <div class="channel-info" onclick="playChannel('${channel.url}')">
                    <h3>${channel.name}</h3>
                </div>
            `;
            container.appendChild(channelEl);
        });
    }
});

// Función para reproducir el canal (utilizando el reproductor que ya tengas integrado, p. ej. HLS.js)
function playChannel(url) {
    const videoElement = document.getElementById("video-player") || document.querySelector("video");
    if (videoElement) {
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(videoElement);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoElement.play();
            });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            videoElement.src = url;
            videoElement.addEventListener('canplay', () => {
                videoElement.play();
            });
        }
    } else {
        console.error("No se encontró ningún elemento de video para reproducir el stream.");
    }
}
