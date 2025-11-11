import { useEffect } from 'react';
const DEFAULT_TITLE = 'ScholarSphere';
export function usePageTitle(title?: string) {
  useEffect(() => {
    if (title) {
      document.title = `${title}`;
    } else {
      document.title = DEFAULT_TITLE;
    }
    // Optional: Reset title on component unmount
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
}