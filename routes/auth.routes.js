const route = require("express").Router();
const { 
    signup,
    login, 
    forgetPassword,
    resetPassword,
    changePassword,
    logout
 } = require("../controllers/auth.controller");

route.post("/signup", signup);
route.post("/login", login);
route.post("/password/forget", forgetPassword);
route.post("/password/reset/:resetToken", resetPassword);
route.post("/change/password/:_id", changePassword);
route.get("/logout", logout);

module.exports = route;
