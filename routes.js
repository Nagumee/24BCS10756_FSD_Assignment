const express = require('express');
const mongoose = require('mongoose');
const Registration = require('./Registration');

const myo = express.Router();

const _24bcs10756 = (id) => mongoose.Types.ObjectId.isValid(id);

myo.post('/', async (req, res, next) => {
  try {
    if (req.body.discountCode !== undefined && req.body.discountCode !== '') {
      const code = String(req.body.discountCode).trim().toUpperCase();
      if (!['CAMPUS50', 'EARLYBIRD'].includes(code)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid discount code',
          errors: ['Invalid discount code'],
        });
      }
    }

    const nagume = await Registration.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: nagume,
    });
  } catch (err) {
    next(err);
  }
});

myo.get('/', async (req, res, next) => {
  try {
    const nagume = {};
    if (req.query.eventType) nagume.eventType = req.query.eventType.toUpperCase();
    if (req.query.status) nagume.status = req.query.status.toUpperCase();

    const list = await Registration.find(nagume);
    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (err) {
    next(err);
  }
});

myo.get('/:id', async (req, res, next) => {
  try {
    if (!_24bcs10756(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration ID format',
      });
    }

    const nagume = await Registration.findById(req.params.id);
    if (!nagume) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: nagume,
    });
  } catch (err) {
    next(err);
  }
});

myo.put('/:id', async (req, res, next) => {
  try {
    if (!_24bcs10756(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration ID format',
      });
    }

    const existing = await Registration.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    if (req.body.discountCode !== undefined && req.body.discountCode !== '') {
      const code = String(req.body.discountCode).trim().toUpperCase();
      if (!['CAMPUS50', 'EARLYBIRD'].includes(code)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid discount code',
          errors: ['Invalid discount code'],
        });
      }
    }

    const eventType = req.body.eventType !== undefined ? req.body.eventType : existing.eventType;
    const teamSize = req.body.teamSize !== undefined ? req.body.teamSize : existing.teamSize;
    const ticketPrice = req.body.ticketPrice !== undefined ? req.body.ticketPrice : existing.ticketPrice;
    const discountCode = req.body.discountCode !== undefined ? req.body.discountCode : existing.discountCode;

    const payload = {
      ...req.body,
      eventType,
      teamSize,
      finalAmount: Registration.calcDiscount(ticketPrice, discountCode),
    };

    const nagume = await Registration.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
      context: 'query',
    });

    return res.status(200).json({
      success: true,
      message: 'Registration updated successfully',
      data: nagume,
    });
  } catch (err) {
    next(err);
  }
});

myo.delete('/:id', async (req, res, next) => {
  try {
    if (!_24bcs10756(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration ID format',
      });
    }

    const nagume = await Registration.findByIdAndDelete(req.params.id);
    if (!nagume) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Registration deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = myo;