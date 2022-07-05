import configStaging from './config-staging.json';
import configDev from './config-dev.json';

export const configs = (() => {
  if (process.env.REACT_APP_VERCEL_ENV === 'development') {
    return configDev;
  } else {
    return configStaging;
  }
})();
