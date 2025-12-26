import React, { useState, useRef, useEffect } from 'react';
import { Menu, Send, Zap, Image as ImageIcon, Sparkles, ChevronDown, AlertCircle } from 'lucide-react';
import { generateText, generateImage } from './services/genai';
import { Message, BOTS, BotOption } from './types';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  // Default to the first bot (now Image bot based on types.ts update)
  const [selectedBot, setSelectedBot] = useState<BotOption>(BOTS[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      type: 'text',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    try {
      let content = "";
      let type: 'text' | 'image' = 'text';

      if (selectedBot.type === 'image') {
        type = 'image';
        content = await generateImage(userMsg.content);
      } else {
        const history = messages
          .filter(m => m.type === 'text')
          .map(m => ({
             role: m.role,
             parts: [{ text: m.content }]
          }));
        
        content = await generateText(selectedBot.model, history, userMsg.content);
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        type: type,
        content: content,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (error: any) {
      console.error("Detailed API Error:", error);
      
      // Extract a readable error message
      let errorMessage = "I'm sorry, I encountered an error.";
      
      if (error.message) {
        if (error.message.includes('API Key')) {
            errorMessage = "Error: Invalid API Key. Please check your configuration.";
        } else if (error.message.includes('403') || error.message.includes('permission')) {
            errorMessage = "Error: Permission denied (403). Your API key might not have access to this model.";
        } else if (error.message.includes('400')) {
            errorMessage = "Error: Invalid request (400). The model might not support this specific prompt or configuration.";
        } else {
            errorMessage = `Error: ${error.message}`;
        }
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        type: 'text',
        content: `⚠️ **${errorMessage}**`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#343541] overflow-hidden text-gray-100 font-sans">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={() => {
            setMessages([]);
            // Default to Image bot when starting new chat
            setSelectedBot(BOTS[0]);
        }}
      />

      <div className="flex-1 flex flex-col h-full relative">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 p-2 text-gray-200 bg-[#343541] border-b border-white/5 flex items-center justify-between sm:justify-start sm:gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#40414f] rounded-md text-gray-300 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Model Selector */}
          <div className="relative">
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 font-semibold text-sm px-4 py-2 hover:bg-[#202123] rounded-xl transition-colors text-gray-200"
            >
              <span>{selectedBot.name}</span>
              <span className="text-gray-400 text-xs">
                {selectedBot.type === 'image' ? 'Img' : '3.0'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            
            {isDropdownOpen && (
                <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#202123] border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                        {BOTS.map(bot => (
                        <button
                            key={bot.id}
                            onClick={() => {
                                setSelectedBot(bot);
                                setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedBot.id === bot.id ? 'bg-[#343541]' : 'hover:bg-[#2A2B32]'}`}
                        >
                            <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${bot.type === 'image' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                                {bot.type === 'image' ? <ImageIcon className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">{bot.name}</div>
                                <div className="text-xs text-gray-400">{bot.description}</div>
                            </div>
                            {selectedBot.id === bot.id && <div className="ml-auto w-2 h-2 rounded-full bg-white"></div>}
                        </button>
                        ))}
                    </div>
                </div>
                </>
            )}
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white px-4 pb-20">
               <div className="mb-6 w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner border border-white/10">
                  {selectedBot.type === 'image' ? <ImageIcon className="w-8 h-8 text-purple-400" /> : <Sparkles className="w-8 h-8 text-white" />}
               </div>
               <h2 className="text-2xl font-semibold mb-8">
                 {selectedBot.type === 'image' ? "What should we create?" : "How can I help you today?"}
               </h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {selectedBot.type === 'image' ? (
                     <>
                        <button onClick={() => setInput("A futuristic city with neon lights at night")} className="group p-4 bg-transparent border border-white/10 rounded-xl hover:bg-[#40414f] text-left transition-all">
                            <h3 className="font-medium text-sm text-gray-200 mb-1 group-hover:text-white">A futuristic city</h3>
                            <p className="text-xs text-gray-500 group-hover:text-gray-400">with neon lights at night</p>
                        </button>
                        <button onClick={() => setInput("A cute robot holding a flower in a garden")} className="group p-4 bg-transparent border border-white/10 rounded-xl hover:bg-[#40414f] text-left transition-all">
                            <h3 className="font-medium text-sm text-gray-200 mb-1 group-hover:text-white">A cute robot</h3>
                            <p className="text-xs text-gray-500 group-hover:text-gray-400">holding a flower in a garden</p>
                        </button>
                     </>
                  ) : (
                    <>
                        <button onClick={() => setInput("Explain quantum computing in simple terms")} className="group p-4 bg-transparent border border-white/10 rounded-xl hover:bg-[#40414f] text-left transition-all">
                            <h3 className="font-medium text-sm text-gray-200 mb-1 group-hover:text-white">Explain quantum computing</h3>
                            <p className="text-xs text-gray-500 group-hover:text-gray-400">in simple terms</p>
                        </button>
                        <button onClick={() => setInput("Draft a professional email to a client")} className="group p-4 bg-transparent border border-white/10 rounded-xl hover:bg-[#40414f] text-left transition-all">
                            <h3 className="font-medium text-sm text-gray-200 mb-1 group-hover:text-white">Draft an email</h3>
                            <p className="text-xs text-gray-500 group-hover:text-gray-400">requesting a meeting</p>
                        </button>
                    </>
                  )}
               </div>
            </div>
          ) : (
            <div className="flex flex-col pb-32">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              
              {loading && (
                 <div className="w-full bg-[#444654] border-b border-black/5 dark:border-white/5 p-4 md:py-6">
                   <div className="md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl m-auto flex gap-4 md:gap-6 lg:px-0">
                     <div className="w-8 h-8 bg-[#19c37d] rounded-sm flex items-center justify-center flex-shrink-0">
                       <Sparkles className="w-5 h-5 text-white animate-pulse" />
                     </div>
                     <div className="flex items-center gap-1 h-8">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                     </div>
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#343541] via-[#343541] to-transparent pt-10 pb-6 px-4">
          <div className="max-w-3xl mx-auto">
             <form onSubmit={handleSend} className="relative flex flex-col w-full p-3 bg-[#40414f] border border-black/10 dark:border-gray-900/50 rounded-xl shadow-[0_0_10px_rgba(0,0,0,0.1)] focus-within:ring-1 focus-within:ring-gray-500/50 focus-within:border-gray-500/50 transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={selectedBot.type === 'image' ? "Describe the image you want to generate..." : "Send a message..."}
                  className="w-full max-h-[200px] py-2 px-2 bg-transparent border-0 focus:ring-0 resize-none text-white placeholder-gray-400 text-base custom-scrollbar"
                  rows={1}
                  style={{ minHeight: '24px' }}
                />
                <div className="flex justify-between items-center mt-2 pl-1">
                    <button type="button" className="p-2 text-gray-400 hover:text-gray-300 rounded-md hover:bg-black/10 transition-colors" title="Attach (Demo)">
                        <div className="w-5 h-5 border-2 border-current rounded-full flex items-center justify-center text-[10px] font-bold">+</div>
                    </button>
                    <button 
                    type="submit"
                    disabled={!input.trim() || loading}
                    className={`p-2 rounded-md transition-all duration-200 ${
                        !input.trim() || loading 
                        ? 'bg-transparent text-gray-500 cursor-not-allowed' 
                        : 'bg-[#19c37d] text-white hover:bg-[#1a885d] shadow-sm'
                    }`}
                    >
                    <Send className="w-4 h-4" />
                    </button>
                </div>
             </form>
             <div className="text-center mt-2 text-xs text-gray-500">
                Hrilagpt Pro can make mistakes. Consider checking important information.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;