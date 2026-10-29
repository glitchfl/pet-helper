/** @type {import('expo/fingerprint').Config} */
module.exports = {
  // sourceSkips replaces the balanced preset's list, so its skips are repeated here.
  // npm scripts and .gitignore never reach the native build - hashing them would cut the installed apps
  // off from updates after a harmless edit
  sourceSkips: [
    'ExpoConfigVersions',
    'ExpoConfigRuntimeVersionIfString',
    'EasJson',
    'Easignore',
    'AutolinkingConfigPaths',
    'PackageJsonScriptsAll',
    'GitIgnore',
  ],
};
