const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: newUser
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if the user sent an email and password
  if (!email || !password) {
    return next(new AppError('Please provide an email and password', 400));
  }
  //2. check if the user exists and if the password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError('The user email and password combination is incorrect', 400)
    );
  }
  //3. send token
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    message: `${user.name} is logged in`
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Get token and check if it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You must be logged in to view this page', 401));
  }
  // 2. Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3. Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('This user no longer exists', 401));
  }

  //4. Check if user changed password after token was issued
  if (freshUser.changedPasswordAfterLogin(decoded.iat)) {
    return next(
      new AppError(
        'Your password has been changed. Enter new password to login',
        401
      )
    );
  }
  // only after all the above checks are passed do you grant access to protected route
  req.user = freshUser;
  next();
});

//middlewares do not accept parameters so create a wrapper function that takes the needed args then immediately returns the middleware function
// the middlware then has access to the array arg roles[] due to closure
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have the permission to perform this operation',
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. Get User based on generated email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  //2. Generate a random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3. Send the token to the user
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword/${resetToken}`;
  // next();
  const message = ` Here's your password reset link. It's only valid for 10 minutes: \n\n ${resetURL} \n\n If you didn't request to reset your password then ignore this email`;
  const subject = 'Password Reset Link';

  try {
    await sendEmail({
      email: user.email,
      subject,
      message
    });

    res.status(200).json({
      status: 'success',
      message: `Your password reset link has been sent. Check your email.`
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(`ERROR: ${err.message}`, 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1. Get user based on token received from reset token url
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    resetTokenExpires: { $gt: Date.now() }
  });

  //2. Check if token hasn't expired and there is a user then set new password
  if (!user) {
    return next(new AppError('The password reset link has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  //3. update the changedPasswordAt property for current user
  //this has been done directly on the userSchema using a presave middleware

  //4. Log user in
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    message: `${user.name}'s password has been changed successfully and is logged in`
  });
});
