import { API_BASE } from '../api'
import { useEffect, useMemo, useState } from 'react'

function classNames (...xs) { return xs.filter(Boolean).join(' ') }

export function Studies ({ query, onCount }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [sortKey, setSortKey] = useState('year')
  const [sortDir, setSortDir] = useState('desc') // 'asc' | 'desc'
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => { setPage(1) }, [query])

  useEffect(() => {
    if (!query) {
      setRows([]);
      if (onCount) onCount(0);
      return;
    }
    let alive = true;
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      setErr('');
      try {
        const url = `${API_BASE}/query/${encodeURIComponent(query)}/studies`;
        const res = await fetch(url, { signal: ac.signal });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        if (!alive) return;
        const list = Array.isArray(data?.results) ? data.results : [];
        setRows(list);
        if (onCount) onCount(list.length);
      } catch (e) {
        if (!alive) return;
        setErr(`Unable to fetch studies: ${e?.message || e}`);
        setRows([]);
        if (onCount) onCount(0);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; ac.abort(); };
  }, [query, onCount]);

  const changeSort = (key) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    const arr = [...rows]
    const dir = sortDir === 'asc' ? 1 : -1
    arr.sort((a, b) => {
      const A = a?.[sortKey]
      const B = b?.[sortKey]
      // Numeric comparison for year; string comparison for other fields
      if (sortKey === 'year') return (Number(A || 0) - Number(B || 0)) * dir
      return String(A || '').localeCompare(String(B || ''), 'en') * dir
    })
    return arr
  }, [rows, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className='flex flex-col rounded-2xl border' style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div className='flex items-center justify-between p-3'>
        <div className='card__title'>Studies</div>
        <div className='text-sm text-gray-500'>
           {/* {query ? `Query: ${query}` : 'Query: (empty)'} */}
        </div>
      </div>


      {query && loading && (
        <div className='grid gap-3 p-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='h-10 animate-pulse rounded-lg bg-gray-100' />
          ))}
        </div>
      )}

      {query && err && (
        <div className='mx-3 mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
          {err}
        </div>
      )}

      {query && !loading && !err && (
        <div className='studies-scroll' style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'auto', maxHeight: '100%' }}>
          <table className='min-w-full text-sm' style={{ minWidth: '100%' }}>
            <thead className='sticky top-0 bg-gray-50 text-left'>
              <tr>
                {[
                  { key: 'year', label: 'Year' },
                  { key: 'journal', label: 'Journal' },
                  { key: 'title', label: 'Title' },
                  { key: 'authors', label: 'Authors' }
                ].map(({ key, label }) => (
                  <th key={key} className='cursor-pointer px-3 py-2 font-semibold' onClick={() => changeSort(key)}>
                    <span className='inline-flex items-center gap-2'>
                      {label}
                      </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr><td colSpan={4} className='px-3 py-4 text-gray-500'>No data</td></tr>
              ) : (
                pageRows.map((r, i) => (
                  <tr key={i} className={classNames(i % 2 ? 'bg-white' : 'bg-gray-50')}>
                    <td className='whitespace-nowrap px-3 py-2 align-top'>{r.year ?? ''}</td>
                    <td className='px-3 py-2 align-top'>{r.journal || ''}</td>
                    <td className='max-w-[540px] px-3 py-2 align-top'><div className='truncate' title={r.title}>{r.title || ''}</div></td>
                    <td className='px-3 py-2 align-top'>{r.authors || ''}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {query && !loading && !err && (
        <div className='flex flex-col border-t p-3 text-sm' style={{ position: 'sticky', bottom: 0, background: '#181a20', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '0.5em' }}>
            Total <b>{sorted.length}</b> studies | Page <b>{page}</b> / <b>{totalPages}</b><br />
            Showing <b>{sorted.length === 0 ? 0 : (page-1)*pageSize+1}</b> - <b>{Math.min(page*pageSize, sorted.length)}</b> studies
          </div>
          <div className='flex items-center justify-center gap-2'>
            <button disabled={page <= 1} onClick={() => setPage(1)} className='rounded-lg border px-2 py-1 disabled:opacity-40'>First</button>
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className='rounded-lg border px-2 py-1 disabled:opacity-40'>Previous</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className='rounded-lg border px-2 py-1 disabled:opacity-40'>Next</button>
            <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} className='rounded-lg border px-2 py-1 disabled:opacity-40'>Last</button>
          </div>
        </div>
      )}
    </div>
  )
}

