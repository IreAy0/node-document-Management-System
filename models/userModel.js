import { Schema as _Schema, model } from 'mongoose';


var Schema = _Schema;

var userSchema = new Schema({
  email:{
    type: String,
    unique: true,
    required: true,
  },
  password:{
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
  },
  bio: {
    type: String,
  },
  joined: {
    type: Date,
    default: Date.now,
  },
  socialMediaLinks: {
    facebook: {
      type: String,
    },
    twitter: {
      type: String,
    },
    instagram: {
      type: String,
    },
   
  },
  bookmarks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Document',
    },
  ],
  documents: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Document'
    }
  ]
}, {timestamps: true})
// Compile model from schema
export default model('User', userSchema );