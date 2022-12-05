const dotenv = require("dotenv");

dotenv.config();

const config = {
  MONGO_DB_URL: process.env.MONGO_DB,
  PORT: process.env.PORT,
};

module.exports = config;
