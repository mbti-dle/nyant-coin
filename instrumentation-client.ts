// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://b8263137bd015561bff766d34f05c545@o4510029102317568.ingest.us.sentry.io/4510029103169536',

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
})

// eslint-disable-next-line import/namespace
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
