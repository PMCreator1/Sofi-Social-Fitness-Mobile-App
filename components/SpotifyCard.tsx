
import React from 'react';
import { Music } from 'lucide-react';

interface SpotifyCardProps {
  url: string;
}

export const SpotifyCard: React.FC<SpotifyCardProps> = ({ url }) => {
  if (!url) return null;

  // Helper to convert standard URLs to Embed URLs
  const getEmbedUrl = (inputUrl: string) => {
    if (inputUrl.includes('embed')) return inputUrl;
    // Handle playlist
    if (inputUrl.includes('open.spotify.com/playlist/')) {
       const id = inputUrl.split('playlist/')[1].split('?')[0];
       return `https://open.spotify.com/embed/playlist/${id}`;
    }
    // Handle album
    if (inputUrl.includes('open.spotify.com/album/')) {
        const id = inputUrl.split('album/')[1].split('?')[0];
        return `https://open.spotify.com/embed/album/${id}`;
    }
    // Handle track
    if (inputUrl.includes('open.spotify.com/track/')) {
        const id = inputUrl.split('track/')[1].split('?')[0];
        return `https://open.spotify.com/embed/track/${id}`;
    }
    return inputUrl;
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div className="bg-[#191414] rounded-2xl p-4 border border-[#1DB954]/30 shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-20">
            <Music size={64} className="text-[#1DB954]" />
        </div>
        <div className="flex items-center mb-3 relative z-10">
            <div className="w-6 h-6 bg-[#1DB954] rounded-full flex items-center justify-center mr-2">
                <Music size={14} className="text-black fill-current" />
            </div>
            <h3 className="text-[#1DB954] font-bold text-sm uppercase tracking-wider">Group Playlist</h3>
        </div>
        
        <div className="rounded-xl overflow-hidden bg-black relative z-10 h-[80px]">
            <iframe 
                src={embedUrl} 
                width="100%" 
                height="80" 
                frameBorder="0" 
                allow="encrypted-media" 
                title="Spotify"
                className="bg-transparent"
            ></iframe>
        </div>
    </div>
  );
};
