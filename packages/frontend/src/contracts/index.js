import configStaging from './config-staging.json';
import configDev from './config-dev.json';
import configProd from './config-prod.json';

export const configs = (() => {
  if (process.env.REACT_APP_VERCEL_ENV === 'DEVELOPMENT') {
    return configDev;
  } if (process.env.REACT_APP_VERCEL_ENV === 'STAGING') {
    return configStaging;
  }  if (process.env.REACT_APP_VERCEL_ENV === 'PRODUCTION') {
    return configProd;
  }
})();
