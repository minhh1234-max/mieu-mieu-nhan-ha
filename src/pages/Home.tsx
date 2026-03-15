import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Story } from '../types';
import StoryCard from '../components/StoryCard';
import { ChevronRight, TrendingUp, Sparkles, Clock, BookOpen, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Home = () => {
  const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
  const [hotStories, setHotStories] = useState<Story[]>([]);
  const [newStories, setNewStories] = useState<Story[]>([]);
  const [updatedStories, setUpdatedStories] = useState<Story[]>([]);
  const [novels, setNovels] = useState<Story[]>([]);
  const [originalStories, setOriginalStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const featuredQuery = query(collection(db, 'stories'), where('isFeatured', '==', true), limit(5));
        const hotQuery = query(collection(db, 'stories'), where('isHot', '==', true), orderBy('viewCount', 'desc'), limit(10));
        const newStoriesQuery = query(collection(db, 'stories'), where('isNew', '==', true), limit(10));
        const updatedQuery = query(collection(db, 'stories'), orderBy('updatedAt', 'desc'), limit(12));
        const novelQuery = query(collection(db, 'stories'), where('type', '==', 'novel'), orderBy('updatedAt', 'desc'), limit(10));
        const originalQuery = query(collection(db, 'stories'), where('isOriginal', '==', true), orderBy('updatedAt', 'desc'), limit(10));
        
        const [featuredSnap, hotSnap, newSnap, updatedSnap, novelSnap, originalSnap] = await Promise.all([
          getDocs(featuredQuery), 
          getDocs(hotQuery), 
          getDocs(newStoriesQuery),
          getDocs(updatedQuery),
          getDocs(novelQuery),
          getDocs(originalQuery)
        ]);
        
        setFeaturedStories(featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story)));
        setHotStories(hotSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story)));
        setNewStories(newSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story)));
        setUpdatedStories(updatedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story)));
        setNovels(novelSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story)));
        setOriginalStories(originalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story)));
      } catch (error) {
        console.error('Error fetching stories', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const featured = featuredStories.length > 0 ? featuredStories[0] : (hotStories[0] || updatedStories[0]);

  const swiperConfig = {
    modules: [Navigation, Pagination, Autoplay],
    spaceBetween: 24,
    slidesPerView: 2,
    navigation: true,
    breakpoints: {
      640: { slidesPerView: 3 },
      768: { slidesPerView: 4 },
      1024: { slidesPerView: 5 },
      1280: { slidesPerView: 6 },
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Hero Slider */}
      <section className="relative h-[450px] rounded-3xl overflow-hidden bg-gray-900 shadow-2xl">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 5000 }}
          pagination={{ clickable: true }}
          className="h-full w-full"
        >
          {(featuredStories.length > 0 ? featuredStories : [featured]).map((story, idx) => story && (
            <SwiperSlide key={story.id || idx}>
              <div className="relative h-full w-full group">
                <img 
                  src={story.coverImage} 
                  className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent p-12 flex flex-col justify-center max-w-3xl">
                  <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Truyện nổi bật
                  </span>
                  <h1 className="text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">{story.title}</h1>
                  <p className="text-gray-200 line-clamp-3 mb-8 text-lg max-w-xl">{story.description}</p>
                  <div className="flex gap-4">
                    <Link to={`/story/${story.slug}`} className="btn-primary px-8 py-3 text-lg">Đọc ngay</Link>
                    <Link to={`/story/${story.slug}`} className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 backdrop-blur-md transition-all border border-white/20">Thông tin</Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Hot Stories Slider */}
      {hotStories.length > 0 && (
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <TrendingUp className="text-red-500 w-8 h-8" /> Truyện Hot Nhất
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Những bộ truyện đang được săn đón nhiều nhất</p>
            </div>
            <Link to="/hot" className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:text-emerald-700 transition-colors">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <Swiper {...swiperConfig} className="pb-12 !px-1">
            {hotStories.map(story => (
              <SwiperSlide key={story.id}>
                <StoryCard story={story} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* Updated Stories Slider */}
      {updatedStories.length > 0 && (
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Clock className="text-blue-500 w-8 h-8" /> Mới Cập Nhật
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Theo dõi diễn biến mới nhất của các bộ truyện</p>
            </div>
            <Link to="/new" className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:text-emerald-700 transition-colors">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <Swiper {...swiperConfig} className="pb-12 !px-1">
            {updatedStories.map(story => (
              <SwiperSlide key={story.id}>
                <StoryCard story={story} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* New Stories Slider */}
      {newStories.length > 0 && (
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Zap className="text-yellow-500 w-8 h-8" /> Truyện Mới Ra Mắt
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Khám phá những siêu phẩm vừa trình làng</p>
            </div>
            <Link to="/new-stories" className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:text-emerald-700 transition-colors">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <Swiper {...swiperConfig} className="pb-12 !px-1">
            {newStories.map(story => (
              <SwiperSlide key={story.id}>
                <StoryCard story={story} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* Novels Slider */}
      {novels.length > 0 && (
        <section className="bg-emerald-50/50 dark:bg-emerald-950/20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-16 rounded-[3rem] transition-colors duration-500 ease-in-out">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <BookOpen className="text-emerald-600 w-8 h-8" /> Tiểu Thuyết Đặc Sắc
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Thế giới chữ viết đầy mê hoặc và chiều sâu</p>
            </div>
            <Link to="/novels" className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:text-emerald-700 transition-colors">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <Swiper {...swiperConfig} className="pb-12 !px-1">
            {novels.map(story => (
              <SwiperSlide key={story.id}>
                <StoryCard story={story} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* Original Stories Slider */}
      {originalStories.length > 0 && (
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Sparkles className="text-purple-500 w-8 h-8" /> Truyện Sáng Tác
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Những tác phẩm độc quyền từ các tác giả tài năng</p>
            </div>
            <Link to="/sang-tac" className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:text-emerald-700 transition-colors">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <Swiper {...swiperConfig} className="pb-12 !px-1">
            {originalStories.map(story => (
              <SwiperSlide key={story.id}>
                <StoryCard story={story} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}
    </div>
  );
};

export default Home;
