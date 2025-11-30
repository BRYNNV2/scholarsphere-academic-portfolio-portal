import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProfileUrl(user: { id: string; username?: string }) {
  return user.username ? `/u/${user.username}` : `/users/${user.id}`;
}
