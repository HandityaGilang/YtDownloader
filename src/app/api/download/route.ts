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
    // Attempt to fetch the media stream
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Range': 'bytes=0-',
        'Referer': 'https://www.youtube.com/',
        'Origin': 'https://www.youtube.com/'
      },
      timeout: 10000 // 10s timeout for the initial connection
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
    
    // If the proxy fails with Forbidden (403), it usually means the YouTube server 
    // requires the client's direct IP. In this case, we REDIRECT the browser 
    // to the direct URL so the user still gets the file (even if it opens in a tab).
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.log('Redirecting to direct URL due to 403/401');
      return NextResponse.redirect(url);
    }

    return NextResponse.json({ 
      error: 'Failed to proxy download', 
      message: error.message,
      status: error.response?.status || 500
    }, { status: 500 });
  }
}
