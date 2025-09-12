import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a username from an email address by extracting the part before '@'
 * and applying necessary transformations for database compatibility.
 * 
 * @param email - The email address to extract username from
 * @returns A clean username suitable for database storage
 */
export function generateUsernameFromEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required and must be a string');
  }

  // Extract the part before '@'
  const localPart = email.split('@')[0];
  
  if (!localPart) {
    throw new Error('Invalid email format');
  }

  // Clean the username: lowercase, remove special characters, limit length
  let username = localPart
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '') // Keep only alphanumeric, dots, underscores, hyphens
    .replace(/^[._-]+|[._-]+$/g, '') // Remove leading/trailing dots, underscores, hyphens
    .substring(0, 30); // Limit to 30 characters

  // Ensure username is not empty after cleaning
  if (!username) {
    username = 'user';
  }

  // Ensure username doesn't start with a number (common database constraint)
  if (/^\d/.test(username)) {
    username = 'user' + username;
  }

  return username;
}

/**
 * Generates a unique username by appending a number if the base username is taken.
 * This function should be used in combination with database uniqueness checks.
 * 
 * @param baseUsername - The base username to make unique
 * @param existingUsernames - Array of existing usernames to check against
 * @returns A unique username
 */
export function ensureUniqueUsername(baseUsername: string, existingUsernames: string[]): string {
  if (!baseUsername || typeof baseUsername !== 'string') {
    throw new Error('Base username is required and must be a string');
  }

  if (!Array.isArray(existingUsernames)) {
    throw new Error('Existing usernames must be an array');
  }

  let username = baseUsername;
  let counter = 1;

  // Check if username exists and append number until unique
  while (existingUsernames.includes(username)) {
    const suffix = counter.toString();
    // Ensure total length doesn't exceed 30 characters
    const maxBaseLength = 30 - suffix.length;
    username = baseUsername.substring(0, maxBaseLength) + suffix;
    counter++;
    
    // Prevent infinite loop (should never happen with reasonable usernames)
    if (counter > 9999) {
      throw new Error('Unable to generate unique username');
    }
  }

  return username;
}