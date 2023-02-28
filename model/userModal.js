const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
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
  password: {
    type: String,
    required: true,
    minlength: [8, " minimum 8 digit password is required"],
    select:false
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
});


userSchema.pre('save',async function(next){
  if(!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password,12)
  this.passwordConfirm = undefined
  
})

userSchema.methods.correctPassword =async function(candidatePassword,userPassword){
  return await bcrypt.compare(candidatePassword,userPassword);
}

module.exports = mongoose.model("User", userSchema);
