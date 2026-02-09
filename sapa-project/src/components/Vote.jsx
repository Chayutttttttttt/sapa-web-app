import { Lock, Timer, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "./Context";
import { useNavigate } from "react-router-dom";
import '../app.css';

export default function Vote() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [isElectionDay, setIsElectionDay] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");

    const electionDate = new Date('2026-02-20T16:20:10+07:00');

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
        <div className='animate-fade-up min-h-screen flex flex-col items-center pt-20 pb-32 bg-[#F8FAFC] text-center px-6'>
        {isElectionDay ? (
            <div className="w-full max-w-sm space-y-4">
                <div className="bg-white p-6 rounded-[2.5rem] border border-green-100 shadow-xl">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-green-600 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-1">เริ่มการรายงานผล</h2>
                    <p className="text-slate-400 text-sm font-medium">ขณะนี้ระบบกำลังแสดงผลคะแนนสด</p>
                    
                    <div className="mt-6 p-8 border-2 border-dashed border-slate-100 rounded-3xl text-slate-300 font-bold text-sm">
                        กำลังโหลดผลคะแนนล่าสุด...
                    </div>
                </div>
            </div>
        ) : (
            <div className="w-full max-w-sm space-y-6">
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
                        ท่านจะสามารถเข้าถึงหน้านี้ได้เพื่อดูคะแนนแบบเรียลไทม์เมื่อถึงเวลาที่กำหนดเท่านั้น
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