import { API_BASE } from '../api'
import { useEffect, useMemo, useState } from 'react'

export function Terms ({ onPickTerm }) {
  const [terms, setTerms] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  // 分頁狀態
  const [page, setPage] = useState(1)
  const pageSize = 30

  useEffect(() => {
    let alive = true
    const ac = new AbortController()
    const load = async () => {
      setLoading(true)
      setErr('')
      try {
        const res = await fetch(`${API_BASE}/terms`, { signal: ac.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!alive) return
        setTerms(Array.isArray(data?.terms) ? data.terms : [])
      } catch (e) {
        if (!alive) return
        setErr(`Failed to fetch terms: ${e?.message || e}`)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false; ac.abort() }
  }, [])

  // 搜尋過濾
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    if (!s) return terms
    return terms.filter(t => t.toLowerCase().includes(s))
  }, [terms, search])

  // 分頁資料
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageTerms = filtered.slice((page - 1) * pageSize, page * pageSize)

  // 搜尋時自動跳到第一頁
  useEffect(() => { setPage(1) }, [search, filtered.length])

  return (
    <div className='terms'>
      {/* 搜尋框與清除按鈕 */}
      <div className='terms__controls' style={{ display: 'flex', alignItems: 'center', marginBottom: '1em' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search terms...'
          className='input'
          style={{ flex: 1, marginRight: '0.5em' }}
        />
        <button
          onClick={() => setSearch('')}
          className='btn btn--primary'
        >
          Clear
        </button>
      </div>

      {/* 分頁控制（移至下方） */}

      {loading && (
        <div className='terms__skeleton'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='terms__skeleton-row' />
          ))}
        </div>
      )}

      {err && (
        <div className='alert alert--error'>
          {err}
        </div>
      )}

      {!loading && !err && (
        <div className='terms__list'>
          {filtered.length === 0 ? (
            <div className='terms__empty'>No terms found</div>
          ) : (
            <>
              <ul className='terms__ul'>
                {pageTerms.map((t, idx) => (
                  <li key={`${t}-${(page-1)*pageSize+idx}`} className='terms__li'>
                    <a
                      href="#"
                      className='terms__name'
                      title={t}
                      aria-label={`Add term ${t}`}
                      onClick={(e) => { e.preventDefault(); onPickTerm?.(t); }}
                    >
                      {t}
                    </a>
                  </li>
                ))}
              </ul>
              {/* 分頁資訊顯示在下方 */}
                        <div className="terms__pagination" style={{ textAlign: 'center', fontSize: '0.98em', color: '#444', background: '#f5f5f5', borderRadius: '6px', padding: '0.5em' }}>
                Total <b>{filtered.length}</b> terms | Page <b>{page}</b> / <b>{totalPages}</b><br />
                Showing <b>{filtered.length === 0 ? 0 : (page-1)*pageSize+1}</b> - <b>{Math.min(page*pageSize, filtered.length)}</b> terms
                <div style={{ marginTop: '0.5em' }}>
                  <button disabled={page <= 1} onClick={() => setPage(1)} style={{ marginLeft: '0.5em' }}>First</button>
                  <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ marginLeft: '0.3em' }}>Previous</button>
                  <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ marginLeft: '0.3em' }}>Next</button>
                  <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} style={{ marginLeft: '0.3em' }}>Last</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

