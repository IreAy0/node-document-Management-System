import { Schema as _Schema, model } from 'mongoose';


var Schema = _Schema;

const commentSchema = new Schema({
  comment:{
    type: String,
    required: true
  },
  creator:{
    type: Object,
    ref: 'User',
    required: true
  }

}, { timestamps: true })

export default model('Comment', commentSchema );
