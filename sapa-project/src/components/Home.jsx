import { useState, useEffect } from "react";
import { PARTIES } from "../data/parties";
import { formatDate } from "../utils/formatDate";
import { Heart,MessageCircleQuestion } from "lucide-react";
import { useAuth } from "./Context";
import { getLikePosts } from "../data/getLikePosts";
import { collection, query, orderBy, getDocs, onSnapshot, limit } from "firebase/firestore";
import { db } from "../data/firebase";
import likedPost from "../data/LikedPost";

import '../app.css'

export default function Home({
  // posts,
  sortBy,
  setSortBy,
  navigateTo,
  openPost,
}) {
  const [likedPosts, setLikedPosts] = useState([]);
  const [isLiking,setIsLiking] = useState(false);
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();
  // const sortedPosts = async (sortBy) => {
  //   try {
  //     const postsRef = collection(db, "posts");
  //     const q = query(postsRef, orderBy("date", sortBy === "newest" ? "desc" : "asc"));

  //     const querySnapshot = await getDocs(q);
  //     const data = querySnapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data()
  //       }));
  //     setPosts(data);
  //   } catch (error) {
  //     console.error("Error fetching posts: ", error);
  //   }
  // };

  useEffect(() => {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("date", "desc"),limit(10));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // querySnapshot.docChanges().forEach((change) => {
      //   if (change.type === "added") {
      //     console.log("คอมเมนต์ใหม่: ", change.doc.data());
      //   }
      //   if (change.type === "modified") {
      //     console.log("คอมเมนต์ที่ถูกแก้ไข: ", change.doc.data());
      //   }
      //   if (change.type === "removed") {
      //     console.log("คอมเมนต์ที่ถูกลบ: ", change.doc.data());
      //   }
      // });
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(data);
      console.log("Data from Firebase:", data), console.log("Is from cache:", querySnapshot.metadata.fromCache);
    }, (error) => {
      console.error("Error fetching posts: ", error);
    });
    
    return () => {
      unsubscribe();
    }}, [sortBy]);

    const tickLikeClick = async (post) => {
      if (isLiking) return;
      
      setIsLiking(true);

      try {
        await likedPost(post, user, likedPosts,navigateTo);
        
        setTimeout(() => {
          setIsLiking(false);
        }, 10000);
        console.log("Post liked successfully")
      } catch (error) {
        console.error("Error liking post: ", error);
        setIsLiking(false);
      }
    };
  
  
  // useEffect(() => {
  //   const loadUserData = async () => {
  //     const userData = await getUserData(user);
  //     console.log("Fetched User Data:", userData);
  //   };
  //   loadUserData();
  // }, [user]);

  useEffect(() => {
    const unsubscribe = getLikePosts(user,(ids) => {
      setLikedPosts(ids);
    });
    return () => {
      unsubscribe();
    }  }, [user]);


  return (
    <div className="animate-fade-up pb-28 min-h-screen relativet t-0">
      <canvas id="bg-canvas"></canvas>

      {/* --- Main Content --- */}
      <main id="app-root" className="max-w-xl mx-auto px-6 pt-8 space-y-4">
        
        {/* ส่วนตัวเลือก Sorting (คงไว้เพื่อให้ Logic ทำงานได้) */}
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-3xl font-900 text-blue-950 tracking-tight font-bold">ประชาสัมพันธ์</h2>
                <p className="text-slate-400 font-medium">วันที่ {formatDate(new Date())}</p>
            </div>
        </div>

        {posts.map((post) => {
          // console.log("Data from Firebase:", post);
          const party = PARTIES.find((p) => p.id === post.partyID) || {}; 
          const isLiked = likedPosts.includes(post.id);
          // console.log("Is post liked:", isLiked);

          return (
            <div
              key={post.id}
              className="animate-fade-up bg-white p-5 rounded-3xl shadow-2xs transition-all hover:shadow-md"
            >
              <div
                className="flex gap-3 cursor-pointer"
                onClick={() => navigateTo('profile', party)}
              >
                <div
                  className="w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black shadow-sm overflow-hidden"
                  style={{ color: party.icon ,border: '4px solid '}}
                >
                  <img src={party.img} className="w-full h-full object-cover"/>
                </div>
                    <div>
                        <h4 className="font-bold text-gray-800">{party.name}</h4>
                        <p className="text-xs text-slate-400">
                            {formatDate(post.date?.toDate ? post.date.toDate() : post.date)}
                        </p>
                    </div>
                </div>

              <p
                className="mt-4 text-gray-600 leading-relaxed mb-3"
              >
                {post.content}
              </p>
              {post.hasImage ? <div className="w-full h-full bg-sky-50 rounded-3xl border border-sky-100 flex items-center justify-center overflow-hidden mb-2"> <img src={post.img} alt="" className="w-full h-full object-cover"/> </div>:""}
              <div className="flex justify-between mt-4 text-sm font-bold">
                <div className="flex items-center gap-2">
                  <Heart className={`${isLiked ? "w-6 h-6 fill-red-500 text-red-500" : "w-6 h-6"} hover:cursor-pointer`} onClick={() => tickLikeClick(post)}/>
                  <span>ถูกใจ {post.likes} ครั้ง</span>
                </div>
                <div className="flex items-center gap-2 hover:cursor-pointer" onClick={() => openPost(post.id)}>
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