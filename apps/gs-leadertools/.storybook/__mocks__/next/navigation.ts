export const useRouter = () => ({
  push: (url: string) => console.log('[Mock router.push]', url),
  replace: () => {},
  refresh: () => {},
  back: () => {},
  forward: () => {},
  prefetch: () => Promise.resolve(),
});

export const usePathname = () => '/en';
export const useParams = () => ({ lang: 'en' });
export const useSearchParams = () => new URLSearchParams();
