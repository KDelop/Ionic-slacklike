// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  environment: 'dev',
  production: false,
  BACKEND_BASE_URL: 'https://kiss-dev.sokt.io',
  authUIURL: 'https://dev-auth.intospace.io',
  // authUIURL: 'http://localhost:4200',
  authServerURL: 'https://dev-api-auth.intospace.io',
  chatServerURL: 'https://dev-api-chat.intospace.io',
  // CHAT_BACKEND_BASE_URL: 'http://localhost:3030',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
