import { useState, useEffect, useMemo } from 'react';
import { listenToTeam } from '../firebase/db';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to listen to a team in real time.
 * Returns { team, members, isLeader, loading }.
 */
export function useTeam(teamId) {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) {
      setTeam(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = listenToTeam(teamId, (data) => {
      setTeam(data || null);
      setLoading(false);
    });

    return () => unsub();
  }, [teamId]);

  // Compute members array and isLeader safely
  const members = useMemo(() => {
    if (!team || !team.members) return [];
    return Object.entries(team.members).map(([uid, m]) => ({
      uid,
      ...m,
    }));
  }, [team]);

  const isLeader = useMemo(() => {
    if (!team || !user) return false;
    return team.leaderUid === user.uid;
  }, [team, user]);

  return { team, members, isLeader, loading };
}

export default useTeam;
