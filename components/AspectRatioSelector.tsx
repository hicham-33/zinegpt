import React from 'react';
import { Square, RectangleHorizontal, RectangleVertical, Smartphone, Monitor } from 'lucide-react';
import { AspectRatio, ASPECT_RATIOS } from '../types';

interface AspectRatioSelectorProps {
  selected: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selected, onChange }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'square': return <Square className="w-4 h-4" />;
      case 'rectangle-vertical': return <RectangleVertical className="w-4 h-4" />;
      case 'rectangle-horizontal': return <RectangleHorizontal className="w-4 h-4" />;
      case 'smartphone': return <Smartphone className="w-4 h-4" />;
      case 'monitor': return <Monitor className="w-4 h-4" />;
      default: return <Square className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-zinc-400">Aspect Ratio</label>
      <div className="flex flex-wrap gap-2">
        {ASPECT_RATIOS.map((ratio) => (
          <button
            key={ratio.value}
            onClick={() => onChange(ratio.value)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 border
              ${selected === ratio.value 
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:border-zinc-600 hover:text-zinc-200'}
            `}
          >
            {getIcon(ratio.icon)}
            <span>{ratio.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AspectRatioSelector;