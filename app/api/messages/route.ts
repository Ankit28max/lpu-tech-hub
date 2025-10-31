import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import jwt, { JwtPayload } from 'jsonwebtoken';

const getUserIdFromToken = (request: NextRequest): string | null => {
  const token = request.headers.get("authorization")?.split(" ")[1] || "";
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return decoded.userId;
  } catch {
    return null;
  }
}

// GET /api/messages?with=usernameOrId -> fetch or create conversation with user and return thread
export async function GET(request: NextRequest) {
  await dbConnect();
  const userId = getUserIdFromToken(request);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const withUserId = searchParams.get('with');
  const convId = searchParams.get('conversationId');

  try {
    if (convId) {
      const messages = await Message.find({ conversation: convId }).sort({ createdAt: 1 });
      return NextResponse.json({ messages }, { status: 200 });
    }

    if (!withUserId) {
      // return recent conversations
      const conversations = await Conversation.find({ participants: userId })
        .sort({ lastMessageAt: -1 })
        .populate('participants', 'username');
      return NextResponse.json({ conversations }, { status: 200 });
    }

    let conversation = await Conversation.findOne({ participants: { $all: [userId, withUserId] } });
    if (!conversation) {
      conversation = new Conversation({ participants: [userId, withUserId] });
      await conversation.save();
    }
    const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });
    return NextResponse.json({ conversation, messages }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ message: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages -> send message { conversationId?, recipientId, content }
export async function POST(request: NextRequest) {
  await dbConnect();
  const userId = getUserIdFromToken(request);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const { conversationId, recipientId, content } = body as { conversationId?: string; recipientId: string; content: string };
  if (!recipientId || !content) return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
  try {
    let conversation = conversationId ? await Conversation.findById(conversationId) : await Conversation.findOne({ participants: { $all: [userId, recipientId] } });
    if (!conversation) {
      conversation = new Conversation({ participants: [userId, recipientId] });
      await conversation.save();
    }
    const message = new Message({ conversation: conversation._id, sender: userId, recipient: recipientId, content });
    await message.save();
    conversation.lastMessageAt = new Date();
    await conversation.save();
    return NextResponse.json({ message: 'Sent', conversationId: conversation._id, data: message }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: 'Failed to send message' }, { status: 500 });
  }
}


