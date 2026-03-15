import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Story, Chapter } from '../types';
import { BookOpen, User, Tag, Info, List, Heart, Share2, Eye, Clock } from 'lucide-react';
import CommentSection from '../components/CommentSection';

const StoryDetail = () => {
  const { slug } = useParams();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const chaptersPerPage = 20;

  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        const storyQuery = query(collection(db, 'stories'), where('slug', '==', slug), limit(1));
        const storySnap = await getDocs(storyQuery);
        
        if (!storySnap.empty) {
          const storyData = { id: storySnap.docs[0].id, ...storySnap.docs[0].data() } as Story;
          setStory(storyData);

          const chaptersQuery = query(
            collection(db, `stories/${storyData.id}/chapters`),
            orderBy('chapterNumber', 'asc')
          );
          const chaptersSnap = await getDocs(chaptersQuery);
          setChapters(chaptersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter)));
        }
      } catch (error) {
        console.error('Error fetching story detail', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoryData();
  }, [slug]);

  if (loading) return <div className="p-12 text-center">Đang tải...</div>;
  if (!story) return <div className="p-12 text-center">Không tìm thấy truyện</div>;

  // Pagination logic
  const indexOfLastChapter = currentPage * chaptersPerPage;
  const indexOfFirstChapter = indexOfLastChapter - chaptersPerPage;
  const currentChapters = chapters.slice(indexOfFirstChapter, indexOfLastChapter);
  const totalPages = Math.ceil(chapters.length / chaptersPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to chapter list header
    const element = document.getElementById('chapter-list');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 dark:text-gray-400 mb-6 flex gap-2">
        <Link to="/" className="hover:text-emerald-600">Trang chủ</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">{story.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-64 flex-shrink-0">
              <img 
                src={story.coverImage} 
                alt={story.title} 
                className="w-full aspect-[3/4] object-cover rounded-2xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-grow space-y-4">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">{story.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {story.author}</span>
                <span className="flex items-center gap-1"><Info className="w-4 h-4" /> {story.status === 'ongoing' ? 'Đang ra' : 'Hoàn thành'}</span>
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {story.viewCount.toLocaleString()} lượt xem</span>
                <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {story.followerCount.toLocaleString()} theo dõi</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {story.categoryIds.map(catId => (
                  <Link key={catId} to={`/category/${catId}`} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {catId}
                  </Link>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <Link to={`/read/${story.slug}/${chapters[0]?.id}`} className="btn-primary flex items-center gap-2">
                  <BookOpen className="w-5 h-5" /> Đọc từ đầu
                </Link>
                <button className="px-6 py-2 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  <Heart className="w-5 h-5" /> Theo dõi
                </button>
                <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2 text-gray-900 dark:text-white">
              <Info className="w-5 h-5 text-emerald-600" /> Nội dung
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{story.description}</p>
          </div>

          <CommentSection storyId={story.id} />

          <div className="space-y-4" id="chapter-list">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <List className="w-5 h-5 text-emerald-600" /> Danh sách chương
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">{chapters.length} chương</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentChapters.map(chapter => (
                <Link 
                  key={chapter.id} 
                  to={`/read/${story.slug}/${chapter.id}`}
                  className="p-3 bg-white dark:bg-[#0d0d0d] border border-gray-100 dark:border-gray-800 rounded-lg flex justify-between items-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group duration-500"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Chương {chapter.chapterNumber}: {chapter.title}</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(chapter.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>

            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button 
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  Trước
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first, last, and pages around current
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                            currentPage === page 
                              ? 'bg-emerald-600 text-white' 
                              : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 || 
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="px-1">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button 
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-500 ease-in-out">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-widest text-xs">Truyện cùng thể loại</h3>
            {/* Placeholder for related stories */}
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">Đang cập nhật...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryDetail;
