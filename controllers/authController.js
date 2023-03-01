const asyncHandler = require("express-async-handler");
const User = require("../model/userModal");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const singnup = asyncHandler(async (req, res) => {
  const { username, email, password, passwordConfirm } = req.body;

  const user = await User.create({
    username,
    email,
    password,
    passwordConfirm,
  });

  const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false,
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  res.status(200).json({
    status: "success",
    token,
    user,
    message: `${(user, username)} user is created`,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(401)
      .json({ message: "Please filled login and password" });
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.checkPassword(password, user.password))) {
    res.status(401).json({
      status: "success",
      message: "Incorrect email or password",
    });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: false,
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(200).json({
    status: "success",
    token,
    user,
  });
});

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res
      .status(401)
      .json({ message: "your are not logged in to get access" });
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res.status(401).json({
      message: "The user belongig to the token does not exist",
    });
  }
  if (currentUser.changedPaswordAfter(decoded.iat)) {
    return res.status(401).json({
      message: "User recently changed password ! please login again",
    });
  }
  req.user = currentUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You don not have permission to deltete this",
      });
    }
    next();
  };
};

const forgotPassword = asyncHandler(async (req, res, next) => {
  //1)get email address
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404).json({ message: "please enter user email" });
  }
  //2)generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3)Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forot your password? Submit a PATCH request with your new password and
passwordConfirn to:${resetURL}.\nIf you didn't forgot your password,please
ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10min)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      res
        .status(500)
        .json({
          message: "There was an error sending the email,Try again later!",
        })
    );
  }
});
const resetPassword = asyncHandler(async (req, res, next) => {
  //1)Get user based token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2)If token has not explained, and there is user, set the new password
if(!user){
    return res.status(400).json({message:"Token is invalid or has expired"})
}
user.password = req.body.password;
user.passwordConfirm = req.body.passwordConfirm;
user.passwordResetToken = undefined;
user.passwordResetExpires = undefined;
await user.save();
  //3)Update changePasswordAt property for user

  //4)Log the user in,sendJWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({
    status:'success',
    token
  })
});

const updatePassword = asyncHandler(async(req,res)=>{
//1)Get user from collection

//2)check if posted currrent pasword is correct

//3)If so,update password

//4)Log user in ,send JWT
})
module.exports = {
  singnup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
};
