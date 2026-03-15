import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, BookOpen, Clock } from 'lucide-react';
import { Story } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface StoryCardProps {
  story: Story;
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/story/${story.slug}`} className="block">
        <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gray-200 relative">
          <img 
            src={story.coverImage} 
            alt={story.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 left-2 flex gap-1">
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded text-white ${story.type === 'comic' ? 'bg-blue-600' : 'bg-orange-600'}`}>
              {story.type === 'comic' ? 'Comic' : 'Novel'}
            </span>
            {story.status === 'completed' && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-600 text-white">Full</span>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center gap-3 text-white text-[10px] font-medium">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {story.viewCount.toLocaleString()}</span>
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {story.lastChapterTitle || 'Chưa có'}</span>
            </div>
          </div>
        </div>
        <h3 className="mt-2 text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {story.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{story.author}</p>
        <div className="mt-3">
          <span className="inline-flex items-center justify-center w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-emerald-200 dark:shadow-none">
            Đọc ngay
          </span>
        </div>
      </Link>

      {/* Hover Preview Popup */}
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute z-40 left-full ml-4 top-0 w-72 bg-white dark:bg-[#0d0d0d] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4 hidden lg:block pointer-events-none transition-colors duration-500"
          >
            <div className="flex gap-3 mb-3">
              <img src={story.coverImage} className="w-20 h-28 object-cover rounded-lg shadow-md" referrerPolicy="no-referrer" />
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{story.title}</h4>
                <div className="flex flex-wrap gap-1">
                  {story.categoryIds.slice(0, 2).map(catId => (
                    <span key={catId} className="text-[9px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">{catId}</span>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(story.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="h-24 overflow-hidden relative">
              <motion.p 
                animate={{ y: [0, -50, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed"
              >
                {story.description}
              </motion.p>
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-[#0d0d0d] to-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoryCard;
