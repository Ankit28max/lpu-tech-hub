import mongoose, { Schema, Document, InferSchemaType } from 'mongoose';

const MessageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
});

MessageSchema.index({ conversation: 1, createdAt: -1 });

export type IMessage = InferSchemaType<typeof MessageSchema> & Document;

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);


