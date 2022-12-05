const User = require("../models/user.schema");
const asyncHandler = require("../helper/asyncHandler");
const CustomError = require("../utils/customError");
const mailHelper = require("../helper/mailHelper");
const crypto = require("crypto");

const cookieOptions = {
  httOnly: true,
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
};

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
    throw new CustomError("Ivalid user", 403);
  }
  user.password = password;
  user.forgetPasswordExpiry = undefined;
  user.forgetPasswordToken = undefined;
  await user.save()
  const token = user.getJwtToken();
  user.password = undefined;

  res.cookie("token", token, cookieOptions);
  res.status(200).json({
	success: true,
	user,
  })

});
