const dotenv = require("dotenv");

dotenv.config();

const config = {
  MONGO_DB_URL: process.env.MONGO_DB,
  PORT: process.env.PORT,
  JWT_SECRET:process.JWT_SECRET,
  JWT_EXP:process.JWT_EXPIRE
};

module.exports = config;
