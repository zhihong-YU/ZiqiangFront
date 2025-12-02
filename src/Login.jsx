import { useState } from 'react';
import './Login.css'

function Login() {
  // 1. 定义状态 (State)
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. 处理登录逻辑的函数
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 发送请求给后端
      // 注意：这里请求的是 /api/login/ (带斜杠)，对应 Django 的 path('api/login/')
      const response = await fetch('/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          student_id: studentId, 
          password: password,
          remember_me: false 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('登录成功！后端返回: ' + JSON.stringify(data));
      } else {
        alert('登录失败: ' + (data.detail || '账号或密码错误'));
      }
    } catch (error) {
      console.error('请求出错:', error);
      alert('网络错误，请检查后端是否启动');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', width: '300px', margin: '50px auto' }}>
      <h2>用户登录</h2>
      <form onSubmit={handleLogin}>
        {/* 学号输入框 */}
        <div style={{ marginBottom: '10px' }}>
          <label>学号: </label>
          <input 
            type="text" 
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="请输入学号 (2023001)"
          />
        </div>

        {/* 密码输入框 */}
        <div style={{ marginBottom: '10px' }}>
          <label>密码: </label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
          />
        </div>

        {/* 登录按钮 */}
        <button type="submit" disabled={isLoading}>
          {isLoading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  );
}

export default Login;
