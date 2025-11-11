const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false
  },
  username: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  googleId: {
    type: String,
    sparse: true
  },
  profilePicture: {
    type: String
  },
  authType: {
    type: String,
    enum: ['email', 'google', 'facebook'],
    default: 'email'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  verificationTokenExpiry: {
    type: Date
  },
  bio:{
    type:String,
    default : ""
  },
  isBrand:{
    type:Boolean,
    default:false,
  },

  hero_image : {
    url: {
      type: String,
      default: null
    },
    publicId: {
      type: String,
      default: null
    }
  },
  pickup_location: {
  type: String,
  default: ""
},
  pincode : {
    type: Number,
    default : 0
  },
  bank_ac : {
    type : String,
    default : ""
  },
  ifsc : {
    type : String,
    default : ""
  },

   phone : {
    type : String,
    default : ""
   },
   address : {
    type : String,
    default : ""
   },
   city : {
    type: String,
    defualt : ""
   },
   state : {
    type: String,
    default :""
   },
   country : {
    type : String,
    default : ""
   },
  wishlist: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  followingBrands: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand'
    }
  ],
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'banned', 'inactive'],
    default: 'active'
  }

  //   "phone": "9777777779",
  //   "address": "Mutant Facility, Sector 3 ",
  //   "address_2": "",
  //   "city": "Pune",
  //   "state": "Maharshtra",
  //   "country": "India",
  //   "pin_code": "110022"

}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;