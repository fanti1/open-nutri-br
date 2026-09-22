const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite no navegador roda o SQLite compilado em WebAssembly.
config.resolver.assetExts.push('wasm');

// O worker do SQLite web usa SharedArrayBuffer, que o navegador só libera em
// páginas "cross-origin isolated". "credentialless" mantém as chamadas à API
// (outra origem, com CORS) funcionando.
config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  return middleware(req, res, next);
};

module.exports = config;
