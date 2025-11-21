import mongoose, { Schema, Document, InferSchemaType, Types } from 'mongoose';

const ConversationSchema = new Schema({
  participants: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    validate: {
      validator: function (arr: Types.ObjectId[]) {
        return Array.isArray(arr) && arr.length === 2;
      },
      message: 'Conversation must have exactly two participants.'
    },
    required: true,
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ participants: 1 }, { unique: false });

export type IConversation = InferSchemaType<typeof ConversationSchema> & Document;

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);


