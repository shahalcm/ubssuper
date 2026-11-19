module.exports = ({ config }) => {
  return {
    ...config,
    name: 'UBS Super',
    version: '1.0.7',
    android: {
      ...config.android,
      package: 'com.natechsys.ubssuper',
      versionCode: 8,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || config.android?.googleServicesFile || './google-services.json',
    },
  };
};
