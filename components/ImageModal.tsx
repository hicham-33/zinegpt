import React from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageModalProps {
  image: GeneratedImage | null;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `visionary-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(image.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Image Section */}
        <div className="flex-1 bg-zinc-950 flex items-center justify-center p-4 min-h-[400px]">
          <img 
            src={image.url} 
            alt={image.prompt} 
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
          />
        </div>

        {/* Sidebar Section */}
        <div className="w-full md:w-96 flex flex-col border-t md:border-t-0 md:border-l border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
             <h3 className="font-semibold text-white">Image Details</h3>
             <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
               <X className="w-5 h-5" />
             </button>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2 block">Prompt</label>
                <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 text-zinc-200 text-sm leading-relaxed">
                  {image.prompt}
                </div>
                <button 
                  onClick={handleCopyPrompt}
                  className="mt-2 flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied to clipboard" : "Copy prompt"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1 block">Aspect Ratio</label>
                    <span className="text-zinc-300 text-sm font-medium">{image.aspectRatio}</span>
                 </div>
                 <div>
                    <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1 block">Created</label>
                    <span className="text-zinc-300 text-sm font-medium">{new Date(image.timestamp).toLocaleDateString()}</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
            <button 
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-zinc-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Image
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImageModal;