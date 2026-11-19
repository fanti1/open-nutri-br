// Plugin de configuração do Expo: o APK sai com o nome do app e a versão
// (ex.: OpenNutri-BR-1.0.0.apk) em vez de app-release.apk.
// A pasta android/ é gerada pelo prebuild; por isso a regra vive aqui, e não no build.gradle.
const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = '// OpenNutri BR: nome do APK com app e versão (plugins/withApkFileName.js)';

const RULE = `
${MARKER}
android.applicationVariants.all { variant ->
    variant.outputs.all {
        def suffix = variant.buildType.name == 'release' ? '' : "-\${variant.buildType.name}"
        outputFileName = "OpenNutri-BR-\${variant.versionName}\${suffix}.apk"
    }
}
`;

module.exports = function withApkFileName(config) {
  return withAppBuildGradle(config, (mod) => {
    if (!mod.modResults.contents.includes(MARKER)) {
      mod.modResults.contents += RULE;
    }
    return mod;
  });
};
