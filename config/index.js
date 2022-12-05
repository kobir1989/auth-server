const dotenv = require("dotenv");

dotenv.config();

const config = {
  MONGO_DB_URL: process.env.MONGO_DB,
  PORT: process.env.PORT,
  JWT_SEC: process.env.JWT_SECRET,
};

module.exports = config;
