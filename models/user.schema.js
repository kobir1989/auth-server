const { Schema, model } = require("mongoose");
const authRole = require("../utils/authRoles");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/index");
const crypto = require("crypto");

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [20, "Name should be less then 20 char:"],
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      require: [true, "Email required"],
    },
    password: {
      type: String,
      minlength: [6, "Password should be at least 6 char:"],
      require: [true, "Password required"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(authRole),
      default: authRole.USER,
    },
    forgetPasswordToken: String,
    forgetPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

//Mongoose pre hook
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//Method
userSchema.methods = {
  //Compare Password method
  comparePassword: async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  },

  //Create JWT token method
  getJwtToken: function () {
    return jwt.sign({ _id: this._id, role: this.role }, config.JWT_SECRET, {
      expiresIn: process.JWT_EXPIRE,
    });
  },

  //Create forget password Token
  generateForgetPasswordToken: function () {
    const forgetToken = crypto.randomBytes(20).toString("hex");

    //Save to database with sha256 incrypton
    this.forgetPasswordToken = crypto.createHash("sha256").update(forgetToken).digest("hex");
    this.forgetPasswordExpiry = Date.now() + 20 * 60 * 1000;
    return forgetToken;
  },
};

const User = model("User", userSchema);

module.exports = User;
