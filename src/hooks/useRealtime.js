import { useState, useEffect } from 'react';
import { ref, onValue, query as fbQuery, orderByChild } from 'firebase/database';
import { db } from '../firebase/config';

/**
 * Generic hook for listening to a path in Firebase RTDB.
 * Returns { data, loading, error }.
 */
export function useRealtime(path, options = {}) {
  const { orderBy, transform } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    let dbRef = ref(db, path);

    if (orderBy) {
      dbRef = fbQuery(dbRef, orderByChild(orderBy));
    }

    let unsub = () => {};
    try {
      unsub = onValue(
        dbRef,
        (snapshot) => {
          let val = snapshot.val();
          if (transform && val) {
            val = transform(val, snapshot);
          }
          setData(val);
          setLoading(false);
          setError(null);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );
    } catch (err) {
      setError(err);
      setLoading(false);
    }

    return () => unsub();
  }, [path, orderBy]);

  return { data, loading, error };
}

export default useRealtime;
