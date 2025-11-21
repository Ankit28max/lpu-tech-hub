// models/Project.ts
import mongoose, { Schema, Document, InferSchemaType } from 'mongoose';

const ProjectSchema = new Schema({
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

export type IProject = InferSchemaType<typeof ProjectSchema> & Document;

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);