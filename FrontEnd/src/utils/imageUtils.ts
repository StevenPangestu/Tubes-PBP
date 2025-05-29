// imageUtils.ts - Utility functions for handling images

/**
 * Formats a profile picture URL to ensure it's properly displayed
 * Handles both relative paths and absolute URLs
 * 
 * @param profilePicture The profile picture path from the API
 * @param defaultImage Optional default image to use if profilePicture is null/undefined
 * @returns Formatted URL string
 */
export const formatProfilePictureUrl = (
  profilePicture: string | undefined | null,
  defaultImage: string = '/default-avatar.png'
): string => {
  if (!profilePicture) return defaultImage;
  return profilePicture.startsWith('http') 
    ? profilePicture 
    : `http://localhost:3000${profilePicture}`;
};

/**
 * Formats a post image URL to ensure it's properly displayed
 * 
 * @param imageUrl The image path from the API
 * @returns Formatted URL string
 */
export const formatPostImageUrl = (imageUrl: string): string => {
  return imageUrl.startsWith('http') 
    ? imageUrl 
    : `http://localhost:3000${imageUrl}`;
};
