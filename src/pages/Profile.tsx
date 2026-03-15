import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Story, ReadingHistory } from '../types';
import StoryCard from '../components/StoryCard';
import { User, Heart, Clock, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [followedStories, setFollowedStories] = useState<Story[]>([]);
  const [history, setHistory] = useState<(ReadingHistory & { story?: Story })[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          // Fetch followed stories
          const followQuery = query(collection(db, 'follows'), where('userId', '==', user.uid));
          const followSnap = await getDocs(followQuery);
          const storyIds = followSnap.docs.map(d => d.data().storyId);
          
          if (storyIds.length > 0) {
            const storiesQuery = query(collection(db, 'stories'), where('__name__', 'in', storyIds.slice(0, 10)));
            const storiesSnap = await getDocs(storiesQuery);
            setFollowedStories(storiesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Story)));
          }

          // Fetch reading history
          const historyQuery = query(
            collection(db, 'reading_history'), 
            where('userId', '==', user.uid),
            orderBy('lastReadAt', 'desc'),
            limit(10)
          );
          const historySnap = await getDocs(historyQuery);
          const historyData = historySnap.docs.map(d => ({ id: d.id, ...d.data() } as ReadingHistory));
          
          // Enrich history with story data
          const enrichedHistory = await Promise.all(historyData.map(async (h) => {
            const storyDoc = await getDocs(query(collection(db, 'stories'), where('__name__', '==', h.storyId)));
            return { ...h, story: storyDoc.empty ? undefined : { id: storyDoc.docs[0].id, ...storyDoc.docs[0].data() } as Story };
          }));
          
          setHistory(enrichedHistory);
        } catch (error) {
          console.error('Error fetching profile data', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  if (authLoading) return <div className="p-12 text-center">Đang tải...</div>;
  if (!user) return <div className="p-12 text-center">Vui lòng đăng nhập để xem trang này.</div>;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-[#0d0d0d] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center gap-8 mb-12 transition-colors duration-500">
        <img src={user.photoURL} alt={user.displayName} className="w-32 h-32 rounded-full border-4 border-emerald-50 dark:border-emerald-900/30 shadow-lg" />
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.displayName}</h1>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
            <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest">
              {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
            </span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium hover:underline">
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Followed Stories */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Heart className="text-red-500" /> Truyện đang theo dõi
          </h2>
          {followedStories.length > 0 ? (
            <div className="grid grid-cols-2 gap-6">
              {followedStories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">Bạn chưa theo dõi bộ truyện nào.</p>
          )}
        </section>

        {/* Reading History */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Clock className="text-blue-500" /> Lịch sử đọc
          </h2>
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map(item => item.story && (
                <div key={item.id} className="flex gap-4 p-4 bg-white dark:bg-[#0d0d0d] rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group duration-500">
                  <img src={item.story.coverImage} className="w-16 h-20 object-cover rounded-lg" />
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {item.story.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Đã đọc chương {item.chapterId}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">{new Date(item.lastReadAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">Bạn chưa có lịch sử đọc.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
