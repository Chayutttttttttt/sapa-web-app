import { useState,useEffect } from "react";
import { useParams,useNavigate } from "react-router-dom";
import { MoveLeft } from "lucide-react";
import { getDoc,doc,collection,query,orderBy,onSnapshot } from "firebase/firestore"
import { db } from "../../data/firebase";
import { partyCommentsPost } from "../../data/CommentPost";
import { formatDate } from "../../utils/formatDate";
import { MessageCircleQuestion,Send } from "lucide-react";

export default function PartyDatail({PARTIES}) {

    const { id, postID } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [party,setParty] = useState(null);
    const [isSummitting,setIsSubmitting] = useState(false);
    const [text, setText] = useState("");
    const [comments, setComments] = useState([]);
    
    useEffect(() => {
        if (!id) return;
        const fetchParty = async () => {
            try {
                const docRef = doc(db, "parties", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                setParty({ id: docSnap.id, ...docSnap.data() });
                } else {
                setParty(null);
                }
            } catch (error) {
                console.error("Error fetching party:", error);
            }
        };
        fetchParty();
    }, [id]);

    const currentParty = PARTIES.find(p => p.id === party?.UID);

    useEffect(() => {
        
        const fetchPost = async () => {
            setLoading(true);
            try {
                const postRef = doc(db,"posts",postID);

                const docPost = await getDoc(postRef);
                if (docPost.exists()) {
                    setPost({id:docPost.id,...docPost.data()});
                } else {
                    setPost(null);
                }
            } catch {
                console.error("Error fetching single post: ", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [postID]);

    useEffect(() => {
        if (!postID) return;
        const commentRef = collection(db, "posts", postID, "comments");
        const q = query(commentRef, orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          setComments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [postID]);
    
    const handlePartyCommentSubmit = async (currentParty) => {
        if (text.trim() === "" || isSummitting || !currentParty) return;
        setIsSubmitting(true);
        try {
          await partyCommentsPost(postID, currentParty, text);
          setText("");
        } catch (error) {
          console.error("Error submitting party comment:", error);
        } finally {
          setIsSubmitting(false);
        }
      };
    
    
    if (loading && !party) {
        return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;
    }

    if (!currentParty) {
        return <div className="p-10 text-center">ไม่พบข้อมูลพรรคที่ตรงกับ UID นี้</div>;
    }
    
    
    return (
        <div className="break-all max-w-xl mx-auto px-6 pt-8 pb-24 space-y-4">
            <button 
            onClick={() => navigate(`/partyAdmin/${id}/posts`)} 
            className="flex flex-row gap-1 group appearance-none bg-white border border-blue-100 text-blue-900 py-2 pl-4 pr-10 rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:cursor-pointer"
            >
                <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />  
                กลับ
            </button>
            <div className="animate-fade-up bg-white p-5 rounded-3xl shadow-md border border-white"> 
                <p className="text-slate-400 text-sm ">{formatDate(post.date?.toDate ? post.date.toDate() : post.date)}</p>
                <div className="pt-2 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 relative overflow-hidden">
                    <img src={`/${currentParty.img}`} alt="" className="w-full h-full object-cover"/>
                    </div>
                    <span className="font-medium ml-3 text-[15px]">{party?.name || "ไม่ทราบชื่อพรรค"}</span>
                </div>
                <h2 className="font-black text-xl leading-relaxed mt-2 text-slate-900">{post.content}</h2>
                <h5 className="font-medium mt-2 text-[15px] text-slate-700 leading-snug">{post.description}</h5>
                
                {post.hasImage && (
                    <img src={post.img} alt="Post" className="mt-4 rounded-2xl w-full h-auto object-cover shadow-lg border border-slate-100"/>
                )}
            </div>
            <div className="animate-fade-up bg-white p-6 rounded-3xl shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircleQuestion className="w-8 h-8 text-blue-600"/>
          <h3 className="font-black text-xl">ความคิดเห็น</h3>
        </div>
        
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <textarea 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            className="outline-none w-full bg-transparent resize-none text-slate-700" 
            rows="3" 
            placeholder="แสดงความคิดเห็นอย่างสร้างสรรค์..."
          ></textarea>
        </div>

        <button 
          onClick={() => handlePartyCommentSubmit(currentParty)} 
          disabled={isSummitting}
          className="w-full bg-blue-900 text-white px-6 py-3 rounded-xl flex items-center justify-center hover:bg-blue-800 transition-all font-bold gap-2 disabled:opacity-50 shadow-lg shadow-blue-100 hover:cursor-pointer"
        > 
          <Send className="w-4 h-4"/>
          {isSummitting ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
        </button>

        <div className="mt-8 space-y-4 pt-4 border-t border-slate-50">
          {comments.length === 0 ? (
            <p className="text-slate-400 font-medium text-center py-4">ยังไม่มีความคิดเห็น</p>
          ) : (
            comments.map((comment) => (
              <div 
                className={`p-4 rounded-2xl shadow-sm border ${comment.tag === 'user' ? 'bg-white border-slate-100' : 'bg-blue-50/50 border-blue-100'}`} 
                key={comment.id}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                    <img src={`/${comment.userImg}`} alt="Avatar" className="w-full h-full object-cover"/>
                  </div>
                  <span className={`font-bold text-sm ${comment.tag !== 'user' ? 'text-blue-700' : 'text-slate-700'}`}>
                    {comment.tag === 'user' ? comment.userName : `พรรค ${comment.userName}`}
                  </span>
                </div>
                <p className="text-slate-600 text-[15px] leading-relaxed ml-11">{comment.content}</p>
                <p className="text-slate-400 text-[10px] mt-2 ml-11 uppercase font-bold tracking-tight">
                    {post?.date ? formatDate(post.date?.toDate ? post.date.toDate() : post.date) : "กำลังโหลดวันที่..."}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    )
}