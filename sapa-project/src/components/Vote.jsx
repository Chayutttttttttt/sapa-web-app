import { Lock, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "./Context";
import { useNavigate } from "react-router-dom";
import { PARTIES } from "../data/parties";
import '../app.css';

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

    return displayValue.toFixed(1)
}

export default function Vote() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isElectionDay, setIsElectionDay] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    const [parties, setParties] = useState([]);
    const [loading,setLoading] = useState(false);
    const allStudents = 2495;

    useEffect(() => {
        const URL = import.meta.env.VITE_API_URL;
        const fetchVotes = async () => {
            try {
                setLoading(true);
                const response = await fetch(URL);
                
                if (!response.ok) {
                throw new Error('Network response was not ok');
                }

                const result = await response.json();
                if (result && result.summary && result.summary.candidates) {
                    setParties(result.summary);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            };
        };
        fetchVotes();
        const interval = setInterval(fetchVotes,300000);
        return () => clearInterval(interval);
        }, []);

    const electionDate = new Date('2026-02-20T18:00:00+07:00');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const difference = electionDate - now;

            if (difference <= 0) {
                setIsElectionDay(true);
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

    
    if (loading) return <div className="max-w-xl mx-auto px-6 pt-32 text-center text-slate-400 font-bold animate-pulse"> กำลังโหลดเนื้อหา...</div>;
    
    const candidates = parties?.candidates || [];
    const noVoteCount = parties?.noVote || 0;

    const mappedParties = candidates.map(apiItem => {
        // ค้นหาข้อมูลที่ id ตรงกันในไฟล์ data/parties.js
        const staticData = PARTIES.find(p => String(p.id) === String(apiItem.tag));

        return {
            ...apiItem,
            name: staticData.name || "Unknown",
            party: staticData.shortName || "No Party",
            color: staticData.icon  || '#cbd5e1',
            image: staticData.img,
        };
    });

        mappedParties.push({
        candidateID: "NO_VOTE",
        tag: "N/A",
        votes: noVoteCount, // ใช้ค่า noVote จาก API
        name: "ไม่ประสงค์ลงคะแนน",
        party: "",
        color: "#94a3b8", // สีเทาสำหรับ No Vote
        img: "" // ใส่ไอคอนเฉพาะ (ถ้ามี)
    });

    // คำนวณยอดรวม: คะแนนผู้สมัครทุกคนรวมกัน + คะแนน No Vote
    const totalVotes = candidates.reduce((sum, p) => sum + (p.votes || 0), 0) + noVoteCount;
    
    const turnoutPercentage = allStudents > 0 ? (totalVotes / allStudents) * 100 : 0;

    return (
        <div className=" bg-slate-50">
        {isElectionDay ? (
            <div className=" pt-40 pb-40 animate-fade-up  w-full h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
                <div className="w-full max-w-2xl bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                    
                    {/* Header */}
                    <div className="text-center mb-12">
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 inline-block">
                            ผลการนับคะเเนนอย่างไม่เป็นทางการ
                        </span>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-2">ผลการนับคะเเนน</h2>
                        <p className="text-slate-400 font-medium">การเลือกตั้งคณะกรรมการสภานักเรียนโรงเรียนนารีรัตน์จังหวัดเเพร่</p>
                    </div>

                    {/* Progress Bar เส้นเดียวแบ่งสัดส่วน */}
                    <div className="relative mb-16 px-2">
                        <style>
                        {`
                            @keyframes shimmer {
                                0% { background-position: -1000px 0; }
                                100% { background-position: 1000px 0; }
                            }
                            .progress-item {
                                animation: shimmer 3s ;
                                background-size: 1000px 100%;
                            }
                        `}
                        </style>
                        <div className="w-full h-10 rounded-2xl flex shadow-inner p-1 gap-1">
                            {mappedParties?.sort((a,b) => b.votes - a.votes).map((p) => {
                                const voteShare = totalVotes > 0 ? (p.votes / totalVotes) * 100 : 0;
                                if (voteShare === 0) return null;
                                return (
                                    <div
                                        key={p.tag}
                                        style={{ 
                                            width: `${voteShare}%`, 
                                            backgroundColor: p.color || '#cbd5e1',
                                            backgroundImage: `linear-gradient(90deg, ${p.color || '#cbd5e1'}, rgba(255,255,255,0.3), ${p.color || '#cbd5e1'})`
                                        }}
                                        className="progress-item rounded-md h-full first:rounded-l-xl last:rounded-r-xl transition-all duration-1000 ease-out hover:brightness-110 cursor-help relative group"
                                    >
                                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">
                                            {p.name}: {p.votes} คะแนน ({voteShare.toFixed(1)}%)
                                        </div>
                                        {voteShare > 15 && (
                                            <div className="flex items-center justify-left pl-2 h-full">
                                                <span className="text-white font-black text-xs md:text-sm drop-shadow-sm">
                                                    <AnimatedCounter finalValue={voteShare} duration={1500} /> %
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="absolute -bottom-5 w-full flex justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                        
                        
                    </div>

                    <div className="text-left mb-2 pl-2">
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight">นับเเล้ว (อย่างไม่เป็นทางการ)</h2>
                    </div>
                    <div className="pl-2 flex justify-between items-end mb-2 px-1">
                        <div className="text-left">
                            <p>นับเเล้ว <span className="text-xl font-semibold">{totalVotes.toLocaleString()}</span></p>
                        </div>
                        <div className="text-left">
                            <p><span className="text-xl font-bold"><AnimatedCounter finalValue={turnoutPercentage} duration={1500} /></span> % </p>
                        </div>
                    </div>
                    <div className="relative mb-16 px-2">
                        <style>
                        {`
                            @keyframes shimmer {
                                0% { background-position: -1000px 0; }
                                100% { background-position: 1000px 0; }
                            }
                            .progress-item {
                                animation: shimmer 3s  linear;
                                background-size: 1000px 100%;
                            }
                        `}
                        </style>
                        
                        {/* Background Bar (คนที่ยังไม่ได้โหวตทั้งหมด) */}
                        <div className="w-full h-10 bg-slate-100 rounded-2xl flex shadow-inner p-1 gap-1 border border-slate-200">
                            <div
                                style={{ 
                                    // ใช้ turnoutPercentage เพื่อแสดงว่ามาโหวตแล้วกี่ % จากนักเรียนทั้งหมด
                                    width: `${turnoutPercentage}%`, 
                                    backgroundColor: '#2563eb', // เปลี่ยนเป็นสีน้ำเงินให้ดูเด่น
                                    backgroundImage: `linear-gradient(90deg, #2563eb, rgba(255,255,255,0.3), #2563eb)`
                                }}
                                className="progress-item rounded-xl h-full transition-all duration-1000 ease-out hover:brightness-110 cursor-help relative group shadow-md"
                            >
                                {/* Tooltip แสดงจำนวนคนโหวตจริง */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">
                                    นับเเล้ว {totalVotes.toLocaleString()} 
                                </div>

                                {/* แสดง % ตรงกลางแท่งถ้าพื้นที่กว้างพอ */}
                                {turnoutPercentage > 10 && (
                                    <div className="flex items-center justify-center h-full">
                                        <span className="text-white font-black text-xs drop-shadow-sm">
                                            <AnimatedCounter finalValue={turnoutPercentage} duration={1500} /> %
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            {/* พื้นที่สีเทาที่เหลือในแท่ง จะแสดงสัดส่วนคนที่ยังไม่มาโหวตโดยอัตโนมัติ */}
                        </div>
                        
                        {/* สเกลเปอร์เซ็นต์ด้านล่าง */}
                        <div className="absolute -bottom-5 w-full flex justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {mappedParties?.map((p) => {
                            return (
                                <div key={p.tag} className=" flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    {p.candidateID !== "NO_VOTE" && (
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-full border-2 p-0.5" style={{ borderColor: `${p.color}40` }}>
                                                <img src={p.image} alt={p.name} className="w-full h-full rounded-full object-cover bg-white" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg" style={{ backgroundColor: p.color }}>
                                                {p.tag ? p.tag[1] : '?'}
                                            </div>
                                        </div>
                                    )}
                                    <div className="text-left grid">
                                        <span className="text-2xl font-black tracking-tighter" style={{ color: p.color }}>
                                            {p.name}
                                        </span>
                                        <span className="text-2xl font-black tracking-tighter" style={{ color: p.color }}>
                                            <p> <span className="font-bold"> {p.votes} </span> <span className="pl-1"> คะเเนน </span> </p>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        ) : (
            <div className="gap-2 animate-fade-up min-h-screen flex flex-col items-center pt-20 pb-32 bg-[#F8FAFC] text-center px-6 w-full">
                <div className="relative mb-2">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto relative z-10">
                        <Lock className="w-10 h-10 text-blue-600 animate-bounce"/>
                    </div>
                    <div className="absolute inset-0 bg-blue-200 blur-2xl opacity-30 rounded-full scale-110"></div>
                </div>

                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-blue-950 tracking-tight">ระบบปิดอยู่</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Election Day is coming</p>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-white shadow-lg">
                    <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                        <Timer className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">นับถอยหลังสู่การเลือกตั้ง</span>
                    </div>
                    <div className="text-lg font-black text-blue-900 tabular-nums">
                        {timeLeft || "กำลังคำนวณ..."}
                    </div>
                    <p className="mt-3 text-slate-500 text-xs leading-relaxed px-2">
                        ท่านจะสามารถเข้าถึงหน้านี้ได้เพื่อดูคะแนนเมื่อถึงเวลาที่กำหนดเท่านั้น
                    </p>
                </div>
            </div>
        )}
    </div>
)};