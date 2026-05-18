import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary credentials are not configured' }, { status: 500 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Generate Signature
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const signatureStr = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

    // Prepare upload payload
    const uploadFormData = new FormData();
    uploadFormData.append('file', base64Image);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', timestamp.toString());
    uploadFormData.append('signature', signature);

    // Upload to Cloudinary
    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadFormData,
    });

    const data = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok) {
      console.error('Cloudinary Error:', data);
      return NextResponse.json({ error: data.error?.message || 'Failed to upload to Cloudinary' }, { status: cloudinaryResponse.status });
    }

    return NextResponse.json({ 
      success: true, 
      url: data.secure_url,
      publicId: data.public_id 
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error during upload' }, { status: 500 });
  }
}
