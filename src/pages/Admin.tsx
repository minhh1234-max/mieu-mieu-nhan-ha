import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Book, FileText, Upload, CheckCircle, Settings, Trash2, Search as SearchIcon } from 'lucide-react';

const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'stories' | 'chapters' | 'users'>('stories');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);

  // Story Form
  const [storyForm, setStoryForm] = useState({
    title: '',
    slug: '',
    author: '',
    description: '',
    coverImage: '',
    type: 'comic' as 'comic' | 'novel',
    status: 'ongoing' as 'ongoing' | 'completed',
    categoryIds: [] as string[],
    isHot: false,
    isFeatured: false,
    isNew: false,
    isOriginal: false
  });

  // Chapter Form
  const [chapterForm, setChapterForm] = useState({
    storyId: '',
    title: '',
    chapterNumber: 1,
    content: '',
    images: '' // Comma separated URLs
  });

  const [stories, setStories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAdmin) {
      const fetchData = async () => {
        const storySnap = await getDocs(collection(db, 'stories'));
        setStories(storySnap.docs.map(d => ({ id: d.id, ...d.data() })));
        
        const userSnap = await getDocs(collection(db, 'users'));
        setUsers(userSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      };
      fetchData();
    }
  }, [isAdmin]);

  if (authLoading) return <div className="p-12 text-center">Đang kiểm tra quyền...</div>;
  if (!isAdmin) return <div className="p-12 text-center text-red-600 font-bold">Bạn không có quyền truy cập trang này.</div>;

  const handleDeleteStory = async (storyId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa truyện này? Hành động này không thể hoàn tác.')) {
      try {
        await deleteDoc(doc(db, 'stories', storyId));
        setMessage('Đã xóa truyện thành công!');
        setStories(stories.filter(s => s.id !== storyId));
      } catch (err) {
        console.error(err);
        setMessage('Lỗi khi xóa truyện');
      }
    }
  };

  const handleAddOrUpdateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingStoryId) {
        await setDoc(doc(db, 'stories', editingStoryId), {
          ...storyForm,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        setMessage('Cập nhật truyện thành công!');
      } else {
        await addDoc(collection(db, 'stories'), {
          ...storyForm,
          viewCount: 0,
          followerCount: 0,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        setMessage('Thêm truyện thành công!');
      }
      setStoryForm({ title: '', slug: '', author: '', description: '', coverImage: '', type: 'comic', status: 'ongoing', categoryIds: [], isHot: false, isFeatured: false, isNew: false, isOriginal: false });
      setEditingStoryId(null);
      // Refresh list
      const storySnap = await getDocs(collection(db, 'stories'));
      setStories(storySnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      setMessage('Lỗi khi xử lý truyện');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStory = (story: any) => {
    setStoryForm({
      title: story.title,
      slug: story.slug,
      author: story.author,
      description: story.description,
      coverImage: story.coverImage,
      type: story.type,
      status: story.status,
      categoryIds: story.categoryIds || [],
      isHot: story.isHot || false,
      isFeatured: story.isFeatured || false,
      isNew: story.isNew || false,
      isOriginal: story.isOriginal || false
    });
    setEditingStoryId(story.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (userId === auth.currentUser?.uid) {
      setMessage('Bạn không thể tự hạ quyền của chính mình!');
      return;
    }
    try {
      await setDoc(doc(db, 'users', userId), { role: newRole }, { merge: true });
      setMessage(`Đã cập nhật vai trò cho người dùng!`);
      // Refresh list
      const userSnap = await getDocs(collection(db, 'users'));
      setUsers(userSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      setMessage('Lỗi khi cập nhật vai trò');
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const chapterData = {
        storyId: chapterForm.storyId,
        title: chapterForm.title,
        chapterNumber: Number(chapterForm.chapterNumber),
        content: chapterForm.content,
        images: chapterForm.images.split(',').map(s => s.trim()).filter(s => s),
        viewCount: 0,
        createdAt: new Date().toISOString()
      };
      
      const chapterRef = await addDoc(collection(db, `stories/${chapterForm.storyId}/chapters`), chapterData);
      
      // Update story last chapter
      await setDoc(doc(db, 'stories', chapterForm.storyId), {
        lastChapterTitle: chapterForm.title,
        lastChapterId: chapterRef.id,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setMessage('Thêm chương thành công!');
      setChapterForm({ ...chapterForm, title: '', chapterNumber: chapterForm.chapterNumber + 1, content: '', images: '' });
    } catch (err) {
      console.error(err);
      setMessage('Lỗi khi thêm chương');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 text-gray-900 dark:text-white">
        <Settings className="text-emerald-600" /> Admin Panel
      </h1>

      <div className="flex gap-4 mb-8 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('stories')}
          className={`pb-2 px-4 font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'stories' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-400 dark:text-gray-500'}`}
        >
          Quản lý truyện
        </button>
        <button 
          onClick={() => setActiveTab('chapters')}
          className={`pb-2 px-4 font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'chapters' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-400 dark:text-gray-500'}`}
        >
          Quản lý chương
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-2 px-4 font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'users' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-400 dark:text-gray-500'}`}
        >
          Quản lý Admin
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-between gap-2 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> {message}
          </div>
          <button onClick={() => setMessage('')} className="text-xs font-bold hover:underline">Đóng</button>
        </div>
      )}

      {activeTab === 'stories' && (
        <div className="space-y-12">
          <form onSubmit={handleAddOrUpdateStory} className="bg-white dark:bg-[#0d0d0d] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6 transition-colors duration-500">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingStoryId ? 'Chỉnh sửa truyện' : 'Thêm truyện mới'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Tên truyện</label>
                <input 
                  type="text" required
                  value={storyForm.title}
                  onChange={e => setStoryForm({...storyForm, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Slug</label>
                <input 
                  type="text" required
                  value={storyForm.slug}
                  onChange={e => setStoryForm({...storyForm, slug: e.target.value})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Tác giả</label>
              <input 
                type="text" required
                value={storyForm.author}
                onChange={e => setStoryForm({...storyForm, author: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Mô tả</label>
              <textarea 
                required rows={4}
                value={storyForm.description}
                onChange={e => setStoryForm({...storyForm, description: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Loại</label>
                <select 
                  value={storyForm.type}
                  onChange={e => setStoryForm({...storyForm, type: e.target.value as any})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
                >
                  <option value="comic">Truyện tranh</option>
                  <option value="novel">Tiểu thuyết</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Tình trạng</label>
                <select 
                  value={storyForm.status}
                  onChange={e => setStoryForm({...storyForm, status: e.target.value as any})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
                >
                  <option value="ongoing">Đang ra</option>
                  <option value="completed">Hoàn thành</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Ảnh bìa (URL)</label>
                <input 
                  type="text" required
                  value={storyForm.coverImage}
                  onChange={e => setStoryForm({...storyForm, coverImage: e.target.value})}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                <input 
                  type="checkbox"
                  checked={storyForm.isHot}
                  onChange={e => setStoryForm({...storyForm, isHot: e.target.checked})}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Truyện Hot nhất</span>
              </label>
              <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                <input 
                  type="checkbox"
                  checked={storyForm.isFeatured}
                  onChange={e => setStoryForm({...storyForm, isFeatured: e.target.checked})}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Nổi bật (Banner)</span>
              </label>
              <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                <input 
                  type="checkbox"
                  checked={storyForm.isNew}
                  onChange={e => setStoryForm({...storyForm, isNew: e.target.checked})}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Mới cập nhật</span>
              </label>
              <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                <input 
                  type="checkbox"
                  checked={storyForm.isOriginal}
                  onChange={e => setStoryForm({...storyForm, isOriginal: e.target.checked})}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Truyện Sáng Tác</span>
              </label>
            </div>

            <div className="flex gap-4">
              <button 
                type="submit" disabled={loading}
                className="flex-grow py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : editingStoryId ? 'Cập nhật truyện' : 'Thêm truyện mới'}
              </button>
              {editingStoryId && (
                <button 
                  type="button"
                  onClick={() => {
                    setEditingStoryId(null);
                    setStoryForm({ title: '', slug: '', author: '', description: '', coverImage: '', type: 'comic', status: 'ongoing', categoryIds: [], isHot: false, isFeatured: false, isNew: false, isOriginal: false });
                  }}
                  className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Danh sách truyện</h2>
              <div className="relative flex-grow max-w-xs">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Tìm kiếm truyện..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {stories
                .filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(story => (
                <div key={story.id} className="bg-white dark:bg-[#0d0d0d] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 group transition-colors duration-500">
                  <div className="flex items-center gap-4">
                    <img src={story.coverImage} className="w-12 h-16 object-cover rounded-lg" />
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">{story.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{story.author} • {story.type === 'comic' ? 'Truyện tranh' : 'Tiểu thuyết'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditStory(story)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => handleDeleteStory(story.id)}
                      className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-all"
                      title="Xóa truyện"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'chapters' && (
        <form onSubmit={handleAddChapter} className="bg-white dark:bg-[#0d0d0d] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6 transition-colors duration-500">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Chọn truyện</label>
            <select 
              required
              value={chapterForm.storyId}
              onChange={e => setChapterForm({...chapterForm, storyId: e.target.value})}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
            >
              <option value="">-- Chọn truyện --</option>
              {stories.map(s => (
                <option key={s.id} value={s.id} className="dark:bg-gray-900">{s.title} ({s.type})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Tên chương</label>
              <input 
                type="text" required
                value={chapterForm.title}
                onChange={e => setChapterForm({...chapterForm, title: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Số chương</label>
              <input 
                type="number" required
                value={chapterForm.chapterNumber}
                onChange={e => setChapterForm({...chapterForm, chapterNumber: Number(e.target.value)})}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          {stories.find(s => s.id === chapterForm.storyId)?.type === 'novel' ? (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Nội dung (Tiểu thuyết)</label>
              <textarea 
                required rows={10}
                value={chapterForm.content}
                onChange={e => setChapterForm({...chapterForm, content: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Danh sách ảnh (Truyện tranh, cách nhau bởi dấu phẩy)</label>
              <textarea 
                required rows={6}
                value={chapterForm.images}
                onChange={e => setChapterForm({...chapterForm, images: e.target.value})}
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
                placeholder="URL1, URL2, URL3..."
              />
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Thêm chương mới'}
          </button>
        </form>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý người dùng</h2>
          <div className="grid grid-cols-1 gap-4">
            {users.map(u => (
              <div key={u.id} className="bg-white dark:bg-[#0d0d0d] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 transition-colors duration-500">
                <div className="flex items-center gap-4">
                  <img src={u.photoURL} className="w-10 h-10 rounded-full" />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{u.displayName}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${u.role === 'admin' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {u.role}
                  </span>
                  <button 
                    onClick={() => handleToggleAdmin(u.id, u.role)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                  >
                    {u.role === 'admin' ? 'Hạ quyền' : 'Thăng Admin'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


export default Admin;
