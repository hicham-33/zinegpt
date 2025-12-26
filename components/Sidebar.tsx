import React from 'react';
import { Plus, MessageSquare, Settings, Trash2 } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onNewChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, onNewChat }) => {
  return (
    <div 
      className={`
        fixed inset-y-0 left-0 z-50 bg-[#202123] text-white transition-transform duration-300 flex flex-col border-r border-white/5 w-[260px]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 ${isOpen ? 'md:w-[260px]' : 'md:w-0 md:overflow-hidden'}
      `}
    >
      <div className="p-3 flex-1 overflow-hidden flex flex-col">
        <button 
          onClick={onNewChat}
          className="flex items-center gap-3 px-3 py-3 rounded-md border border-white/20 hover:bg-[#2A2B32] transition-colors text-sm text-white mb-4 text-left"
        >
          <Plus className="w-4 h-4" />
          <span>New chat</span>
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-2 pb-2">
            <span className="px-3 py-2 text-xs font-semibold text-gray-500">Today</span>
            <button className="flex items-center gap-3 px-3 py-3 text-sm text-gray-100 hover:bg-[#2A2B32] rounded-md transition-colors truncate">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="truncate">New conversation</span>
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 p-2">
        <button className="flex items-center gap-3 px-3 py-3 w-full hover:bg-[#2A2B32] rounded-md text-sm text-white transition-colors">
          <Trash2 className="w-4 h-4 text-white" />
          <span>Clear conversations</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-3 w-full hover:bg-[#2A2B32] rounded-md text-sm text-white transition-colors">
          <Settings className="w-4 h-4 text-white" />
          <span>Settings</span>
        </button>
        <div className="my-1 border-t border-white/10"></div>
        <button className="flex items-center gap-3 px-3 py-3 w-full hover:bg-[#2A2B32] rounded-md text-sm text-white transition-colors">
           <div className="w-6 h-6 bg-green-500 rounded-sm flex items-center justify-center text-[10px] font-bold">HP</div>
           <div className="flex-1 text-left">
             <div className="font-medium">Hrilagpt User</div>
             <div className="text-xs text-gray-400">Pro Plan</div>
           </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;