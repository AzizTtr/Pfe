export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
  wsBaseUrl: 'http://localhost:8080/api/ws',
  keycloak: {
    url: 'http://localhost:8180',
    realm: 'arabic-quality',
    clientId: 'frontend-spa'
  },
  defaultLang: 'ar',
  supportedLangs: ['ar', 'en']
};
