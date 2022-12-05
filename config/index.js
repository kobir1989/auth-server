const dotenv = require("dotenv");

dotenv.config();

const config = {
  MONGO_DB_URL: process.env.MONGO_DB,
  PORT: process.env.PORT,
  JWT_SEC: process.env.JWT_SECRET,
  MAILER_API_KEY: process.env.NODE_MAILER_API_KEY,
  SMTP_MAIL_HOST: process.env.SMTP_MAIL_HOST,
  SMTP_MAIL_PORT: process.env.SMTP_MAIL_PORT,
  SMTP_MAIL_USER_NAME: process.env.SMTP_MAIL_USER_NAME,
  SMTP_MAIL_PASSWORD: process.env.SMTP_MAIL_PASSWORD,
  SMTP_MAIL_PASSWORD: process.env.SMTP_MAIL_PASSWORD,
  SMTP_MAIL_EMAIL: process.env.SMTP_MAIL_EMAIL,
};

module.exports = config;

