
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const cors = require("cors");
const authRoute = require("./routes/auth.routes")
const morgan = require("morgan");

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(morgan("tiny"))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute)


module.exports = app;
