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
    // Attempt to fetch the media stream with minimal headers to avoid 403
    // Some YouTube servers block requests that include Referer or Origin headers from a proxy
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
      },
      timeout: 15000,
      maxRedirects: 5
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

    return new Response(response.data, { headers });

  } catch (error: any) {
    console.error('Download Proxy Error:', error.message);
    
    // If the proxy still fails with 403, it means the URL is strictly IP-bound to the user.
    // In this case, we return a 403 status so the frontend can handle the direct download fallback.
    if (error.response?.status === 403) {
      return NextResponse.json({ 
        error: 'IP_RESTRICTED', 
        message: 'This link is restricted to your IP. Use direct download.',
        directUrl: url
      }, { status: 403 });
    }

    return NextResponse.json({ 
      error: 'Failed to proxy download', 
      message: error.message
    }, { status: 500 });
  }
}
