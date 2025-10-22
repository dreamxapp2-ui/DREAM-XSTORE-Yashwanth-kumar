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
  lastName: {
    type: String,
    trim: true
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
    type: String,
    default : ''
  },
    pickup_location: {
      type:String,
      default : ""
    },
    pincode : {
      type : Number,
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
   collab : {
    type : [String],
    default : []
   }
   
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;