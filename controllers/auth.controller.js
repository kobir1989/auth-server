const User = require("../models/user.schema");
const asyncHandler = require("../helper/asyncHandler");
const CustomError = require("../utils/customError");
const mailHelper = require("../helper/mailHelper");
const crypto = require("crypto");
const cookieOptions = require("../utils/cookieOption")



/******************************************************************
 * @SIGNUP
 * @Routes http://localhost:5000//api/auth/signup
 * @Description User will be able to create new user account
 * @parameters name, password, confirm password
 * @returns User object

*******************************************************************/

module.exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new CustomError("All the feilds are required", 400);
  }
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new CustomError("User already exists", 400);
  }
  const user = await User.create({
    name,
    email,
    password,
  });
  const token = user.getJwtToken();
  console.log(user);
  user.password = undefined;

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    token,
    user,
  });
});

/******************************************************************
 * @LOGIN
 * @Routes http://localhost:5000//api/auth/login
 * @Description User will be able to login based on valid email and password
 * @parameters email, password
 * @returns User object, token with cookie

*******************************************************************/

module.exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError("Email and Password are required", 400);
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new CustomError("Invalid Credintials", 403);
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new CustomError("Invalid Credintials", 403);
  }

  user.password = undefined;
  const token = user.getJwtToken();
  res.cookie("token", token, cookieOptions);
  res.status(200).json({
    success: true,
    user,
    token,
  });
});

/******************************************************
 * @FORGOT_PASSWORD
 * @route http://localhost:5000/api/auth/password/forgot
 * @description User will submit email and will generate a token
 * @parameters  email
 * @returns success message - email send
 ******************************************************/

module.exports.forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError("Please submit user Email address", 400);
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError("User does not exists");
  }

  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });
  console.log(user);

  const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/password/reset/${resetToken}`;

  const text = `Your Password reset Url is \n\n${resetUrl}\n\n`;
  console.log(text);

  try {
    await mailHelper({
      email: user.email,
      subject: "Password reset email for website",
      text: text,
    });
    res.status(200).json({
      success: true,
      message: `Email send to ${user.email}`,
    });
  } catch (err) {
    user.forgetPasswordExpiry = undefined;
    user.forgetPasswordToken = undefined;
    await user.save({ validateBeforeSave: false });
    throw new CustomError(err.message || "Email sent failed", 500);
  }
});

/******************************************************************
 * @RESET_PASSWORD
 * @Routes http://localhost:5000//api/auth/password/reset
 * @Description User will be able to reset password based on url token
 * @parameters  token from url, password and confirm password
 * @returns User object

*******************************************************************/

module.exports.resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;
  if (!password || !confirmPassword) {
    throw new CustomError("New Password and Confirm Password are required", 400);
  }
  if (password !== confirmPassword) {
    throw new CustomError("Password did not match", 400);
  }
  const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const user = await User.findOne({
    forgetPasswordToken: resetPasswordToken,
    forgetPasswordExpiry: { $gt: Date.now() },
  });
  if (!user) {
    throw new CustomError("Invalid user", 403);
  }
  user.password = password;
  user.forgetPasswordExpiry = undefined;
  user.forgetPasswordToken = undefined;
  await user.save();
  const token = user.getJwtToken();
  user.password = undefined;

  res.cookie("token", token, cookieOptions);
  res.status(200).json({
    success: true,
    user,
  });
});

/******************************************************************
 * @CHANGE_PASSWROD
 * @Routes http://localhost:5000//api/auth/change/password
 * @Description User will be able to change password based on token
 * @parameters  _id from url, old password and  new password, confirm password
 * @returns User object

*******************************************************************/
module.exports.changePassword = asyncHandler(async (req, res) => {
  const { password, newPassword, confirmNewPassword } = req.body;
  console.log(newPassword, confirmNewPassword);
  const { _id } = req.params;
  if (!password || !newPassword || !confirmNewPassword) {
    throw new CustomError("Password and Confirm Password are required", 400);
  }
  if (newPassword !== confirmNewPassword) {
    throw new CustomError("Password did not match", 400);
  }
  const user = await User.findById({ _id }).select("+password");
  if (!user) {
    throw new CustomError("User not found", 400);
  }

  const checkPassword = await user.comparePassword(password);
  if (!checkPassword) {
    throw new CustomError("Invalid Credential", 403);
  }
  user.password = newPassword;
  await user.save();
  user.password = undefined;
  user.forgetPasswordExpiry = undefined;
  user.forgetPasswordToken = undefined;
  const token = user.getJwtToken();
  res.cookie("token", token, cookieOptions);
  res.status(200).json({
    success: true,
    user,
  });
});

/******************************************************************
 * @LOGOUT
 * @Routes http://localhost:5000//api/auth/logout
 * @Description User will be able to logout by hiting this route
 * @parameters  token from url, password and confirm password
 * @returns User object

*******************************************************************/

module.exports.logout = asyncHandler(async (_req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });
  res.status(200).json({ success: true, message: "Logged out successfully"});
});
