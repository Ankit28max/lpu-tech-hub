import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
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

// DELETE /api/messages/[messageId] -> delete a message
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ messageId: string }> }
) {
    await dbConnect();
    const userId = getUserIdFromToken(request);
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { messageId } = await params;

    try {
        const message = await Message.findById(messageId);

        if (!message) {
            return NextResponse.json({ message: 'Message not found' }, { status: 404 });
        }

        // Verify user owns the message
        if (message.sender.toString() !== userId) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await Message.findByIdAndDelete(messageId);

        return NextResponse.json({ message: 'Message deleted successfully' }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: 'Failed to delete message' }, { status: 500 });
    }
}
