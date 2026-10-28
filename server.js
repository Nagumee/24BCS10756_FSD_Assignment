require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes');

const myo = express();
const _24bcs10756 = process.env.PORT || 5000;
const nagume = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/24bcs10756_events';

myo.use(express.json());
myo.use('/api/registrations', routes);

myo.use((err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'This email is already registered for the event',
    });
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({
      success: false,
      message: 'Invalid registration ID format',
    });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

mongoose
  .connect(nagume)
  .then(() => {
    myo.listen(_24bcs10756, () => {
      console.log(`Server running on port ${_24bcs10756}`);
    });
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });