import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../data/firebase";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { MoveLeft, CircleCheckIcon } from "lucide-react";
import { formatDate } from "../utils/formatDate";
import { PARTIES } from "../data/parties"; 

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  

  const party = PARTIES.find((p) => p.id === id);
  
  const [posts, setPosts] = useState([]);
  const [profileTab, setProfileTab] = useState("policies");
  const [loadingPosts, setLoadingPosts] = useState(false);

  const getPostsByPartyID = async (partyID) => {
    setLoadingPosts(true);
    try {
      const postsQuery = query(
        collection(db, "posts"),
        where("partyID", "==", partyID),
        orderBy("date", "desc"),
        limit(20)
      );
      const querySnapshot = await getDocs(postsQuery);
      const data = querySnapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id 
      }));
      setPosts(data);
    } catch (error) {
      console.error("Error fetching party posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (party) {
      getPostsByPartyID(party.id);
    }
  }, [id, party]);

  if (!party) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-400">ไม่พบข้อมูลพรรค</h2>
        <button onClick={() => navigate('/parties')} className="hover:cursor-pointer mt-4 text-blue-600 font-bold">กลับไปหน้ารวมพรรค</button>
      </div>
    );
  }

  return (
    <div className='animate-fade-up pb-28 min-h-screen relative max-w-xl mx-auto px-6 pt-8 space-y-4'>
      <button 
        onClick={() => navigate("/parties")} 
        className="flex items-center gap-2 group bg-white border border-blue-100 text-blue-900 py-2.5 px-5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-blue-50 transition-all cursor-pointer"
      >
        <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> กลับ
      </button>
      
      <div className="relative bg-white rounded-[40px] p-8 border border-blue-50 shadow-2xl shadow-blue-900/5 mb-8 overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-24 opacity-10" style={{ background: party.icon }}></div>
        <div className="relative z-10">
          <div 
            className="w-28 h-28 mx-auto bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-6 transform -rotate-3 overflow-hidden border-8"
            style={{ borderColor: party.icon }}
          >
            {party.img ? (
              <img src={party.img} alt="Party Logo" className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-black text-4xl" style={{ background: party.icon }}>
                {party.shortName[0]}
              </div>
            )}
          </div>
          <h2 className="text-3xl font-black text-blue-950">{party.name}</h2>
          <span className="mt-3 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[11px] font-black uppercase tracking-[3px] inline-block mb-6">
            {party.shortName}
          </span>
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">{party.bio}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6 px-2 border-b border-slate-100">
        {["policies", "members", "posts"].map((t) => (
          <button
            key={t}
            onClick={() => setProfileTab(t)}
            className={`pb-3 text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              profileTab === t 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-slate-400 border-b-2 border-transparent hover:text-slate-600"
            }`} 
          >
            {t === 'policies' ? 'นโยบาย' : t === 'members' ? 'สมาชิก' : 'โพสต์'}
          </button>
        ))}
      </div>

      <div className="min-h-300px">
        {profileTab === "policies" && (
          <div className="space-y-4 animate-fade-up">
            {party.policies.map((p, i) => (
              <div key={i} className="p-6 bg-white rounded-xl border border-blue-50 shadow-sm hover:border-blue-200 transition-colors">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  <CircleCheckIcon className="w-6 h-6"/>
                </div>
                <h4 className="font-extrabold text-blue-950 mb-2 text-xl">{p.title}</h4>
                <p className="text-slate-500 text-base font-medium leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        )}

        {profileTab === "members" && (
          <div className="grid md:grid-cols-2 gap-4 animate-fade-up">
            {party.members.map((m, i) => (
              <div key={i} className={`p-5 rounded-2xl text-center border transition-all ${
                m.role === 'ADMIN' 
                  ? 'bg-red-50 border-red-100' 
                  : 'bg-white border-slate-100 shadow-sm'
              }`}>
                <div className="w-auto h-auto mx-auto rounded-2xl mb-4 overflow-hidden border-4 border-white shadow-md">
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <h6 className={`font-black text-sm mb-1 ${m.role === 'ADMIN' ? 'text-red-950' : 'text-blue-950'}`}>
                  {m.name}
                </h6>
                <p className={`text-[10px] font-black uppercase tracking-wider ${m.role === 'ADMIN' ? 'text-red-500' : 'text-blue-500'}`}>
                  {m.role}
                </p>
              </div>
            ))}
          </div>
        )}

        {profileTab === "posts" && (
          <div className="space-y-4 animate-fade-up">
            {loadingPosts ? (
              <p className="text-center text-slate-400 py-10">กำลังโหลดโพสต์...</p>
            ) : posts.length > 0 ? (
              posts.map((p) => (
                <div key={p.id} className="p-6 bg-white rounded-3xl border border-blue-50 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-3">
                    {formatDate(p.date?.toDate ? p.date.toDate() : p.date)}
                  </p>
                  <h4 className="font-bold text-slate-700 leading-relaxed mb-4 line-clamp-3">
                    {p.content}
                  </h4>
                  <button 
                    onClick={() => navigate(`/party/${p.partyID}/post/${p.id}`)}
                    className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline hover:cursor-pointer"
                  >
                    อ่านเพิ่มเติม
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-10 font-bold">ยังไม่มีการเผยแพร่โพสต์</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}