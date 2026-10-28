const mongoose = require('mongoose');

const _24bcs10756 = (myo, nagume) => {
  if (typeof myo !== 'number' || isNaN(myo)) return undefined;
  const code = nagume ? String(nagume).trim().toUpperCase() : undefined;
  if (!code) return myo;
  if (code === 'CAMPUS50') return myo * 0.5;
  if (code === 'EARLYBIRD') return Math.max(0, myo - 100);
  return myo;
};

const myo = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [3, 'Student name must be at least 3 characters'],
      maxlength: [50, 'Student name cannot exceed 50 characters'],
    },
    collegeEmail: {
      type: String,
      required: [true, 'College email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.in)$/i,
        'Must be a valid college email ending in .edu or .ac.in',
      ],
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      uppercase: true,
      trim: true,
      match: [
        /^[A-Z0-9]{8,10}$/,
        'Roll number must be alphanumeric and 8 to 10 characters',
      ],
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: {
        values: ['CODING_HACKATHON', 'AI_WORKSHOP', 'ROBOTICS', 'GAMING'],
        message: 'Invalid event type',
      },
    },
    teamSize: {
      type: Number,
      required: [true, 'Team size is required'],
      min: [1, 'Team size must be at least 1'],
      max: [4, 'Team size cannot exceed 4'],
      validate: [
        {
          validator: Number.isInteger,
          message: 'Team size must be an integer',
        },
        {
          validator: function (nagume) {
            let currentEvent = this.eventType;
            if (!currentEvent && typeof this.getUpdate === 'function') {
              const u = this.getUpdate();
              currentEvent = u.eventType || (u.$set && u.$set.eventType);
            }
            if (currentEvent === 'AI_WORKSHOP') {
              return nagume === 1;
            }
            return true;
          },
          message: 'AI Workshop only permits individual registrations',
        },
      ],
    },
    ticketPrice: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: [0, 'Ticket price cannot be negative'],
    },
    discountCode: {
      type: String,
      uppercase: true,
      trim: true,
      validate: {
        validator: function (nagume) {
          if (!nagume) return true;
          return ['CAMPUS50', 'EARLYBIRD'].includes(nagume);
        },
        message: 'Invalid discount code',
      },
    },
    finalAmount: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
      default: 'PENDING',
    },
    registrationDate: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function (nagume) {
          return nagume <= new Date();
        },
        message: 'Registration date cannot be in the future',
      },
    },
  },
  {
    toJSON: {
      transform(doc, nagume) {
        nagume.id = nagume._id;
        delete nagume._id;
        delete nagume.__v;
        return nagume;
      },
    },
  }
);

myo.statics.calcDiscount = _24bcs10756;

myo.pre('validate', function (next) {
  if (this.ticketPrice !== undefined) {
    this.finalAmount = _24bcs10756(this.ticketPrice, this.discountCode);
  }
  next();
});

const nagume = mongoose.model('Registration', myo);
module.exports = nagume;