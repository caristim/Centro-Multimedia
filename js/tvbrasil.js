// Listado de canales de TV de Brasil actualizados
const tvChannels = [
    {
        name: "SBT",
        url: "https://cdn.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/chunklist.m3u8",
        logo: "icons/icon-192.svg"
    },
    {
        name: "RedeTV",
        url: "https://5b7f3c45ab7c2.streamlock.net/arapuan/ngrp:arapuan_all/playlist.m3u8",
        logo: "icons/icon-192.svg"
    },
    {
        name: "Band",
        url: "http://45.190.28.50/BAND_HD/index.m3u8",
        logo: "icons/icon-192.svg"
    },
    {
        name: "Record",
        url: "http://45.190.28.50/RECORD/index.m3u8",
        logo: "icons/icon-192.svg"
    },
    {
        name: "Record News",
        url: "http://45.162.64.114/RECORD_NEWS/index.m3u8",
        logo: "icons/icon-192.svg"
    },
    {
        name: "Globo",
        url: "http://45.190.28.50/GLOBO_HD/index.m3u8",
        logo: "icons/icon-192.svg"
    }
];

// Función para inicializar y renderizar los canales en tarjetas individuales
document.addEventListener("DOMContentLoaded", () => {
    // Buscamos el contenedor correspondiente a la grilla de canales en tvbrasil.html
    const container = document.getElementById("tv-container") || document.querySelector(".channels-grid") || document.querySelector(".grid-container") || document.body;
    
    if (container) {
        container.innerHTML = ""; // Limpiamos el contenedor para evitar duplicados
        
        tvChannels.forEach(channel => {
            // Creamos la tarjeta del canal adaptada al diseño de tu app
            const channelEl = document.createElement("a");
            channelEl.className = "card-link";
            channelEl.href = "#";
            channelEl.onclick = (e) => {
                e.preventDefault();
                playChannel(channel.url);
            };
            
            channelEl.innerHTML = `
                <div class="card">
                    <img src="${channel.logo}" alt="${channel.name}" class="card-img" onerror="this.src='icons/icon-192.svg'">
                    <h3>${channel.name}</h3>
                </div>
            `;
            container.appendChild(channelEl);
        });
    }
});

// Función para reproducir el stream del canal de TV
function playChannel(url) {
    const videoElement = document.getElementById("video-player") || document.querySelector("video");
    if (videoElement) {
        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(videoElement);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoElement.play().catch(err => console.log("La reproducción automática requiere interacción previa del usuario:", err));
            });
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            videoElement.src = url;
            videoElement.addEventListener('canplay', () => {
                videoElement.play().catch(err => console.log("La reproducción automática requiere interacción previa del usuario:", err));
            });
        } else {
            videoElement.src = url;
            videoElement.play().catch(err => console.log("Intento de reproducción directa fallido:", err));
        }
    } else {
        console.error("Error: No se encontró ningún elemento de video para reproducir.");
    }
}
