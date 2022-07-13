import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const NODE_ENV = process.env.NODE_ENV;

export const ENVIRONMENT_VARIABLES = {
  SUBREDDIT: () => {
    if (NODE_ENV === 'production') {
      return process.env.SUBREDDIT_PROD;
    } else {
      return process.env.SUBREDDIT_DEV;
    }
  },
  BOT_USER_AGENT: () => {
    if (NODE_ENV === 'production') {
      return process.env.BOT_USER_AGENT_PROD;
    } else {
      return process.env.BOT_USER_AGENT_DEV;
    }
  },
  BOT_CLIENT_ID: () => {
    if (NODE_ENV === 'production') {
      return process.env.BOT_CLIENT_ID_PROD;
    } else {
      return process.env.BOT_CLIENT_ID_DEV;
    }
  },
  BOT_CLIENT_SECRET: () => {
    if (NODE_ENV === 'production') {
      return process.env.BOT_CLIENT_SECRET_PROD;
    } else {
      return process.env.BOT_CLIENT_SECRET_DEV;
    }
  },
  BOT_REFRESH_TOKEN: () => {
    if (NODE_ENV === 'production') {
      return process.env.BOT_REFRESH_TOKEN_PROD;
    } else {
      return process.env.BOT_REFRESH_TOKEN_DEV;
    }
  },
  BOT_ACCESS_TOKEN: () => {
    if (NODE_ENV === 'production') {
      return process.env.BOT_ACCESS_TOKEN_PROD;
    } else {
      return process.env.BOT_ACCESS_TOKEN_DEV;
    }
  },
  ALCHEMY_WSS_URL: () => {
    if (NODE_ENV === 'production') {
      return process.env.ALCHEMY_WSS_URL_PROD;
    } else {
      return process.env.ALCHEMY_WSS_URL_DEV;
    }
  },
  ALCHEMY_URL: () => {
    if (NODE_ENV === 'production') {
      return process.env.ALCHEMY_URL_PROD;
    } else {
      return process.env.ALCHEMY_URL_DEV;
    }
  },
  DB_URI: () => {
    if (NODE_ENV === 'production') {
      return process.env.DB_URI_PROD;
    } else {
      return process.env.DB_URI_DEV;
    }
  },
  FRONTEND_URI: () => {
    if (NODE_ENV === 'production') {
      return process.env.FRONTEND_URI_PROD;
    } else {
      return process.env.FRONTEND_URI_DEV;
    }
  },
  GROUP: () => {
    if (NODE_ENV === 'production') {
      return process.env.GROUP_PROD;
    } else {
      return process.env.GROUP_DEV;
    }
  },
  PORT: () => {
    if (NODE_ENV === 'production') {
      return process.env.PORT_PROD;
    } else {
      return process.env.PORT_DEV;
    }
  },
};
