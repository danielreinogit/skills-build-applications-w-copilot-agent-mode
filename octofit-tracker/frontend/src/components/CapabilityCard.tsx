import { useEffect, useMemo, useState } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  path: string;
  emptyMessage: string;
  extractItems: (payload: Record<string, unknown>) => T[];
  renderItem: (item: T, index: number) => React.ReactNode;
};

export function CapabilityCard<T>({ title, description, path, emptyMessage, extractItems, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const payload = await getJson<Record<string, unknown>>(path);
        if (!isActive) return;
        setItems(extractItems(payload));
      } catch (caughtError) {
        if (!isActive) return;
        const message = caughtError instanceof Error ? caughtError.message : 'Unknown error';
        setError(message);
        setItems([]);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void load();
    return () => {
      isActive = false;
    };
  }, [extractItems, path]);

  const content = useMemo(() => {
    if (loading) {
      return <p role="status">Loading...</p>;
    }

    if (error) {
      return <p role="alert">Unable to load {title.toLowerCase()}. Please try again.</p>;
    }

    if (items.length === 0) {
      return <p>{emptyMessage}</p>;
    }

    return <ul className="list-unstyled mb-0">{items.map((item, index) => <li key={index}>{renderItem(item, index)}</li>)}</ul>;
  }, [error, items, loading, emptyMessage, renderItem, title]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {content}
      </div>
    </section>
  );
}
