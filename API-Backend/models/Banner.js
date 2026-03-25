const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;
