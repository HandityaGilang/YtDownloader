import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'download';

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Use native fetch for better compatibility with Web Streams in Next.js
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`External API responded with ${response.status}`);
    }

    // Return the body as a readable stream with Content-Length to show progress
    return new Response(response.body, {
      headers: {
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
        'Content-Length': response.headers.get('content-length') || '',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Download Proxy Error:', error.message);
    // Return a more descriptive error to help debugging
    return NextResponse.json({ 
      error: 'Failed to proxy download', 
      message: error.message,
      status: error.status || 500
    }, { status: 500 });
  }
}
