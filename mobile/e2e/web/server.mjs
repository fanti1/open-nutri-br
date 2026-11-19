// Servidor estático do build web (npx expo export --platform web --output-dir dist-e2e) para os testes ponta a ponta.
// - Cabeçalhos de isolamento: o SQLite do navegador (expo-sqlite) usa SharedArrayBuffer.
// - Rotas do app (/calculadora/imc) caem no index.html, como num servidor de produção de SPA.
// Uso: node e2e/web/server.mjs [porta]
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../dist-e2e');
const port = Number(process.argv[2] ?? process.env.E2E_PORT ?? 8099);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
  '.css': 'text/css; charset=utf-8',
};

if (!existsSync(join(root, 'index.html'))) {
  console.error(`Build web não encontrado em ${root}. Rode: npx expo export --platform web --output-dir dist-e2e`);
  process.exit(1);
}

createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://localhost').pathname)).replace(/^([\\/])+/, '');
  let file = join(root, path);
  if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html');

  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream');
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`OpenNutri BR (build web) em http://localhost:${port}`));
