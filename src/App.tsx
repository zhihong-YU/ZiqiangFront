import { Routes, Route } from 'react-router-dom'
import Login from './Login'
import Dashboard from './Dashboard'

function App() {
  return (
    <div>
      {/* 定义路由表 */}
      <Routes>
        {/* 当路径是 / 时，显示 Login 组件 */}
        <Route path="/" element={<Login />} />
        
        {/* 当路径是 /dashboard 时，显示 Dashboard 组件 */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* 当路径乱写时 (比如 /woshishui)，显示 404 提示 */}
        <Route path="*" element={<h1>404 - 页面找不到了</h1>} />
      </Routes>
    </div>
  )
}

export default App
