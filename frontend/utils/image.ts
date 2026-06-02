import { ECOMARCHE_PLACEHOLDER } from "./fashionImages";

export const getImageUrl = (path?: any) => {
  if (!path) return ECOMARCHE_PLACEHOLDER;
  
  let pathStr = typeof path === 'string' ? path : (path.imageUrl || path.image || path.thumbnail || '');
  if (!pathStr || typeof pathStr !== 'string') return ECOMARCHE_PLACEHOLDER;

  if (pathStr.startsWith('http')) return pathStr;
  if (pathStr.startsWith('/')) return pathStr;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:4000';
  return `${baseUrl}/uploads/${pathStr.replace(/^\/+/, '')}`;
};
