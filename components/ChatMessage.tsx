import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Play, Square, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { Message } from '../types';
import { generateSpeech } from '../services/genai';

interface ChatMessageProps {
  message: Message;
}

// Singleton AudioContext to prevent browser limit errors
let sharedAudioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
  }
  // Resume if suspended (common browser policy)
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume();
  }
  return sharedAudioContext;
};

const playAudio = async (base64Audio: string) => {
  try {
    const ctx = getAudioContext();
    const binaryString = atob(base64Audio.split(',')[1]);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
    return source;
  } catch (e) {
    console.error("Audio playback error", e);
    // Reset context on fatal error if needed
    sharedAudioContext = null; 
  }
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    
    setIsLoadingAudio(true);
    try {
      // Generate speech if content is text, otherwise handle accordingly
      const textToRead = message.type === 'text' ? message.content : "I generated an image for you.";
      const audioData = await generateSpeech(textToRead);
      
      setIsLoadingAudio(false);
      setIsPlaying(true);
      await playAudio(audioData);
      
      // Simple timeout to reset icon, ideally we'd track the source onended event
      // but source creation is decoupled in the singleton helper for simplicity here.
      setTimeout(() => setIsPlaying(false), 5000); 
    } catch (e) {
      console.error(e);
      setIsLoadingAudio(false);
      setIsPlaying(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`
      w-full border-b border-black/5 dark:border-white/5 
      ${isUser ? 'bg-[#343541]' : 'bg-[#444654]'}
    `}>
      <div className="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl p-4 md:py-6 flex lg:px-0 m-auto">
        
        {/* Avatar */}
        <div className="flex-shrink-0 flex flex-col relative items-end">
          <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${isUser ? 'bg-zinc-500' : 'bg-[#19c37d]'}`}>
            {isUser ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Sparkles className="w-5 h-5 text-white" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-hidden">
          <div className="font-semibold text-sm mb-1 opacity-90 block md:hidden">{isUser ? 'You' : 'Hrilagpt'}</div>
          
          {message.type === 'image' ? (
            <div className="mt-1">
               <img 
                 src={message.content} 
                 alt="Generated" 
                 className="rounded-lg shadow-lg max-w-sm w-full border border-white/10" 
                 loading="lazy"
               />
            </div>
          ) : (
             <div className="prose prose-invert max-w-none min-h-[20px] text-[15px] leading-relaxed markdown-body">
               <ReactMarkdown remarkPlugins={[remarkGfm]}>
                 {message.content}
               </ReactMarkdown>
             </div>
          )}

          {/* Actions for Model Messages */}
          {!isUser && (
             <div className="flex items-center gap-3 mt-3">
                {message.type === 'text' && (
                  <>
                    <button 
                      onClick={copyToClipboard}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors"
                      title="Copy text"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={handlePlayAudio}
                      disabled={isLoadingAudio || isPlaying}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors flex items-center gap-1"
                      title="Read Aloud"
                    >
                       {isLoadingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    </button>
                  </>
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;