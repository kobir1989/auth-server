const route = require("express").Router();
const { 
    signup,
    login, 
    forgetPassword
 } = require("../controllers/auth.controller");

route.post("/signup", signup);
route.post("/login", login);
route.post("/password/reset", forgetPassword);

module.exports = route;
