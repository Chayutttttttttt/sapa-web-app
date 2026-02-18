import { useState,useEffect } from "react";
import { query, where, doc ,getDocs ,collection, updateDoc, increment, addDoc,getCountFromServer } from "firebase/firestore";
import { db } from "../data/firebase";
import { useAuth } from "./Context";
import { useNavigate } from "react-router-dom";
import { Check,Lock,Timer } from "lucide-react"; 

import Swal from "sweetalert2";

// Component สำหรับ Animated Counter
function AnimatedCounter({ finalValue, duration = 1000 }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startTime = Date.now();
        let animationFrame;

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const currentValue = progress * finalValue;
            setDisplayValue(currentValue);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [finalValue, duration]);

    return displayValue.toFixed(1);
}

export default function Debate() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [choseDebateParty, setChoseDebateParty] = useState('');
    const [isVote, setIsVote] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isDebateDay, setIsDebateDay] = useState(false);
    const [isDebateEnded, setIsDebateEnded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    const [disk,setdisk] = useState("poll")
    const [parties, setParties] = useState([]);

    const DebateDate = new Date('2026-02-18T08:00:00+07:00');
    const DebateEndDate = new Date('2026-02-18T08:10:00+07:00');
    
    const [description, setDescription] = useState("");
    const [sec, setSec] = useState("");
    const [detail, setDetail] = useState("");

    // 1. ดึงข้อมูลพรรค และนับคะแนนจาก collection 'debate'
    useEffect(() => {
        const fetchPartiesAndVotes = async () => {
            try {
                const partySnap = await getDocs(collection(db, 'parties'));
                const partyList = partySnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // นับคะแนนสดๆ จาก collection 'debate' สำหรับแต่ละพรรค
                const partiesWithLiveVotes = await Promise.all(partyList.map(async (party) => {
                    const q = query(collection(db, disk), where("vote", "==", party.UID));
                    const countSnap = await getCountFromServer(q);
                    return { ...party, voteCount: countSnap.data().count };
                }));

                setParties(partiesWithLiveVotes);
            } catch (err) {
                console.error("Error fetching data: ", err);
            }
        };
        fetchPartiesAndVotes();
    }, []);

    // 2. ตรวจสอบสถานะการโหวตของผู้ใช้
    useEffect(() => {
        if (!user) return;
        const checkUserVote = async () => {
            setLoading(true);
            const cachedVote = localStorage.getItem('voted');

            try {
                const q = query(collection(db, disk), where("uid", "==", user.uid));
                const queryDocs = await getDocs(q);
                setIsVote(!queryDocs.empty || !!cachedVote);
            } catch (error) {
                console.error("Error checking vote status:", error);
            } finally {
                setLoading(false);
            }
        };
        checkUserVote();
    }, [user]);

    // 3. Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const differenceEnd = DebateEndDate - now;
            const differenceStart = DebateDate - now;
            
            // ตรวจสอบว่าถึงเวลาปิดการโหวตแล้ว (08:30)
            if (differenceEnd <= 0) {
                setIsDebateEnded(true);
                setIsDebateDay(false);
                clearInterval(timer);
            } 
            // ตรวจสอบว่าถึงเวลาเปิดการโหวต (08:00) แล้ว
            else if (differenceStart <= 0 && !isDebateDay) {
                setIsDebateDay(true);
            } 
            // แสดงเวลานับถอยหลังจนกว่าจะถึง 08:00
            else if (differenceStart > 0) {
                const days = Math.floor(differenceStart / (1000 * 60 * 60 * 24));
                const hours = Math.floor((differenceStart / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((differenceStart / 1000 / 60) % 60);
                const seconds = Math.floor((differenceStart / 1000) % 60);
                setTimeLeft(`${days} วัน ${hours} ชม ${minutes} นาที ${seconds} วิ`);
            } else if (differenceStart < 0 && differenceEnd > 0) {
                const days = Math.floor(differenceEnd / (1000 * 60 * 60 * 24));
                const hours = Math.floor((differenceEnd / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((differenceEnd / 1000 / 60) % 60);
                const seconds = Math.floor((differenceEnd / 1000) % 60);
                setTimeLeft(`${days} วัน ${hours} ชม ${minutes} นาที ${seconds} วิ`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [isDebateDay]);

    // 4. ฟังก์ชันส่งผลโหวต (เน้นเขียนลงคอลเลกชัน debate)
    const voteDebate = async (PID) => {
        if (!user || isVote) return;
        setIsSending(true);
        try {
            await addDoc(collection(db, disk), {
                uid: user.uid,
                vote: PID, // เก็บ ID ของพรรคที่เลือก
                secondary: sec,
                detail: detail,
                description: description,
                date: new Date()
            });

            localStorage.setItem('voted', true);
            
            Swal.fire({
                title: 'ส่งคะแนนสำเร็จ!',
                text: 'ขอบคุณที่ร่วมส่งเสียงให้พรรคที่คุณเชียร์ครับ',
                icon: 'success',
                confirmButtonText: 'ตกลง'
            }).then((result) => {
                if (result.isConfirmed) navigate('/');
            });
        } catch (error) {
            console.error("Error voting:", error);
            Swal.fire({ title: 'เกิดข้อผิดพลาด', icon: 'error' });
        } finally {
            setIsSending(false);
        }
    };

    // ข้อมูล Static Cards สำหรับแสดงผลหน้าโหวต
    const cards = [
        { id: 'p1', name: 'พรรคประชานารี', color: '#FF00FF', img: 'https://i.postimg.cc/Bn3r6mLH/debate_p1.png' },
        { id: 'p2', name: 'Gorgeous radiant Nareerat', color: '#FF6400', img: 'https://i.postimg.cc/FHvMRTdc/debate_p2.png' },
        { id: 'p3', name: 'NR NEXT GEN', color: '#097969', img: 'https://i.postimg.cc/dVFb15kG/debate_p3.png' }
    ];

    if (loading) {
        return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;
    }

    // แสดงผลลัพธ์เมื่อเลิกโหวตแล้ว (ถึง 08:30)
    if (isDebateEnded) {
        const totalVotes = parties?.reduce((sum, p) => sum + (p.voteCount || 0), 0) || 0;

        return (
            <div className="animate-fade-up  w-full h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
                <div className="w-full max-w-2xl bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                    
                    {/* Header */}
                    <div className="text-center mb-12">
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 inline-block">
                            Results
                        </span>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-2">ผลการปราศัย</h2>
                        <p className="text-slate-400 font-medium">โรงเรียนนารีรัตน์จังหวัดเเพร่</p>
                    </div>

                    {/* Progress Bar เส้นเดียวแบ่งสัดส่วน */}
                    <div className="relative mb-16 px-2">
                        <style>{`
                            @keyframes shimmer {
                                0% { background-position: -1000px 0; }
                                100% { background-position: 1000px 0; }
                            }
                            .progress-item {
                                animation: shimmer 3s ;
                                background-size: 1000px 100%;
                            }
                        `}</style>
                        <div className="w-full h-10 rounded-2xl flex shadow-inner p-1 gap-1">
                            {parties?.map((p) => {
                                const voteShare = totalVotes > 0 ? (p.voteCount / totalVotes) * 100 : 0;
                                if (voteShare === 0) return null;
                                return (
                                    <div
                                        key={p.id}
                                        style={{ 
                                            width: `${voteShare}%`, 
                                            backgroundColor: p.color || '#cbd5e1',
                                            backgroundImage: `linear-gradient(90deg, ${p.color || '#cbd5e1'}, rgba(255,255,255,0.3), ${p.color || '#cbd5e1'})`
                                        }}
                                        className="progress-item rounded-md h-full first:rounded-l-xl last:rounded-r-xl transition-all duration-1000 ease-out hover:brightness-110 cursor-help relative group"
                                    >
                                        {voteShare > 10 && (
                                            <div className="flex items-center justify-left pl-2 h-full">
                                                <span className="text-white font-black text-xs md:text-sm drop-shadow-sm">
                                                    <AnimatedCounter finalValue={voteShare} duration={1500} />%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* แสดงยอดรวมตรงกลางเส้น (ถ้าต้องการ) */}
                        <div className="absolute -bottom-5 w-full flex justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    {/* รายละเอียดแต่ละพรรคด้านล่าง */}
                    <div className="grid gap-4">
                        {parties?.map((p) => {
                            const voteShare = totalVotes > 0 ? (p.voteCount / totalVotes) * 100 : 0;
                            return (
                                <div key={p.id} onClick={() => navigate(`/profile/${p.UID}`)} className="hover:cursor-pointer flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    {/* Logo พรรค */}
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-full border-2 p-0.5" style={{ borderColor: `${p.color}40` }}>
                                            <img src={p.logo} alt={p.name} className="w-full h-full rounded-full object-cover bg-white" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg" style={{ backgroundColor: p.color }}>
                                            {p.UID ? p.UID[1] : '?'}
                                        </div>
                                    </div>

                                    {/* เปอร์เซ็นต์ */}
                                    <div className="text-right">
                                        <span className="text-2xl font-black tracking-tighter" style={{ color: p.color }}>
                                            <AnimatedCounter finalValue={voteShare} duration={1500} />%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );}

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
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Coming Soon!!</p>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-white shadow-lg">
                    <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                        <Timer className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">นับถอยหลัง</span>
                    </div>
                    <div className="text-lg font-black text-blue-900 tabular-nums pb-2">
                        {timeLeft || "กำลังคำนวณ..."}
                    </div>
                    
                    {/* <div className="justify-center items-center rounded-2xl">
                        <img src="https://i.postimg.cc/grF8B0Rb/S8298541.jpg" alt="Debate" className="w-90 items-center overflow-hidden rounded-2xl"/>
                    </div> */}

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
                    <h2 className="text-3xl font-black text-blue-950 tracking-tight">กรุณาเข้าสู่ระบบ</h2>
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
                            <h1 className="text-9xl font-poll font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-blue-800 to-cyan-500 drop-shadow-2xl">
                                POLL
                            </h1>
                            
                            <p className="text-slate-500 text-sm md:text-base">คลิกที่รูปภาพเพื่อเลือกพรรคที่คุณประทับใจ</p>
                            <div className="mt-3 inline-flex items-center px-4 py-1.5 bg-red-50 border-2 border-red-500 rounded-2xl shadow-sm animate-pulse">
                                <div className="text-lg font-black text-red-600 tabular-nums">
                                    เหลือเวลา {timeLeft || "กำลังคำนวณ..."}
                                </div>
                            </div>
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
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">คุณชื่นชอบพรรคนี้เพราะอะไร</label>
                            <select
                                className="w-full h-12 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer text-gray-700"
                                defaultValue=""
                                onChange={(e) => setDetail(e.target.value)}
                                >
                                <option value="" disabled>-- กรุณาเลือก --</option>
                                <option value="member">ผู้สมัคร</option>
                                <option value="policy">นโยบายพรรค</option>
                                <option value="skill">ความสามารถในการตอบคำถาม</option>
                            </select>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">รายละเอียดเพิ่มเติม</label>
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
                                    ${choseDebateParty && detail && sec
                                        ? 'bg-slate-900 text-white hover:shadow-2xl hover:cursor-pointer' 
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                                {isSending ? (
                                    "กำลังบันทึกข้อมูล..."
                                ):(
                                    <>
                                        {choseDebateParty && detail && sec ? `ยืนยันเลือกพรรค ${choseDebateParty.name}` : 'กรุณาเลือกพรรคที่ชอบ เเละใส่ข้อมูลให้ครบถ้วน'}
                                        {choseDebateParty && detail && sec && <span className="group-hover:translate-x-1 transition-transform">→</span>}
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