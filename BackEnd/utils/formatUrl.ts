import { Request } from 'express';

export const formatProfilePictureUrl = (path: string | null, req: Request): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};
