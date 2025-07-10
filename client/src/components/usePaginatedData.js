import { useState, useEffect } from 'react';
import { request } from '../api';

export function usePaginatedData(url, initialPage = 1, limit = 10) {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    request({ url: `${url}?page=${page}&limit=${limit}` })
      .then((res) => {
        setData(res.auctions || res.data || []);
        setTotal(res.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [url, page, limit]);

  return { data, page, setPage, total, loading };
} 