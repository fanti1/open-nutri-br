// Plugin de configuração do Expo: assina o APK/AAB de release com a chave do projeto.
//
// Sem estas variáveis de ambiente o build de release continua assinado com a chave de
// debug (padrão do Expo), o que serve para testar mas NÃO para distribuir: um APK
// assinado com outra chave não instala por cima do anterior.
//
//   ANDROID_KEYSTORE_FILE      caminho do arquivo .jks
//   ANDROID_KEYSTORE_PASSWORD  senha do keystore
//   ANDROID_KEY_ALIAS          alias da chave
//   ANDROID_KEY_PASSWORD       senha da chave (se vazia, usa a do keystore)
//
// No GitHub Actions, o workflow de release monta essas variáveis a partir dos secrets
// (veja docs/RELEASE.md). A pasta android/ é gerada pelo prebuild; por isso a regra
// vive aqui, e não no build.gradle.
const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = '// OpenNutri BR: assinatura de release por variáveis de ambiente (plugins/withReleaseSigning.js)';

const RULE = `
${MARKER}
def onKeystoreFile = System.getenv('ANDROID_KEYSTORE_FILE')
if (onKeystoreFile) {
    android {
        signingConfigs {
            openNutriRelease {
                storeFile file(onKeystoreFile)
                storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
                keyAlias System.getenv('ANDROID_KEY_ALIAS')
                keyPassword System.getenv('ANDROID_KEY_PASSWORD') ?: System.getenv('ANDROID_KEYSTORE_PASSWORD')
            }
        }
        buildTypes {
            release {
                signingConfig signingConfigs.openNutriRelease
            }
        }
    }
}
`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    if (!mod.modResults.contents.includes(MARKER)) {
      mod.modResults.contents += RULE;
    }
    return mod;
  });
};
