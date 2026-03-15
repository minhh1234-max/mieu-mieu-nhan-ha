import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogIn, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuthModal } from '../AuthModalContext';

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openLogin, openSignup } = useAuthModal();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-[#0d0d0d] border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-500 ease-in-out">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="https://ais-pre-y6dtd4eoyapq7qzf35xbqm-66651900258.asia-east1.run.app/api/attachments/66651900258/66651900258_1.png" 
                alt="Miêu Miêu Nhàn Hạ" 
                className="h-12 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
              <Link to="/tieu-thuyet" className="hover:text-emerald-600 transition-colors">Tiểu Thuyết</Link>
              <Link to="/sang-tac" className="hover:text-emerald-600 transition-colors">Sáng Tác</Link>
              <Link to="/the-loai" className="hover:text-emerald-600 transition-colors">Thể Loại</Link>
              <Link to="/bang-xep-hang" className="hover:text-emerald-600 transition-colors">Bảng Xếp Hạng</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-1.5 border border-transparent focus-within:border-emerald-500 transition-all">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm truyện..." 
                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-48 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <motion.button 
              whileTap={{ scale: 0.8, rotate: 15 }}
              whileHover={{ scale: 1.1 }}
              onClick={toggleTheme}
              className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all relative overflow-hidden group"
              aria-label="Toggle theme"
            >
              <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -25, opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ y: 25, opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  className="flex items-center justify-center"
                >
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5 text-indigo-600 drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link to="/admin" className="text-xs font-bold uppercase tracking-widest text-emerald-600 hover:underline">Admin</Link>
                )}
                <Link to="/profile" className="flex items-center gap-2 group">
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt={user.displayName} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 group-hover:border-emerald-500 transition-all" />
                </Link>
                <button onClick={handleLogout} className="text-gray-500 dark:text-gray-400 hover:text-red-600">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={openLogin}
                  className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition-colors"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={openSignup}
                  className="px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-full hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-none transition-all"
                >
                  Đăng ký
                </button>
              </div>
            )}
            
            <button className="md:hidden text-gray-600 dark:text-gray-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-[#0d0d0d] border-t border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <Link to="/tieu-thuyet" className="block text-gray-600 dark:text-gray-300 font-medium" onClick={() => setIsMenuOpen(false)}>Tiểu Thuyết</Link>
              <Link to="/sang-tac" className="block text-gray-600 dark:text-gray-300 font-medium" onClick={() => setIsMenuOpen(false)}>Sáng Tác</Link>
              <Link to="/the-loai" className="block text-gray-600 dark:text-gray-300 font-medium" onClick={() => setIsMenuOpen(false)}>Thể Loại</Link>
              <Link to="/bang-xep-hang" className="block text-gray-600 dark:text-gray-300 font-medium" onClick={() => setIsMenuOpen(false)}>Bảng Xếp Hạng</Link>
              
              {!user && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                  <button 
                    onClick={() => { openLogin(); setIsMenuOpen(false); }}
                    className="w-full py-3 text-center font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button 
                    onClick={() => { openSignup(); setIsMenuOpen(false); }}
                    className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none"
                  >
                    Đăng ký
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
