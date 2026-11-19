import appConfig from '../../app.json';

/** Versão do texto de privacidade aceito no primeiro acesso (registrada nas configurações). */
export const PRIVACY_VERSION = '1.0';

/** Fonte única: app.json (suba com scripts/bump-version.mjs; um teste confere o CHANGELOG). */
export const APP_VERSION: string = appConfig.expo.version;
