import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, getDocs, where, limit, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Story, Chapter } from '../types';
import { ChevronLeft, ChevronRight, Settings, List, Home, MessageSquare, Sun, Moon } from 'lucide-react';
import CommentSection from '../components/CommentSection';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';

const Reader = () => {
  const { slug, chapterId } = useParams();
  const { user } = useAuth();
  const { theme: globalTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [readerTheme, setReaderTheme] = useState<'light' | 'dark' | 'sepia'>(globalTheme as any || 'light');

  // Sync reader theme with global theme changes
  useEffect(() => {
    if (globalTheme === 'dark') {
      setReaderTheme('dark');
    } else {
      setReaderTheme('light');
    }
  }, [globalTheme]);

  useEffect(() => {
    const fetchReaderData = async () => {
      setLoading(true);
      try {
        const storyQuery = query(collection(db, 'stories'), where('slug', '==', slug), limit(1));
        const storySnap = await getDocs(storyQuery);
        
        if (!storySnap.empty) {
          const storyData = { id: storySnap.docs[0].id, ...storySnap.docs[0].data() } as Story;
          setStory(storyData);

          const chapterDoc = await getDoc(doc(db, `stories/${storyData.id}/chapters`, chapterId!));
          if (chapterDoc.exists()) {
            setChapter({ id: chapterDoc.id, ...chapterDoc.data() } as Chapter);
          }

          const chaptersQuery = query(
            collection(db, `stories/${storyData.id}/chapters`),
            orderBy('chapterNumber', 'asc')
          );
          const chaptersSnap = await getDocs(chaptersQuery);
          setAllChapters(chaptersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter)));
        }
      } catch (error) {
        console.error('Error fetching reader data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReaderData();
    window.scrollTo(0, 0);
  }, [slug, chapterId]);

  useEffect(() => {
    if (user && story && chapter) {
      const saveHistory = async () => {
        try {
          const historyId = `${user.uid}_${story.id}`;
          await setDoc(doc(db, 'reading_history', historyId), {
            userId: user.uid,
            storyId: story.id,
            chapterId: chapter.id,
            lastReadAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error saving history', error);
        }
      };
      saveHistory();
    }
  }, [user, story, chapter]);

  const goToChapter = (id: string) => {
    navigate(`/read/${slug}/${id}`);
  };

  const nextChapter = allChapters.find(c => c.chapterNumber === (chapter?.chapterNumber || 0) + 1);
  const prevChapter = allChapters.find(c => c.chapterNumber === (chapter?.chapterNumber || 0) - 1);

  if (loading) return <div className="p-12 text-center">Đang tải chương...</div>;
  if (!story || !chapter) return <div className="p-12 text-center">Không tìm thấy nội dung</div>;

  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-[#050505] text-gray-200',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]'
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ease-in-out ${themeClasses[readerTheme]}`}>
      {/* Reader Header */}
      <div className="sticky top-0 z-40 bg-inherit border-b border-gray-200/10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/story/${story.slug}`} className="hover:text-emerald-500">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold truncate max-w-[200px]">{story.title}</h1>
              <p className="text-[10px] opacity-60">Chương {chapter.chapterNumber}: {chapter.title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <select 
              value={chapter.id} 
              onChange={(e) => goToChapter(e.target.value)}
              className="bg-gray-500/10 border-none text-xs rounded-lg px-2 py-1 focus:ring-emerald-500 dark:text-white"
            >
              {allChapters.map(c => (
                <option key={c.id} value={c.id} className="text-gray-900">Chương {c.chapterNumber}</option>
              ))}
            </select>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={toggleTheme} 
                className="p-2 hover:bg-gray-500/10 rounded-full transition-colors"
                title={globalTheme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
              >
                {globalTheme === 'light' ? (
                  <Moon className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400" />
                )}
              </button>
              <button 
                onClick={() => setReaderTheme(prev => prev === 'sepia' ? (globalTheme as any) : 'sepia')} 
                className="p-2 hover:bg-gray-500/10 rounded-full transition-colors"
                title="Chế độ Sepia"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {story.type === 'novel' ? (
          <div 
            className={`prose prose-lg max-w-none leading-relaxed ${readerTheme === 'dark' ? 'dark:prose-invert' : ''}`}
            style={{ fontSize: `${fontSize}px` }}
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Chương {chapter.chapterNumber}: {chapter.title}</h2>
            <div className="whitespace-pre-line font-serif tracking-wide">
              {chapter.content}
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {chapter.images?.map((img, idx) => (
              <img 
                key={idx} 
                src={img} 
                alt={`Page ${idx + 1}`} 
                className="w-full h-auto block"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-12 flex justify-center gap-4 pb-12">
          <button 
            disabled={!prevChapter}
            onClick={() => goToChapter(prevChapter!.id)}
            className="flex items-center gap-2 px-6 py-2 bg-gray-500/10 rounded-full disabled:opacity-30 hover:bg-emerald-500 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" /> Chương trước
          </button>
          <button 
            disabled={!nextChapter}
            onClick={() => goToChapter(nextChapter!.id)}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-full disabled:opacity-30 hover:bg-emerald-700 transition-all"
          >
            Chương sau <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-12 border-t border-gray-200/20 pt-8">
          <CommentSection storyId={story.id} chapterId={chapter.id} />
        </div>
      </main>

      {/* Floating Controls for Novel */}
      {story.type === 'novel' && (
        <div className="fixed bottom-8 right-8 flex flex-col gap-2 z-50">
          <button onClick={() => setFontSize(f => Math.min(f + 2, 32))} className="w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center text-gray-900 dark:text-white font-bold border border-gray-100 dark:border-gray-700 transition-colors">A+</button>
          <button onClick={() => setFontSize(f => Math.max(f - 2, 12))} className="w-10 h-10 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center text-gray-900 dark:text-white font-bold border border-gray-100 dark:border-gray-700 transition-colors">A-</button>
        </div>
      )}
    </div>
  );
};

export default Reader;
