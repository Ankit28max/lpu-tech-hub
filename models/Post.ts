// models/Post.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

const CommentSchema: Schema = new Schema({
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});


export interface IPost extends Document {
  content: string;
  author: IUser['_id'];
  createdAt: Date;
  likes: IUser['_id'][]; 
  reposts: IUser['_id'][];
  comments: { 
    content: string;
    author: IUser['_id'];
    createdAt: Date;
  }[];
  category?: string;
  tags?: string[];
  imageUrl?: string;
}

const PostSchema: Schema = new Schema({
  content: {
    type: String,
    required: [true, 'Post content cannot be empty.'],
    trim: true,
    maxlength: [280, 'Post content cannot exceed 280 characters.'],
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // --- New Field ---
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  reposts: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  // -----------------
   comments: [CommentSchema],
  category: {
    type: String,
    default: 'general',
    enum: ['general', 'coding', 'learning', 'project', 'career'],
  },
  tags: [{
    type: String,
  }],
  imageUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);