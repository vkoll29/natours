const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

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
