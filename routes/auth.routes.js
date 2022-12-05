const route = require("express").Router();
const { signup } = require("../controllers/auth.controller");

route.post("/signup", signup);

module.exports = route;
