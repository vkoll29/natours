const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

//helpers
const filterobj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(e => {
    if (allowedFields.includes(e)) newObj[e] = obj[e];
  });
  return newObj;
};

//user route HANDLERS

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

// exports.createUser = factory.create(User);
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Please use /signup to create an account'
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

//DO NOT UPDATE PASSWORDS WITH THIS. It's only for administratice purposes
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
