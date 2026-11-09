import { useCallback, useEffect, useState } from 'react';
import { claimGuestScreenings, onScreeningsChanged, unclaimedGuestScreenings } from '@/lib/screening/sync';

/**
 * Guest-mode screenings saved on this device that no account has claimed yet.
 * The count updates live as screenings are saved or claimed.
 */
export function useGuestScreenings() {
  const [count, setCount] = useState(0);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = () =>
      unclaimedGuestScreenings()
        .then((screenings) => active && setCount(screenings.length))
        .catch(() => active && setCount(0)); // on-device storage blocked
    refresh();
    const unsubscribe = onScreeningsChanged(refresh);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const claim = useCallback(async (userId: string) => {
    setClaiming(true);
    try {
      await claimGuestScreenings(userId);
    } finally {
      setClaiming(false);
    }
  }, []);

  return { count, claiming, claim };
}
