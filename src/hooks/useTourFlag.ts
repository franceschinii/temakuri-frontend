export function useTourFlag(userId: string | undefined) {
  const key = userId ? `temakuri-tour-seen-${userId}` : null;
  const hasSeen = key ? localStorage.getItem(key) === 'true' : true;
  const markSeen = () => { if (key) localStorage.setItem(key, 'true'); };
  return { hasSeen, markSeen };
}
