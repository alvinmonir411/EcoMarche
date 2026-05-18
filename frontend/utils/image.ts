import { FASTLAIN_PLACEHOLDER } from "./fashionImages";

export const getImageUrl = (path?: any) => {
  if (!path) return FASTLAIN_PLACEHOLDER;
  
  let pathStr = typeof path === 'string' ? path : (path.imageUrl || path.image || path.thumbnail || '');
  if (!pathStr || typeof pathStr !== 'string') return FASTLAIN_PLACEHOLDER;

  if (pathStr.startsWith('http')) return pathStr;
  if (pathStr.startsWith('/')) return pathStr;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}/uploads/${pathStr.replace(/^\/+/, '')}`;
};
