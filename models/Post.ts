// models/Post.ts
import mongoose, { Schema, Document, InferSchemaType } from 'mongoose';

const CommentSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new Schema({
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

export type IPost = InferSchemaType<typeof PostSchema> & Document;

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);