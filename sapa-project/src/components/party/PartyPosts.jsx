import { useState, useEffect } from "react";
import { db } from "../../data/firebase";
import { collection, query, where, orderBy,doc,getDocs,getDoc } from "firebase/firestore";
import { formatDate } from "../../utils/formatDate";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MessageSquare, Calendar } from "lucide-react";

export default function PartyPosts({ PARTIES }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [party,setParty] = useState(null);
    
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
        if (!currentParty?.id) return;

        const fetchPosts = async () => {
            setLoading(true);
            try {
                const postsQuery = query(
                    collection(db, "posts"),
                    where("partyID", "==", currentParty.id),
                    orderBy("date", "desc")
                );

                const querySnapshot = await getDocs(postsQuery);
                
                const postsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setPosts(postsData);
            } catch (error) {
                console.error("Error fetching party posts: ", error);
            } finally {
                setLoading(false); 
            }
        };

        fetchPosts();
    }, [currentParty?.id]);
    
    if (loading && !party) {
        return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;
    }

    if (!currentParty) {
        return <div className="p-10 text-center">ไม่พบข้อมูลพรรคที่ตรงกับ UID นี้</div>;
    }

    return (
        <div className="animate-fade-up min-h-screen bg-slate-50 pb-28">
            <div className="bg-white border-b border-slate-200 px-6 py-6 sticky top-0 z-10">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <button 
                        onClick={() => navigate(`/partyAdmin/${id}`)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-500"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="font-black text-blue-950">โพสต์ทั้งหมด</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-6 mt-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-800">
                        {currentParty.name}
                    </h2>
                    <h3 className="text-xl font-light text-slate-800"> ข้อมูลโพสต์ทั้งหมด </h3>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400 font-bold">กำลังโหลดข้อมูล...</div>
                ) : posts.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-slate-200">
                        <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">ยังไม่มีการสร้างโพสต์</p>
                        <button 
                            onClick={() => navigate(`/partyAdmin/${id}/create`)}
                            className="mt-4 text-blue-600 font-black text-sm hover:underline cursor-pointer"
                        >
                            เริ่มสร้างโพสต์แรกของคุณ &rarr;
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => navigate(`${p.id}`)}
                                className="group bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div 
                                    className="absolute left-0 top-0 bottom-0 w-1" 
                                    style={{ backgroundColor: currentParty.icon || '#3b82f6' }}
                                ></div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(p.date?.toDate ? p.date.toDate() : p.date)}
                                    </div>
                                    
                                    <h4 className="font-bold text-slate-700 leading-relaxed line-clamp-3 group-hover:text-blue-950 transition-colors">
                                        {p.content}
                                    </h4>

                                    <div className="mt-2 pt-3 border-t border-slate-50 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                            คลิกเพื่อดูรายละเอียดคามคิดเห็น
                                        </span>
                                        <ChevronLeft className="w-4 h-4 text-slate-300 rotate-180" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}