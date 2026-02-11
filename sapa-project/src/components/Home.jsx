import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate
import { PARTIES } from "../data/parties";
import { formatDate } from "../utils/formatDate";
import { Heart, MessageCircleQuestion } from "lucide-react";
import { useAuth } from "./Context";
import { getLikePosts } from "../data/getLikePosts";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "../data/firebase";
import likedPost from "../data/LikedPost";

import '../app.css'

export default function Home({ sortBy }) {
  const [likedPosts, setLikedPosts] = useState([]);
  const [isLiking, setIsLiking] = useState(false);
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef, 
      orderBy("date","desc"), 
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(data);
    }, (error) => {
      console.error("Error fetching posts: ", error);
    });
    
    return () => unsubscribe();
  }, [sortBy]);

  const tickLikeClick = async (post) => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await likedPost(post, user, likedPosts, (path) => navigate(path));
      setTimeout(() => setIsLiking(false), 10000);
    } catch (error) {
      console.error("Error liking post: ", error);
      setIsLiking(false);
    }
  };

  useEffect(() => {
    const unsubscribe = getLikePosts(user, (ids) => {
      setLikedPosts(ids);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="animate-fade-up pb-28 min-h-screen">
      <main className="max-w-xl mx-auto px-6 pt-8 space-y-4">
        
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-3xl font-bold text-blue-950 tracking-tight">ประชาสัมพันธ์</h2>
                <p className="text-slate-400 font-medium">วันที่ {formatDate(new Date())}</p>
            </div>
        </div>

        {posts.map((post) => {
          const party = PARTIES.find((p) => p.id === post.partyID) || { name: "ไม่ระบุพรรค", img: "/sapa.png" }; 
          const isLiked = likedPosts.includes(post.id);

          return (
            <div
              key={post.id}
              className="animate-fade-up bg-white p-5 rounded-3xl shadow-sm border border-slate-50 transition-all hover:shadow-md"
            >
              <div
                className="flex gap-3 cursor-pointer group"
                onClick={() => navigate(`/profile/${party.id}`)}
              >
                <div
                  className="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black shadow-sm overflow-hidden border-2 border-slate-50 transition-transform group-active:scale-95"
                >
                  <img src={party.img} className="w-full h-full object-cover" alt={party.name}/>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{party.name}</h4>
                  <p className="text-xs text-slate-400">
                    {formatDate(post.date?.toDate ? post.date.toDate() : post.date)}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-gray-600 leading-relaxed mb-3">
                {post.content}
              </p>

              {post.hasImage && (
                <div className="w-full rounded-2xl border border-sky-50 overflow-hidden mb-2 shadow-sm"> 
                  <img src={post.img} alt="" className="w-full h-auto object-cover"/> 
                </div>
              )}

              <div className="flex justify-between mt-4 text-sm font-bold">
                <div className="flex items-center gap-2">
                  <Heart 
                    className={`${isLiked ? "w-6 h-6 fill-red-500 text-red-500" : "w-6 h-6"} hover:scale-110 transition-transform cursor-pointer`} 
                    onClick={() => tickLikeClick(post)}
                  />
                  <span className="text-slate-700">ถูกใจ {post.likes} ครั้ง</span>
                </div>

                <div 
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors cursor-pointer text-slate-700" 
                  onClick={() => navigate(`/party/${post.partyID}/post/${post.id}`)}
                >
                  <MessageCircleQuestion className="w-5.5 h-5.5"/>
                  <span>ความคิดเห็น</span>
                </div>
              </div>
            </div>
          );
        })}
      </main>    
    </div>
  );
}