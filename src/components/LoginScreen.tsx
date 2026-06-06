import React, { useState } from 'react';
import { useHospitalStore } from '../store/useHospitalStore';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [useFaceRecognition, setUseFaceRecognition] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [faceScanProgress, setFaceScanProgress] = useState(0);
  const login = useHospitalStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (useFaceRecognition) {
      setFaceScanProgress(0);
      const interval = setInterval(() => {
        setFaceScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }

    try {
      const success = await login(username || 'admin', password, useFaceRecognition);
      if (!success) {
        setError('用户名或密码错误');
      }
    } catch (err) {
      setError('登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark via-blue-900/20 to-dark">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-info/10 animate-pulse"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 5 + 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md p-8 panel-border rounded-xl bg-dark/80 backdrop-blur-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-info to-primary flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white glow-text mb-2">
            3D智慧医院综合运营平台
          </h1>
          <p className="text-gray-400">请登录以访问系统</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">用户名</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="请输入用户名（默认 admin）"
              className="w-full px-4 py-3 bg-dark/50 border border-info/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-info focus:ring-1 focus:ring-info transition-all"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full px-4 py-3 bg-dark/50 border border-info/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-info focus:ring-1 focus:ring-info transition-all"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="faceRecognition"
              checked={useFaceRecognition}
              onChange={e => setUseFaceRecognition(e.target.checked)}
              className="w-4 h-4 text-info border-info/30 rounded focus:ring-info bg-dark/50"
            />
            <label htmlFor="faceRecognition" className="ml-2 text-sm text-gray-300">
              使用人脸识别登录
            </label>
          </div>

          {useFaceRecognition && isLoading && (
            <div className="p-4 bg-info/10 rounded-lg border border-info/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full border-2 border-info animate-pulse flex items-center justify-center">
                  <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="text-sm text-info">正在进行人脸识别...</span>
              </div>
              <div className="w-full bg-dark/50 rounded-full h-2">
                <div
                  className="bg-info h-2 rounded-full transition-all duration-150"
                  style={{ width: `${faceScanProgress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-danger/20 border border-danger/50 rounded-lg text-danger text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-primary to-info text-white font-medium rounded-lg hover:from-primary/90 hover:to-info/90 focus:outline-none focus:ring-2 focus:ring-info/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '登录中...' : '登 录'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            测试账号：任意用户名 + 任意密码 或直接点登录
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
