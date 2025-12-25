export type Role = 'user' | 'model';

export type ContentType = 'text' | 'image' | 'audio';

export interface Message {
  id: string;
  role: Role;
  type: ContentType;
  content: string; // Text content or Base64 data
  timestamp: number;
  isStreaming?: boolean;
}

export interface BotOption {
  id: string;
  name: string;
  description: string;
  model: string;
  type: 'text' | 'image';
  icon?: string;
}

export const BOTS: BotOption[] = [
  {
    id: 'hrilagpt-pro',
    name: 'Hrilagpt Pro',
    description: 'Great for everyday tasks',
    model: 'gemini-3-flash-preview',
    type: 'text'
  },
  {
    id: 'hrilagpt-pro-2.1',
    name: 'Hrilagpt Pro 2.1',
    description: 'Advanced reasoning & coding',
    model: 'gemini-3-pro-preview',
    type: 'text'
  },
  {
    id: 'zinegpt-pro',
    name: 'ZineGPT Pro',
    description: 'Generates DALL-E style images',
    model: 'gemini-2.5-flash-image',
    type: 'image'
  }
];

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface AspectRatioOption {
  value: AspectRatio;
  label: string;
  icon: string;
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { value: '1:1', label: 'Square', icon: 'square' },
  { value: '3:4', label: 'Portrait', icon: 'rectangle-vertical' },
  { value: '4:3', label: 'Landscape', icon: 'rectangle-horizontal' },
  { value: '9:16', label: 'Mobile', icon: 'smartphone' },
  { value: '16:9', label: 'Widescreen', icon: 'monitor' },
];

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  aspectRatio: string;
  timestamp: number;
}