import { useEffect, useState } from 'react';

export const useTenantSavedIds = (tenantId: string | null) => {
  const [trigger, setTrigger] = useState(0);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setSavedIds([]);
      return;
    }

    const fetchTenant = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tenants/${tenantId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch tenant: ${res.status}`);
        }
        const data = await res.json();
        const saved = data.savedProperties ? data.savedProperties.split(',').filter(Boolean) : [];
        setSavedIds(saved);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching tenant:', err);
        setSavedIds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [tenantId, trigger]);

  const refetch = () => setTrigger(t => t + 1);

  return { savedIds, loading, error, refetch };
};