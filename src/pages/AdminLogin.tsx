import React, { useEffect } from 'react';
import { useAuthModal } from '../AuthModalContext';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const AdminLogin: React.FC = () => {
  const { openAdmin } = useAuthModal();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (isAdmin) {
        navigate('/admin');
      }
    }
  }, [isAdmin, loading, navigate]);

  const handleAdminLoginTrigger = () => {
    openAdmin();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-[#0d0d0d] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 text-center"
      >
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-emerald-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cổng Quản Trị</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          Vui lòng đăng nhập bằng tài khoản quản trị viên để tiếp tục.
        </p>

        <button 
          onClick={() => navigate('/')}
          className="w-full py-3.5 px-4 mb-4 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Trang chủ
        </button>

        <button 
          onClick={handleAdminLoginTrigger}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all"
        >
          Đăng nhập ngay
        </button>

        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Hệ thống bảo mật bởi Miêu Miêu Nhàn Hạ
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
