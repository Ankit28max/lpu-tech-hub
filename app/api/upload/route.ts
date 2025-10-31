// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        console.log('Upload request received:', file?.name, file?.type, file?.size);

        if (!file) {
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ message: 'Invalid file type' }, { status: 400 });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json({ message: 'File too large' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop();
        const filename = `${timestamp}-${randomString}.${extension}`;

        // Save file to public/uploads directory
        const path = join(process.cwd(), 'public', 'uploads', filename);
        await writeFile(path, buffer);

        // Return the file URL
        const fileUrl = `/uploads/${filename}`;
        console.log('File uploaded successfully:', fileUrl);
        
        return NextResponse.json({ 
            message: 'File uploaded successfully', 
            fileUrl,
            filename 
        }, { status: 200 });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ message: 'Error uploading file' }, { status: 500 });
    }
}
