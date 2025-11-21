import { z } from 'zod';
import mongoose from 'mongoose';

// Helper for ObjectId validation
const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
});

export const UserSchema = z.object({
    username: z.string().min(1, 'Username is required').trim(),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['student', 'admin']).default('student'),
    bio: z.string().max(200, 'Bio cannot exceed 200 characters').optional(),
    isAcceptingMentees: z.boolean().default(false),
    mentorshipSkills: z.array(z.string()).default([]),
});

export const MessageSchema = z.object({
    conversation: objectIdSchema,
    sender: objectIdSchema,
    recipient: objectIdSchema,
    content: z.string().min(1, 'Content is required').max(2000, 'Content too long'),
});

export const PostSchema = z.object({
    content: z.string().min(1, 'Content is required').max(280, 'Content too long').trim(),
    category: z.enum(['general', 'coding', 'learning', 'project', 'career']).default('general'),
    tags: z.array(z.string()).optional(),
    imageUrl: z.string().url().optional(),
});

export const ProjectSchema = z.object({
    title: z.string().min(1, 'Title is required').trim(),
    description: z.string().min(1, 'Description is required'),
    requiredSkills: z.array(z.string()).min(1, 'At least one skill is required'),
    status: z.enum(['open', 'closed']).default('open'),
});

export const ConversationSchema = z.object({
    participants: z.array(objectIdSchema).length(2, 'Conversation must have exactly two participants'),
});
