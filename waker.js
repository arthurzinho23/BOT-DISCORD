const axios = require('axios');

function startWaker(url) {
    // Pinga o site a cada 14 minutos para evitar suspensão no Render (Free Tier)
    const INTERVAL = 14 * 60 * 1000; 

    setInterval(async () => {
        try {
            console.log(`[Waker] Pingando ${url}...`);
            await axios.get(url);
            console.log('[Waker] Ping realizado com sucesso.');
        } catch (error) {
            console.error('[Waker] Erro ao pingar:', error.message);
        }
    }, INTERVAL);
}

module.exports = startWaker;
