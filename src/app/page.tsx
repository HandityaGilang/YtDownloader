"use client";

import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Youtube, Download, Loader2, PlayCircle, User, AlertCircle } from "lucide-react";
import Image from "next/image";

interface Format {
  qualityLabel?: string;
  url: string;
  mimeType: string;
  itag?: number;
  extension?: string;
}

interface VideoDetails {
  thumbnail: string;
  title: string;
  channel: string;
  duration: string;
  formats: Format[];
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [selectedFormatIndex, setSelectedFormatIndex] = useState<string>("0");
  const [error, setError] = useState<string | null>(null);
  const [directDownloadUrl, setDirectDownloadUrl] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!url) return;
    
    // Simple validation for YouTube URL
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setIsLoading(true);
    setVideoDetails(null);
    setSelectedFormatIndex("0");
    setError(null);
    setDirectDownloadUrl(null);

    try {
      const response = await axios.post("/api/convert", { url });
      setVideoDetails(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch video details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    const index = parseInt(selectedFormatIndex);
    if (!videoDetails || !videoDetails.formats[index]) return;
    setIsDownloading(true);
    setError(null);
    setDirectDownloadUrl(null);

    try {
      const format = videoDetails.formats[index];
      const ext = format.extension || (format.mimeType.includes("audio") ? "mp3" : "mp4");
      const filename = `${videoDetails.title || 'video'}.${ext}`;
      
      const downloadUrl = `/api/download?url=${encodeURIComponent(format.url)}&filename=${encodeURIComponent(filename)}`;
      
      // Try a quick fetch to see if the proxy is allowed
      const response = await fetch(downloadUrl);
      
      if (response.status === 403) {
        setDirectDownloadUrl(format.url);
        setError("Proxy blocked by YouTube. Please use the direct link below.");
        setIsDownloading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Proxy server error");
      }

      // If okay, trigger the download via window location
      window.location.href = downloadUrl;
      setTimeout(() => setIsDownloading(false), 3000);

    } catch (err: any) {
      console.error("Download error:", err);
      const format = videoDetails.formats[index];
      setDirectDownloadUrl(format.url);
      setError("Connection issue. Please use the direct link below.");
      setIsDownloading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-8 px-4 md:py-16">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Image 
              src="/Logo.png" 
              alt="YT x Downloader Logo" 
              width={48} 
              height={48} 
              className="rounded-xl"
            />
            <h1 className="text-4xl font-bold tracking-tight">YT x Downloader</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Fast, simple, and professional YouTube video converter.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                type="url"
                placeholder="Paste YouTube URL here..."
                className={`h-12 bg-card border-border pr-10 ${error ? 'border-destructive' : ''}`}
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
            <Button 
              size="lg" 
              className="h-12 px-8 font-semibold"
              onClick={handleConvert}
              disabled={isLoading || !url}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Convert"
              )}
            </Button>
          </div>
          
          {error && (
            <div className="flex flex-col gap-3 px-1 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2 text-destructive text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
              {directDownloadUrl && (
                <a 
                  href={directDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 rounded-md text-xs font-bold w-fit transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Directly
                </a>
              )}
            </div>
          )}
        </div>

        {isLoading && (
          <Card className="border-border bg-card overflow-hidden shadow-sm animate-pulse">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row min-h-0">
                <Skeleton className="w-full md:w-72 aspect-video shrink-0" />
                <div className="p-5 flex-1 flex flex-col space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <div className="mt-auto space-y-3">
                    <Skeleton className="h-9 w-full" />
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-9 w-full" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {videoDetails && !isLoading && (
          <Card className="border-border bg-card overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row min-h-0">
                {/* Thumbnail Section */}
                <div className="relative w-full md:w-72 aspect-video bg-muted shrink-0 border-b md:border-b-0 md:border-r border-border">
                  <img
                    src={videoDetails.thumbnail}
                    alt={videoDetails.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                    {videoDetails.duration}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col min-w-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold line-clamp-2 leading-snug mb-1 text-foreground">
                      {videoDetails.title}
                    </h3>
                    <div className="flex items-center text-muted-foreground text-xs font-medium">
                      <User className="w-3 h-3 mr-1.5 shrink-0" />
                      <span className="truncate">{videoDetails.channel}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto space-y-3">
                    <div className="w-full">
                      <Select value={selectedFormatIndex} onValueChange={(val) => val && setSelectedFormatIndex(val)}>
                        <SelectTrigger className="w-full bg-secondary/30 border-border h-9 text-sm focus:ring-0">
                          {videoDetails && videoDetails.formats[parseInt(selectedFormatIndex)] ? (
                            <div className="flex items-center gap-2 truncate">
                              {videoDetails.formats[parseInt(selectedFormatIndex)].mimeType.includes("audio") ? (
                                <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter shrink-0 border border-blue-500/30 px-1 rounded-sm leading-none py-0.5 min-w-[36px] text-center bg-blue-500/10">
                                  Audio
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter shrink-0 border border-red-500/30 px-1 rounded-sm leading-none py-0.5 min-w-[36px] text-center bg-red-500/10">
                                  Video
                                </span>
                              )}
                              <span className="font-bold text-[10px] uppercase text-muted-foreground shrink-0">
                                {videoDetails.formats[parseInt(selectedFormatIndex)].extension || (videoDetails.formats[parseInt(selectedFormatIndex)].mimeType.includes("audio") ? "MP3" : "MP4")}
                              </span>
                              <span className="font-medium truncate text-xs">
                                {videoDetails.formats[parseInt(selectedFormatIndex)].qualityLabel}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Select Format</span>
                          )}
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border max-h-60 overflow-y-auto">
                          {videoDetails.formats.map((format, index) => {
                            const isAudio = format.mimeType.includes("audio");
                            return (
                              <SelectItem key={index} value={index.toString()} className="cursor-pointer text-sm py-1.5 focus:bg-secondary/50">
                                <div className="flex items-center gap-2">
                                  {isAudio ? (
                                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter shrink-0 border border-blue-500/30 px-1 rounded-sm leading-none py-0.5 min-w-[36px] text-center bg-blue-500/10">
                                      Audio
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter shrink-0 border border-red-500/30 px-1 rounded-sm leading-none py-0.5 min-w-[36px] text-center bg-red-500/10">
                                      Video
                                    </span>
                                  )}
                                  <span className="font-bold text-[10px] uppercase text-muted-foreground shrink-0 w-8">
                                    {format.extension || (isAudio ? "MP3" : "MP4")}
                                  </span>
                                  <span className="font-medium text-xs">
                                    {format.qualityLabel}
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 text-xs font-semibold" 
                        onClick={() => window.open(url, '_blank')}
                      >
                        <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-9 text-xs font-bold" 
                        onClick={handleDownload}
                        disabled={isDownloading || !videoDetails.formats[parseInt(selectedFormatIndex)]}
                      >
                        {isDownloading ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm text-muted-foreground">
          <div className="space-y-2">
            <div className="font-medium text-foreground">High Quality</div>
            <p>Download in 1080p, 4K and more.</p>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-foreground">Fast Processing</div>
            <p>Convert videos in seconds.</p>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-foreground">Free Converter</div>
            <p>Convert and download without any limits.</p>
          </div>
        </div>

        {/* About Section */}
        <div className="pt-16 pb-8 border-t border-border/50">
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground text-sm leading-relaxed text-justify">
            <h2 className="text-xl font-bold text-foreground text-center mb-8">About YT x Downloader</h2>
            
            <p>
              Welcome to <strong>YT x Downloader</strong>, your premier destination for high-quality YouTube video and audio conversions. 
              In an era where digital content is king, we understand the need for a reliable, fast, and completely free tool that helps 
              you save your favorite moments for offline viewing or listening. Our platform is meticulously designed to provide a 
              seamless user experience, stripping away the complexity often found in other conversion tools.
            </p>

            <p>
              Whether you are looking to extract high-fidelity audio for your podcast collection or download high-definition 1080p 
              videos for your next presentation, YT x Downloader has you covered. We support a wide array of formats, including 
              crystal-clear <strong>MP3 bitrates up to 320kbps</strong> and crisp MP4 video quality. Our advanced backend processing 
              ensures that your files are ready in seconds, utilizing high-speed proxy servers to deliver the data directly to your 
              device without unnecessary delays or intrusive buffering.
            </p>

            <p>
              Security and privacy are at the core of our philosophy. Developed by <strong>@HandityaGilang</strong>, YT x Downloader 
              requires no registration, no subscriptions, and no personal data. We believe in an open web where tools should be 
              accessible to everyone without barriers. Our "Free Converter" promise means you can download as much as you want, 
              whenever you want, without ever hitting a paywall.
            </p>

            <p>
              Using our tool is as simple as it gets: just paste your YouTube URL, select your preferred format and quality from 
              our clean, color-coded dropdown, and hit convert. Our intelligent system handles the rest, providing you with a 
              direct download link that respects your time and your device's storage. Thank you for choosing YT x Downloader—the 
              fast, professional, and truly free way to manage your YouTube media.
            </p>
          </div>
        </div>
      </div>
      
      {/* Watermark */}
      <div className="fixed bottom-4 right-4 text-muted-foreground/30 text-sm font-bold pointer-events-none select-none z-50">
        @HandityaGilang
      </div>
    </main>
  );
}
