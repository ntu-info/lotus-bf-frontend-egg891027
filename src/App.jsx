
import { useState } from 'react';
import './App.css';
import { Terms } from './components/Terms';
import { QueryBuilder } from './components/QueryBuilder';
import { Studies } from './components/Studies';

// 主頁元件
function App() {
  // 查詢字串狀態
  const [query, setQuery] = useState('');
  // 查詢結果數量
  const [studyCount, setStudyCount] = useState(0);

  // 取得 Studies 結果數量的回調
  const handleStudyCount = (count) => setStudyCount(count);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif', background: '#181a20', color: '#fff', boxSizing: 'border-box', margin: 0, padding: '0 8px' }}>
      {/* 左側：All Terms（由後端 API 取得） */}
  <div style={{ width: '25%', minWidth: '180px', background: '#222', borderRight: '1px solid #333', padding: '1.2em 0.5em', color: '#fff', boxSizing: 'border-box', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '1em' }}>All Terms</div>
        {/* Terms 元件，onPickTerm 點選後即時更新 query */}
  <Terms onPickTerm={term => setQuery(q => q ? `${q} ${term}` : term)} />
      </div>

  {/* 中間：Query Builder 與查詢結果 */}
  <div style={{ width: '50%', minWidth: '320px', padding: '1.2em 0.5em', background: '#181a20', color: '#fff', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', height: '100vh', minHeight: 0 }}>
        <div style={{ flex: '0 0 auto' }}>
          <h1 style={{ fontSize: '1.5em', marginBottom: '1em', color: '#fff' }}>Neuroinformatics Query Builder</h1>
          {/* QueryBuilder 元件，query 狀態即時更新 */}
          <QueryBuilder query={query} setQuery={setQuery} />
          {/* 查詢結果篇數顯示 */}
          <div style={{ marginTop: '1em', fontSize: '1.1em', color: '#ffd700' }}>
            {query ? `Found ${studyCount} studies for this query.` : ''}
          </div>
        </div>
        {/* Studies 元件，根據 query 顯示 study JSON（表格） */}
        <div style={{ flex: '1 1 0%', minHeight: 0 }}>
          <Studies query={query} onCount={handleStudyCount} />
        </div>
      </div>

      {/* 右側：預留空間，可加提示或其他元件 */}
      <div style={{ width: '25%', minWidth: '100px', background: '#222', borderLeft: '1px solid #333', padding: '1.2em 0.5em', color: '#bbb', boxSizing: 'border-box', height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.2em', marginBottom: '1em', color: '#fff', textAlign: 'center' }}>NIfTI Viewer</h2>
        <div style={{ flex: 1, minHeight: 0 }}>
          {/* 這裡可以放提示、說明、或其他元件 */}
        </div>
      </div>
    </div>
  );
}

export default App;
