#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const ROOT_DIR = '/home/sao/sao';

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    // Parsear URL
    let filePath = req.url === '/' ? '/SAO.html' : req.url;
    filePath = path.join(ROOT_DIR, filePath);

    // Prevenir directory traversal
    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404);
            res.end(`404: ${req.url} not found`);
            return;
        }

        const ext = path.extname(filePath);
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
        });

        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║      🚀 SAO OS - SERVIDOR DE DESARROLLO       ║
╚════════════════════════════════════════════════╝

✓ Servidor ejecutándose en: http://localhost:${PORT}
✓ Abriendo SAO.html automáticamente...

📝 Para parar el servidor: Presiona Ctrl+C

💡 Pruebas técnicas disponibles:
   - http://localhost:${PORT}/DIAGNOSTICO.html (para diagnóstico)
   - http://localhost:${PORT}/SAO.html (app principal)

⚠️  Abre http://localhost:${PORT} en tu navegador
    y abre la consola (F12) para ver logs de ejecución.
`);

    // Abrir en navegador si es posible
    const { exec } = require('child_process');
    exec(`xdg-open http://localhost:${PORT} || open http://localhost:${PORT}`);
});

// Manejo de errores
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Puerto ${PORT} ya está en uso`);
        console.log('\nIntentando puerto alternativo 8001...');
        server.listen(8001);
    }
});
