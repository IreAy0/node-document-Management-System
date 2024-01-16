import { Schema as _Schema, model } from 'mongoose';


var Schema = _Schema;

const documentSchema = new Schema({
  title:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  category:{
    type: String,
    required: false
  },
  author:{
    type: String,
    required: false
  },
  fileSize: {
    type: String,
  },
  coverImage: {
    type: String,
  },
  documentUrl:{
    type: String,
    required: true
  },
  comments:[
    {
      type: Object,
      ref: 'Comment'
    }
  ],
  creator:{
    type: Object,
    ref: 'User',
    required: true
  }

}, { timestamps: true })

export default model('Document', documentSchema );
