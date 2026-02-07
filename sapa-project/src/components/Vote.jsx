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
        <div className='animate-fade-up min-h-[80vh] flex flex-col items-center justify-center text-center px-6'>
            {isElectionDay ? (
                <div className="w-full max-w-md space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-green-100 shadow-2xl shadow-green-900/5">
                        <div className="w-20 h-20 bg-green-50 rounded-4xl flex items-center justify-center mx-auto mb-6">
                            <BarChart3 className="w-10 h-10 text-green-600 animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mb-2">เริ่มการรายงานผล</h2>
                        <p className="text-slate-400 font-medium">ขณะนี้ระบบกำลังแสดงผลคะแนนสด</p>
                        
                        <div className="mt-8 p-10 border-2 border-dashed border-slate-100 rounded-3xl text-slate-300 font-bold">
                            กำลังโหลดผลคะแนนล่าสุด...
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="relative">
                        <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-900/10 mx-auto relative z-10">
                            <Lock className="w-12 h-12 text-blue-600 animate-bounce"/>
                        </div>
                        <div className="absolute inset-0 bg-blue-200 blur-3xl opacity-20 rounded-full scale-150"></div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-4xl font-black text-blue-950 tracking-tight">ระบบปิดอยู่</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Election Day is coming</p>
                    </div>

                    <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white shadow-xl max-w-sm mx-auto">
                        <div className="flex items-center justify-center gap-2 text-blue-600 mb-3">
                            <Timer className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-wider">นับถอยหลังสู่การเลือกตั้ง</span>
                        </div>
                        <div className="text-xl font-black text-blue-900 tabular-nums">
                            {timeLeft || "กำลังคำนวณ..."}
                        </div>
                        <p className="mt-4 text-slate-500 text-sm leading-relaxed px-4">
                            ท่านจะสามารถเข้าถึงหน้านี้ได้เพื่อดูคะแนนแบบเรียลไทม์เมื่อถึงเวลาที่กำหนดเท่านั้น
                        </p>
                    </div>

                    {!user && (
                        <button 
                            onClick={() => navigate('/login')}
                            className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline cursor-pointer"
                        >
                            เข้าสู่ระบบเพื่อเตรียมพร้อม &rarr;
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}