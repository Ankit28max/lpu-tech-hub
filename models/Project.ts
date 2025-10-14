// models/Project.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IProject extends Document {
  title: string;
  description: string;
  owner: IUser['_id'];
  requiredSkills: string[];
  status: 'open' | 'closed';
  createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Project title is required.'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Project description is required.'],
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requiredSkills: {
    type: [String],
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);