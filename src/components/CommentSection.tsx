import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, addDoc, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { Comment } from '../types';
import { MessageSquare, Send, ThumbsUp } from 'lucide-react';
import { useAuthModal } from '../AuthModalContext';

interface CommentSectionProps {
  storyId: string;
  chapterId?: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ storyId, chapterId }) => {
  const { user } = useAuth();
  const { openLogin } = useAuthModal();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('storyId', '==', storyId),
      where('chapterId', '==', chapterId || null),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storyId, chapterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        storyId,
        chapterId: chapterId || null,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        content: newComment,
        likeCount: 0,
        createdAt: new Date().toISOString()
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment', error);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-emerald-600" /> Bình luận ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-4">
          <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-800" />
          <div className="flex-grow relative">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết bình luận..."
              className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all min-h-[100px] outline-none text-sm text-gray-900 dark:text-white"
            />
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="absolute bottom-3 right-3 p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-8 bg-gray-50 dark:bg-gray-800/30 rounded-3xl text-center border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Vui lòng đăng nhập để tham gia thảo luận cùng cộng đồng.</p>
          <button 
            onClick={openLogin}
            className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-full hover:bg-emerald-700 transition-all"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-4 group">
            <img src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userName}`} className="w-10 h-10 rounded-full flex-shrink-0 border border-gray-100 dark:border-gray-800" />
            <div className="flex-grow">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-transparent group-hover:border-gray-100 dark:group-hover:border-gray-700 transition-all">
                <p className="font-bold text-sm text-gray-900 dark:text-white">{comment.userName}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">{comment.content}</p>
              </div>
              <div className="flex items-center gap-4 mt-2 ml-2 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                <span>{new Date(comment.createdAt).toLocaleString()}</span>
                <button className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
                  <ThumbsUp className="w-3 h-3" /> {comment.likeCount}
                </button>
                <button className="hover:text-emerald-600 transition-colors">Trả lời</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
