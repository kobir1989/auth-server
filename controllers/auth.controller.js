const User = require("../models/user.schema");
const asyncHandler = require("../helper/asyncHandler");
const CustomError = require("../utils/customError");

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
