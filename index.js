const app = require("./app");
const config = require("./config/index");
const mongoose = require("mongoose");

(async () => {
  try {
    await mongoose.connect(config.MONGO_DB_URL);
    console.log("Database connected");
    app.on("error", (err) => {
      console.log("Database connection failed", err);
      throw err;
    });

    const onListining = () => {
      console.log(`Server Running on Port:${config.PORT}`);
    };

    app.listen(config.PORT, onListining);
  } catch (err) {
    console.log("Error", err);
    throw err
  }
})();
