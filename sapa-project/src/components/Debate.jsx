import { useState,useEffect } from "react";
import { query, where, doc ,getDocs ,collection, updateDoc, increment, addDoc } from "firebase/firestore";
import { db } from "../data/firebase";
import { useAuth } from "./Context";
import { useNavigate } from "react-router-dom";
import { Check,Lock,Timer } from "lucide-react"; 

import Swal from "sweetalert2";

export default function Debate() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [choseDebateParty,setChoseDebateParty] = useState('');
    const [isVote,setIsVote] = useState(false);
    const [isSending,setIsSending] = useState(false);
    const [isDebateDay, setIsDebateDay] = useState(false);
    const [loading,setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    const DebateDate = new Date('2026-02-12T15:25:10+07:00');
    
    const [description,setDescription] = useState("");
    const [sec,setSec] = useState("");

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const cachedVote = localStorage.getItem('voted_debate')
        const fetchData = async () => {
            try {
                const debate = collection(db, 'debate');
                const q = query(debate, where("uid", "==", user.uid)); 
                const queryDocs = await getDocs(q);
                if (!queryDocs.empty) {
                    setIsVote(true);
                } else {
                    setIsVote(false);
                }
            } catch (error) {
                console.error("Error checking vote status:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const difference = DebateDate - now;

            if (difference <= 0) {
                setIsDebateDay(true);
                clearInterval(timer);
                return true;
            } else {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft(`${days} วัน ${hours} ชม ${minutes} นาที ${seconds} วิ`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const voteDebate = async (PID) => {
        
        if (!user || isVote) return;
        
        setIsSending(true);

        try {
            const q = query(collection(db,'parties'), where("UID","==",PID));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const partyDocId = querySnapshot.docs[0].id;
                const partyRef = doc(db,'parties',partyDocId);
                await updateDoc(partyRef, {vote:increment(1)});

                const debateData = collection(db,'debate');
                await addDoc(debateData, {
                    uid: user.uid,
                    vote: PID,
                    secondary: sec,
                    description: description,
                    date: new Date()
                });

                Swal.fire({
                    title: 'ส่งคะแนนสำเร็จ!',
                    text: 'ขอบคุณที่ร่วมส่งเสียงให้พรรคที่คุณเชียร์ครับ',
                    icon: 'success',
                    confirmButtonText: 'ตกลง',
                    confirmButtonColor: '#3085d6'
                }).then((result) => {
                    if (result.isConfirmed) navigate('/');
                });
            };

        } catch (error) {
            console.error("เกิดข้อผิดพลาด:", error);
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: 'กรุณาลองใหม่อีกครั้ง',
                icon: 'error',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#d33'
            });
        } finally {
            setIsSending(false);
            localStorage.setItem('voted_debate',true)
        };
    };


    const cards = [
        {
            id:'p1',
            name:'พรรคประชานารี',
            color:'#FF00FF',
            img:'https://i.postimg.cc/Bn3r6mLH/debate_p1.png'
        },
        {
            id:'p2',
            color:'#FF6400',
            name:'Gorgeous radiant Nareerat',
            img:'https://i.postimg.cc/FHvMRTdc/debate_p2.png'
        },
        {
            id:'p3',
            color:'#097969',
            name:'NR NEXT GEN',
            img:'https://i.postimg.cc/dVFb15kG/debate_p3.png'
        }
    ];

    if (loading) {
        return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;
    }

    if (!isDebateDay) {
        return (
            <div className="gap-2 animate-fade-up min-h-screen flex flex-col items-center pt-20 pb-32 bg-[#F8FAFC] text-center px-6 w-full">
                <div className="relative mb-2">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto relative z-10">
                        <Lock className="w-10 h-10 text-blue-600 animate-bounce"/>
                    </div>
                    <div className="absolute inset-0 bg-blue-200 blur-2xl opacity-30 rounded-full scale-110"></div>
                </div>

                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-blue-950 tracking-tight">เร็ว ๆ นี้!</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Debate is coming</p>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-white shadow-lg">
                    <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                        <Timer className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">นับถอยหลังสู่การดีเบต</span>
                    </div>
                    <div className="text-lg font-black text-blue-900 tabular-nums pb-2">
                        {timeLeft || "กำลังคำนวณ..."}
                    </div>
                    
                    <div className="justify-center items-center rounded-2xl">
                        <img src="https://i.postimg.cc/grF8B0Rb/S8298541.jpg" alt="Debate" className="w-90 items-center overflow-hidden rounded-2xl"/>
                    </div>

                    <p className="mt-3 text-slate-500 text-xs leading-relaxed px-2">
                        *ท่านจะสามารถเข้าถึงหน้านี้ได้เพื่อโหวตเมื่อถึงเวลาที่กำหนดเท่านั้น
                    </p>
                </div>

                {!user && (
                    <button 
                        onClick={() => navigate('/login')}
                        className="mt-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline cursor-pointer transition-all"
                    >
                        เข้าสู่ระบบเพื่อเตรียมพร้อม &rarr;
                    </button>
                )}
            </div>
        )
    };

    console.log(sec)

    if (!user) {
        return (
            <div className="gap-2 animate-fade-up min-h-screen flex flex-col items-center pt-20 pb-32 bg-[#F8FAFC] text-center px-6 w-full">
                <div className="relative mb-2">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto relative z-10">
                        <Lock className="w-10 h-10 text-blue-600 animate-bounce"/>
                    </div>
                    <div className="absolute inset-0 bg-blue-200 blur-2xl opacity-30 rounded-full scale-110"></div>
                </div>

                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-blue-950 tracking-tight">กรุณาเข้าสู่ระบบเพื่อโหวตพรรคที่ท่านชอบ</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Locked</p>
                </div>

                <button 
                    onClick={() => navigate('/login')}
                    className="mt-2 text-blue-600 font-black text-ms uppercase tracking-widest hover:underline cursor-pointer transition-all"
                >
                    เข้าสู่ระบบเพื่อเตรียมพร้อม &rarr;
                </button>
            </div>
        )
    };
    
    return (
        <div>
            {!isVote ? (
                <div className='transition-all' style={{backgroundColor: choseDebateParty && `${choseDebateParty.color}20`}}>
                    <div className='animate-fade-up pb-20 min-h-screen relative max-w-xl mx-auto px-6 pt-8 '>
                        <div className="text-center mb-5">
                            <img src="https://i.postimg.cc/VNffWcJD/Debate.png" className="w-full h-full"/>
                            <p className="text-slate-500 text-sm md:text-base">คลิกที่รูปภาพเพื่อเลือกพรรคที่คุณประทับใจ</p>
                        </div>
                        {cards.map((p) => {
                            return (
                                <div key={p.id} className="w-full flex flex-col justify-center items-center">
                                    <img 
                                        src={p.img} 
                                        onClick={() => setChoseDebateParty(p)} 
                                        className={`transition-all hover:cursor-pointer hover:scale-105 ${
                                            choseDebateParty.id === p.id ? 'w-100' : 'grayscale w-90'
                                        }`} 
                                        alt={p.name} 
                                    />
                                    <p className={`text-lg font-black transition-colors ${choseDebateParty.id === p.id ? 'text-slate-900' : 'text-slate-500'}`}>
                                        {p.name}
                                    </p>
                                </div>
                            )
                        })}
                        <div className="flex flex-col justify-center mt-20 bg-white p-5 rounded-3xl shadow-sm border border-slate-50 transition-all hover:shadow-md">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">คุณอยู่ระดับชั้นไหน</label>
                            <select
                                className="w-full h-12 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer text-gray-700"
                                defaultValue=""
                                onChange={(e) => setSec(e.target.value)}
                                >
                                <option value="" disabled>-- กรุณาเลือก --</option>
                                <option value="m1">มัธยมศึกษาปีที่ 1 (ม.1)</option>
                                <option value="m2">มัธยมศึกษาปีที่ 2 (ม.2)</option>
                                <option value="m3">มัธยมศึกษาปีที่ 3 (ม.3)</option>
                                <option value="m4">มัธยมศึกษาปีที่ 4 (ม.4)</option>
                                <option value="m5">มัธยมศึกษาปีที่ 5 (ม.5)</option>
                                <option value="m6">มัธยมศึกษาปีที่ 6 (ม.6)</option>
                                <option value="admin">บุคลากร</option>
                            </select>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">คุณเลือกพรรคนี้เพราะอะไร</label>
                            <input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                type="text"
                                placeholder="พิมพ์ที่นี่..."
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-slate-700"
                            />
                        </div>
                        <div className="justify-center flex">
                            <button 
                                disabled={!choseDebateParty}
                                onClick={() => voteDebate(choseDebateParty.id)}
                                className={` mt-10 group md:text-xl flex items-center gap-2 py-4 px-10 rounded-full font-bold text-ms transition-all duration-300 shadow-lg active:scale-95
                                    ${choseDebateParty && description && sec
                                        ? 'bg-slate-900 text-white hover:shadow-2xl hover:cursor-pointer' 
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                                {isSending ? (
                                    "กำลังบันทึกข้อมูล..."
                                ):(
                                    <>
                                        {choseDebateParty && description && sec ? `ยืนยันเลือกพรรค ${choseDebateParty.name}` : 'กรุณาเลือกพรรคที่ชอบ เเละใส่ข้อมูลให้ครบถ้วน'}
                                        {choseDebateParty && description && sec && <span className="group-hover:translate-x-1 transition-transform">→</span>}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ):(
                <div className="gap-2 animate-fade-up min-h-screen flex flex-col items-center pt-20 pb-32 bg-green-100 text-center px-6 w-full">
                    <div className="relative mb-2">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto relative z-10">
                            <Check className="w-10 h-10 text-green-600"/>
                        </div>
                        <div className="absolute inset-0 bg-blue-200 blur-2xl opacity-30 rounded-full scale-110"></div>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-green-950 tracking-tight">คุณเลือกเรียบร้อยเเล้ว</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">กรุณากลับสู่หน้าหลัก</p>
                    </div>
                    <button 
                        onClick={() => navigate('/')}
                        className="mt-2 text-blue-600 font-black text-ms uppercase tracking-widest hover:underline cursor-pointer transition-all"
                    >
                        กลับสู่หน้าหลัก &rarr;
                    </button>
                </div>
            )}
        </div>
        
        
    )
};