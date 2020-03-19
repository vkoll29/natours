const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

//helpers
const filterobj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(e => {
    if (allowedFields.includes(e)) newObj[e] = obj[e];
  });
  return newObj;
};

//user route HANDLERS
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //1. Create error if user POSTS password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'You can not change your password here. Please use /updateMyPassword',
        401
      )
    );
  }

  //2. Filter out fields that cannot be changed in this field
  const filteredBody = filterobj(req.body, 'name', 'email');

  //3. Update user document

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'Success',
    data: 'null'
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Internal Server error'
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Internal Server error'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Internal Server error'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Internal Server error'
  });
};
