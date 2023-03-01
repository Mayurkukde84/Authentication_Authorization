const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require('crypto')
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "username is required"],
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide your valid name"],
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: true,
    minlength: [8, " minimum 8 digit password is required"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      //this only works on create and save
      validator: function (el) {
        return this.password === el;
      },
      message: "password and confirmPassword are not same",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken:String,
  passwordResetExpires:Date
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next;
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next()
});

userSchema.methods.checkPassword= async function(currentPassword,userPassword){
  return await bcrypt.compare(currentPassword,userPassword)
}

userSchema.methods.changedPaswordAfter = function(JWTTimestamp){
  if(this.passwordChangedAt){
    const changeTimestamp = parseInt(this.passwordChangedAt.getTime()/1000,10)
    return JWTTimestamp < changeTimestamp
  }
  return false
}

userSchema.methods.createPasswordResetToken = function(){
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10*60*1000
  return resetToken
}
module.exports = mongoose.model("User", userSchema);
