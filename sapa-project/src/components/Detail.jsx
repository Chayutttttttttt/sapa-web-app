import { useState, useEffect } from "react";
import { getLikePosts } from "../data/getLikePosts";
import { useAuth } from "../components/Context";
import { formatDate } from "../utils/formatDate";
import { PARTIES } from "../data/parties";
import { MoveLeft,Heart,MessageCircleQuestion,Send } from "lucide-react";
import { db } from "../data/firebase";
import { doc, onSnapshot, getDoc, collection, query, orderBy } from "firebase/firestore";
import likedPost from "../data/LikedPost";
import { commentPost,partyCommentsPost } from "../data/CommentPost";
import '../app.css'

export default function PostDetail({ navigateTo,postId,isParty = false}) {
  const [post, setPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [isSummitting,setIsSubmitting] = useState(false);
  const [text,setText] = useState("");
  const [isLiking,setIsLiking] = useState(false);
  const { user } = useAuth();
  
  const handleCommentSubmit = async () => {
    if (text.trim() === "" || isSummitting) return;
    setIsSubmitting(true);
    try {
      await commentPost(postId,navigateTo,user,text);
    setText("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePartyCommentSubmit = async (party) => {
    if (text.trim() === "" || isSummitting) return;
    setIsSubmitting(true);
    try {
      await partyCommentsPost(postId,party,text);
    setText("");
    } catch (error) {
      console.error("Error submitting party comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    const commentRef = collection(db, "posts", postId, "comments");
    const q = query(commentRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
    });

    return () => {
      unsubscribe();
    };
  }, [postId]);
  // console.log("Comments:", comments);
  useEffect(() => {
  const postRef = doc(db, "posts", postId);
  const unsubscribe = onSnapshot(postRef, (snapshot) => {
    if (snapshot.exists()) {
      setPost({
        id: snapshot.id,  
        ...snapshot.data()
      })
    } else {
      console.log("Post not found");
      setPost(null);
    }
  }, (error) => {
    console.error("Error fetching post: ", error);
  });

  // const fetchPostOnce = async () => {
  //   try {
  //     const docSnap = await getDoc(postRef);
  //     if (docSnap.exists()) {
  //       setPost({
  //         id: docSnap.id,
  //         ...docSnap.data()
  //       });
  //     } else {
  //       console.log("Post not found");
  //       setPost(null);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching post: ", error);
  //   }
  // };

  // fetchPostOnce()

  return () => {
    unsubscribe();}
  }, [postId]);

  const tickLikeClick = async () => {
    if (isLiking || isParty) return;
    
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

  useEffect(() => {
    const unsubscribe = getLikePosts(user,(ids) => {
      setLikedPosts(ids);
    });
    return () => {
      unsubscribe();
    }
  },[user])

  if (!post) {
    return (
      <div className="max-w-xl mx-auto px-6 pt-20 text-center text-slate-400 font-bold">
        กำลังโหลดเนื้อหา...
      </div>
    );
  }

  const party = PARTIES.find((p) => p.id === post.partyID);
  const isLiked = likedPosts.includes(post.id);

  return (
    <div className="max-w-xl mx-auto px-6 pt-8 space-y-4">
      <button onClick={() => (isParty === false) ? navigateTo("profile", party) : navigateTo("partyPosts")} className="flex felx-row gap-1 group appearance-none bg-white border border-blue-100 text-blue-900 py-2 pl-4 pr-10 rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:cursor-pointer">
        <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />  
        กลับ
      </button>

      <div className="animate-fade-up bg-white p-7 rounded-3xl shadow-md"> 
        <p className="text-slate-400 text-sm ">{formatDate(post.date?.toDate ? post.date.toDate() : post.date)}</p>
        <div className="pt-2 flex flex-2">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 relative overflow-hidden">
            <img src={party.img} alt="" className="w-full h-full object-cover"/>
          </div>
          <span className="font-medium ml-3 mt-1 text-[15px]">{party.name}</span>
        </div>
        <h2 className="font-black text-3xl">{post.content}</h2>
        <h5 className="font-medium mt-2 text-[19px] ">{post.description}</h5>
        {post.hasImage ? <img src={post.img} alt="Post Image" className="mt-4 rounded-xl w-full h-auto object-cover shadow-xl"/> : ""}
        {isParty ? ('') : (
          <div className="flex items-center gap-2 mt-4 font-bold">
            <Heart className={`${isLiked ? "w-6 h-6 fill-red-500 text-red-500" : "w-6 h-6"} hover:cursor-pointer`} onClick={() => tickLikeClick()}/>
            <span>ถูกใจ {post.likes} ครั้ง</span>
          </div>
        )}
      </div>

      {/* Comments add */}
      <div className="animate-fade-up bg-white p-5 rounded-3xl shadow-md">
        <MessageCircleQuestion className="w-10 h-10 mb-2"/>
        <h3 className="font-black text-xl">ความคิดเห็น</h3>
        <p className="text-slate-400 text-sm">กรุณาเเสดงความคิดเห็นอย่างส้รางสรรค์...</p>
        <div className="animate-fade-up bg-white p-5 rounded-3xl shadow-xl mt-1">
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="outline-none w-full h-full resize-y" rows="4" cols="50" type="text" placeholder="พิมพ์ที่นี่..."></textarea>
        </div>
        <button onClick={() => isParty ? handlePartyCommentSubmit(party) : handleCommentSubmit()} className="mt-4 bg-blue-950 text-white px-4 py-2 rounded-md flex items-center hover:cursor-pointer hover:bg-blue-700 transition gap-1"> <Send className="w-4 h-4"/>ส่งความคิดเห็น</button>
        <div className="mt-6 space-y-4">
          {comments.length === 0 ? (
            <p className="text-slate-400 font-medium text-center md-4">ยังไม่มีความคิดเห็น</p>
          ) : (
            comments.map((comment) => {
              return (
                comment.tag === 'user' ? (
                  <div className="animate-fade-up bg-white p-5 rounded-3xl shadow-xl" key={comment.id}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 font-bold">
                        <img src={comment.userImg} alt="User Avatar" className="w-full h-full object-cover rounded-full"/>
                      </div>
                      <span className="font-medium">{comment.userName}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{comment.content}</p>
                    <p className="text-slate-400 text-sm mt-2">{formatDate(comment.timestamp?.toDate ? comment.timestamp.toDate() : comment.timestamp)}</p>
                  </div>
                ) : (
                  <div className="animate-fade-up bg-white m-0.5 p-5 rounded-3xl shadow-md" key={comment.id}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-right text-slate-300 font-bold ">
                        <img src={comment.userImg} alt="User Avatar" className="w-full h-full object-cover rounded-full"/>
                      </div>
                      <span className="font-medium"> พรรค {comment.userName}</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{comment.content}</p>
                    <p className="text-slate-400 text-sm mt-2">{formatDate(comment.timestamp?.toDate ? comment.timestamp.toDate() : comment.timestamp)}</p>
                  </div>)
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
