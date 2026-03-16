import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Check for API key
    const apiKey = process.env.RAPIDAPI_KEY;
    console.log('Using API Key:', apiKey ? 'Key found (starts with ' + apiKey.substring(0, 5) + '...)' : 'Key NOT found');
    
    if (!apiKey || apiKey === 'YOUR_RAPIDAPI_KEY_HERE') {
      console.warn('RAPIDAPI_KEY is missing or using placeholder. Returning mock data for demo purposes.');
      // Return mock data if no key is provided so the user can see the UI working
      return NextResponse.json({
        title: "Demo: How to use YT Downloader",
        thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
        channel: "YT Downloader Team",
        duration: "05:30",
        formats: [
          { qualityLabel: "320kbps", url: "https://example.com/high.mp3", mimeType: "audio/mpeg", extension: "mp3" },
          { qualityLabel: "1080p", url: "https://example.com/1080.mp4", mimeType: "video/mp4", extension: "mp4" },
          { qualityLabel: "720p", url: "https://example.com/720.mp4", mimeType: "video/mp4", extension: "mp4" },
          { qualityLabel: "360p", url: "https://example.com/360.mp4", mimeType: "video/mp4", extension: "mp4" }
        ]
      });
    }

    // Using "YouTube Media Downloader" API as requested by the user
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const options = {
      method: 'GET',
      url: 'https://youtube-media-downloader.p.rapidapi.com/v2/video/details',
      params: { videoId: videoId },
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'youtube-media-downloader.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    const data = response.data;

    if (!data || data.status === false) {
      throw new Error(data.message || 'API failed to fetch video details');
    }

    // Mapping all audio formats and keeping only the best one
    const allAudioItems = data.audios?.items || [];
    const bestAudio = allAudioItems.length > 0 ? {
      qualityLabel: allAudioItems[0].bitrate ? `${allAudioItems[0].bitrate}kbps` : "320kbps",
      url: allAudioItems[0].url,
      mimeType: "audio/mpeg",
      extension: "mp3"
    } : null;

    const audioFormats = bestAudio ? [bestAudio] : [];

    // Standardizing video formats
    const videoFormats = data.videos?.items?.map((item: any) => ({
      qualityLabel: item.quality || "Video",
      url: item.url,
      mimeType: "video/mp4",
      extension: "mp4"
    })) || [];

    // Fallback: Check for adaptive formats if no audio was found yet
    let extraFormats: any[] = [];
    if (data.adaptiveFormats) {
      const adaptiveAudio = data.adaptiveFormats.find((f: any) => f.url && f.mimeType.includes("audio"));
      
      // Only add one adaptive audio if we didn't have one from the main list
      if (audioFormats.length === 0 && adaptiveAudio) {
        audioFormats.push({
          qualityLabel: adaptiveAudio.qualityLabel || (adaptiveAudio.bitrate ? `${Math.round(adaptiveAudio.bitrate / 1000)}kbps` : "128kbps"),
          url: adaptiveAudio.url,
          mimeType: "audio/mpeg",
          extension: "mp3"
        });
      }

      // Add video adaptive formats
      extraFormats = data.adaptiveFormats
        .filter((f: any) => f.url && f.mimeType.includes("video"))
        .map((f: any) => ({
          qualityLabel: f.qualityLabel || "Video",
          url: f.url,
          mimeType: f.mimeType,
          extension: "mp4"
        }));
    }

    // Combine formats with THE ONLY AUDIO FIRST
    const allFormats = [...audioFormats, ...videoFormats, ...extraFormats];

    return NextResponse.json({
      title: data.title || 'Unknown Title',
      thumbnail: data.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      channel: data.author?.name || 'YouTube Video',
      duration: data.lengthSeconds ? Math.floor(parseInt(data.lengthSeconds) / 60) + ":" + (parseInt(data.lengthSeconds) % 60).toString().padStart(2, '0') : 'N/A',
      formats: allFormats
    });

  } catch (error: any) {
    const errorDetails = error.response?.data?.message || error.message;
    console.error('API Error:', errorDetails);
    
    // Check for common error reasons
    let message = 'Failed to fetch video details. Please check the URL and try again.';
    if (error.response?.status === 401 || error.response?.status === 403) {
      message = 'Invalid API key. Please check your RAPIDAPI_KEY in .env.';
    } else if (error.response?.status === 429) {
      message = 'API rate limit exceeded. Please try again later.';
    }

    return NextResponse.json({ error: message, details: errorDetails }, { status: 500 });
  }
}

function extractVideoId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
