import { Lock, Timer, BarChart3,Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "./Context";
import { useNavigate } from "react-router-dom";
import '../app.css';

export default function Vote() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [isElectionDay, setIsElectionDay] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    const students = 2945;

    const [parties, setParties] = useState([
        {
            id: "p1",
            name: "test_party_name_1",
            shortName: "PARTY 1",
            color: "#ec4899",
            votes: 1200,
        },
        {
            id: "p2",
            name: "test_party_name_2",
            shortName: "PARTY 2",
            color: "#f97316",
            votes: 500,
        },
        {
            id: "p3",
            name: "test_party_name_3",
            shortName: "PARTY 3",
            color: "#10b981",
            votes: 1100,
        },
    ]);

    const [maxVotes, setMaxVotes] = useState(0);

    useEffect(() => {
        const currentMax = Math.max(...parties.map((p) => p.votes || 0), 1);
        setMaxVotes(currentMax);
    }, [parties]);

    const electionDate = new Date('2026-02-20T16:30:10+07:00');

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

    

    if (loading) return null;

    return (
        <div>
        {isElectionDay ? (
            <div className="w-full h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
                <div className="w-full max-w-4xl bg-white p-8 rounded-[2.5rem] border border-green-100 shadow-xl overflow-hidden">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-slate-800 mb-1">ผลการเลือกตั้งสภานักเรียน อย่างไม่เป็นทางการ</h2>
                        <p className="text-slate-400 text-sm font-medium">โรงเรียนนารีรัตน์จังหวัดเเพร่</p>
                    </div>

                    <div className="flex items-end justify-center gap-6 md:gap-16 w-full h-100 px-4 pb-8">
                    {parties.map((p, index) => {
                        const heightPercent = ((p.votes || 0) / maxVotes) * 80;
                        const safeHeight = Math.max(heightPercent, 25);

                        return (
                        <div
                            key={p.id}
                            className="group flex flex-col items-center justify-end w-1/3 max-w-37 h-full cursor-pointer transition-transform duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-10"
                            style={{ animationDelay: `${index * 200}ms`, animationFillMode: 'both' }}
                        >
                            <div className="relative w-full flex justify-center items-end h-full">
                                <div
                                    className="relative w-full md:w-32 rounded-t-2xl md:rounded-t-[2.5rem] z-0 flex flex-col items-center pt-6 shadow-lg border-t border-x border-white/30 transition-all duration-1000 ease-out group-hover:brightness-110"
                                    style={{
                                    height: `${safeHeight}%`,
                                    background: `linear-gradient(to top, ${p.color}40, ${p.color})`,
                                    }}
                                >
                                    <span className="text-xl md:text-4xl font-black text-white drop-shadow-md mt-2 transition-all duration-1000">
                                    {p.votes.toLocaleString()}
                                    </span>
                                </div>

                                <div className="absolute -bottom-4 z-20 transition-transform duration-500 transform group-hover:-translate-y-2">
                                    <div
                                    className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden"
                                    style={{ outline: `2px solid ${p.color}20` }}
                                    >
                                    <span className="font-black text-2xl md:text-4xl" style={{ color: p.color }}>
                                        {p.shortName[0]}
                                    </span>
                                    </div>
                                </div>
                            </div>

                            <div className="z-30 mt-10 text-center">
                                <h3 className="font-black text-slate-800 text-base md:text-xl leading-none mb-1">
                                    {p.shortName}
                                </h3>
                                <div
                                    className="inline-block text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full shadow-sm"
                                    style={{ backgroundColor: p.color }}
                                >
                                    เบอร์ {p.id.replace("p", "")}
                                </div>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                </div>
                <div>


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

                {!user && (
                    <button 
                        onClick={() => navigate('/login')}
                        className="mt-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline cursor-pointer transition-all"
                    >
                        เข้าสู่ระบบเพื่อเตรียมพร้อม &rarr;
                    </button>
                )}
            </div>
        )}
    </div>
)};