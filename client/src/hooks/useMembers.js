import { useState, useEffect, useCallback, useRef } from 'react';
import { getMembers } from '../lib/api';

export function useMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef(null);

  const fetchMembers = useCallback(async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await getMembers(query);
      setMembers(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchMembers(searchQuery);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, fetchMembers]);

  const refresh = useCallback(() => fetchMembers(searchQuery), [fetchMembers, searchQuery]);

  return {
    members,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    refresh,
  };
}
