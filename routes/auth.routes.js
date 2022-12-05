const route = require("express").Router();
const { 
    signup,
    login, 
    forgetPassword,
    resetPassword
 } = require("../controllers/auth.controller");

route.post("/signup", signup);
route.post("/login", login);
route.post("/password/forget", forgetPassword);
route.post("/password/reset/:resetToken", resetPassword);

module.exports = route;
