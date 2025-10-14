// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

// Updated interface to include the new fields
export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'admin';
  createdAt: Date;
  bio?: string;
  isAcceptingMentees: boolean;
  mentorshipSkills: string[];
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required.'],
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // --- New Fields for Mentorship ---
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot exceed 200 characters.'],
    default: '',
  },
  isAcceptingMentees: {
    type: Boolean,
    default: false,
  },
  mentorshipSkills: {
    type: [String],
    default: [],
  },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);