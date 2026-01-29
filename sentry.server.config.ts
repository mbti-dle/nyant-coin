/* eslint-disable filenames/match-regex */
// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://b8263137bd015561bff766d34f05c545@o4510029102317568.ingest.us.sentry.io/4510029103169536',

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})
