import { useEffect, useState } from 'react';
import { Image } from 'react-native';

export const useLazyImage = (uri: string) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!uri) return;
    Image.prefetch(uri)
      .then(() => setLoaded(true))
      .catch(() => setError(true));
  }, [uri]);

  return { loaded, error };
};