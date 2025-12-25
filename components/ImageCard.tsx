import React from 'react';
import { Download, Maximize2, Clock } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageCardProps {
  image: GeneratedImage;
  onPreview: (image: GeneratedImage) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onPreview }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `visionary-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer hover:border-zinc-600 transition-all duration-300"
      onClick={() => onPreview(image)}
    >
      <div className="aspect-square relative overflow-hidden bg-zinc-950">
        <img 
          src={image.url} 
          alt={image.prompt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <p className="text-white text-sm line-clamp-2 mb-3 font-medium">{image.prompt}</p>
          <div className="flex items-center justify-between">
             <div className="flex items-center text-xs text-zinc-300 gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(image.timestamp).toLocaleTimeString()}</span>
             </div>
             <button 
                onClick={handleDownload}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;