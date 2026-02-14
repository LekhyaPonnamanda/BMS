import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '../context/AuthContext';

const SnackPoints = forwardRef(function SnackPoints(props, ref) {
  const { user } = useAuth();
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPoints = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    console.log('🪙 Fetching points for userId:', user.id);
    fetch(`http://localhost:8090/api/rewards/points/${user.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch points');
        return res.json();
      })
      .then((data) => {
        console.log('✅ Points fetched:', data);
        setPoints(data);
      })
      .catch((err) => {
        console.error('❌ Error fetching points:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      console.log('🔄 SnackPoints.refresh() called explicitly');
      fetchPoints();
    },
    updatePoints: (newPoints) => {
      // Synchronous state update - fastest possible
      const startTime = performance.now();
      setPoints(newPoints);
      setError(null);
      const endTime = performance.now();
      console.log('⚡ updatePoints() completed in ' + (endTime - startTime).toFixed(3) + 'ms');
    }
  }), [fetchPoints]);


  useEffect(() => {
    fetchPoints();
    const interval = setInterval(() => {
      fetchPoints();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [fetchPoints]);

  if (!user?.id) return null;
  if (loading) return <span title="Loading snack points...">🪙 ...</span>;
  if (error) return <span title={error}>🪙 ?</span>;
  return <span title="Your active snack points">🪙 {points}</span>;
});

export default SnackPoints;