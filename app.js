
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const cors = require("cors");

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


module.exports = app;
