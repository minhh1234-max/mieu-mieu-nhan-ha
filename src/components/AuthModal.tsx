import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Github, Chrome, ArrowRight, Loader2 } from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'admin'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'admin') {
        // Special admin login
        if (email === 'dongchithanhha' && password === 'dongchithanhha222') {
          // Map to a specific email for Firebase Auth
          const adminEmail = 'dongchithanhha@admin.com';
          try {
            await signInWithEmailAndPassword(auth, adminEmail, password);
          } catch (err: any) {
            // If user doesn't exist, create it (first time setup)
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
              try {
                const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, password);
                await updateProfile(userCredential.user, { displayName: 'Admin Dong Chi' });
              } catch (createErr: any) {
                throw createErr;
              }
            } else {
              throw err;
            }
          }
        } else {
          throw new Error('Sai tài khoản hoặc mật khẩu Admin');
        }
      } else if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-[#0d0d0d] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {mode === 'login' ? 'Chào mừng trở lại' : mode === 'signup' ? 'Tham gia cùng chúng tôi' : 'Đăng nhập Admin'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {mode === 'login' ? 'Đăng nhập để tiếp tục hành trình đọc truyện của bạn' : mode === 'signup' ? 'Tạo tài khoản để lưu truyện yêu thích và nhiều hơn thế' : 'Truy cập trang quản trị hệ thống'}
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400 ml-1">Tên hiển thị</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400 ml-1">{mode === 'admin' ? 'Tên đăng nhập' : 'Email'}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type={mode === 'admin' ? 'text' : 'email'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'admin' ? 'dongchithanhha' : 'name@example.com'}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400 ml-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-sm text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Đăng nhập' : mode === 'signup' ? 'Tạo tài khoản' : 'Đăng nhập Admin'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#0d0d0d] px-4 text-gray-400 font-medium">Hoặc tiếp tục với</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 py-3.5 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium text-sm text-gray-700 dark:text-gray-200"
            >
              <Chrome className="w-5 h-5 text-red-500" />
              Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {mode === 'login' ? 'Chưa có tài khoản?' : mode === 'signup' ? 'Đã có tài khoản?' : ''}
            <button 
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="ml-1 text-emerald-600 font-bold hover:underline"
            >
              {mode === 'login' ? 'Đăng ký ngay' : mode === 'signup' ? 'Đăng nhập' : ''}
            </button>
          </p>

          {mode !== 'admin' && (
            <div className="mt-4 text-center">
              <button 
                onClick={() => setMode('admin')}
                className="text-xs text-gray-400 hover:text-emerald-600 transition-colors"
              >
                Đăng nhập Admin
              </button>
            </div>
          )}

          {mode === 'admin' && (
            <div className="mt-4 text-center">
              <button 
                onClick={() => setMode('login')}
                className="text-xs text-gray-400 hover:text-emerald-600 transition-colors"
              >
                Quay lại Đăng nhập thường
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
