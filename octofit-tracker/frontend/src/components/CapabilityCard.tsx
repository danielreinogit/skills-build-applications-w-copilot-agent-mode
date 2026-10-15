import { useEffect, useMemo, useState } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  emptyMessage: string;
  loadItems: () => Promise<T[]>;
  renderItem: (item: T, index: number) => React.ReactNode;
};

export function CapabilityCard<T>({ title, description, emptyMessage, loadItems, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const loadedItems = await loadItems();
        if (!isActive) return;
        setItems(loadedItems);
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
  }, [loadItems]);

  const content = useMemo(() => {
    if (loading) {
      return <p role="status">Loading...</p>;
    }

    if (error) {
      return <p role="alert">Unable to load {title.toLowerCase()}: {error}. Please try again.</p>;
    }

    if (items.length === 0) {
      return <p>{emptyMessage}</p>;
    }

    return <ul className="list-unstyled mb-0">{items.map((item, index) => <li key={index}>{renderItem(item, index)}</li>)}</ul>;
  }, [error, items, loading, emptyMessage, renderItem, title]);

  return (
    <section className="card h-100" aria-labelledby="capability-card-title">
      <div className="card-body">
        <h2 className="h4" id="capability-card-title">{title}</h2>
        <p>{description}</p>
        {content}
      </div>
    </section>
  );
}
