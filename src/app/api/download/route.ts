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
    // Use axios for better stream handling and compatibility
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      // Do not set a custom User-Agent as it might trigger bot detection
      headers: {
        'Accept': '*/*',
      }
    });

    const headers: Record<string, string> = {
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Type': response.headers['content-type'] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    };
    
    const contentLength = response.headers['content-length'];
    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    // Return the stream directly
    return new Response(response.data, {
      headers,
    });
  } catch (error: any) {
    const message = error.response?.statusText || error.message;
    console.error('Download Proxy Error:', message);
    return NextResponse.json({ 
      error: 'Failed to proxy download', 
      message,
      status: error.response?.status || 500
    }, { status: 500 });
  }
}
