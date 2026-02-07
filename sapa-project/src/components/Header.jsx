import { useAuth } from "./Context.jsx";
import { UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Login } from "./Login.jsx";

export default function Header() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-50 glass-header border-b border-blue-100 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md">
            <div
                onClick={() => navigate('/')} 
                className="flex items-center gap-3 cursor-pointer group"
            >
                <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center shadow-xl shadow-blue-200 transition-transform group-active:scale-90">
                    <img
                        src="https://i.postimg.cc/qRDgw6yg/sapa.png"
                        className="text-white w-10 h-10 object-contain"
                        alt="NR Logo"
                    />
                </div>
                <div>
                    <h1 className="text-[16px] font-extrabold leading-none tracking-tight text-blue-950 md:text-[20px] lg:text-xl">
                        คณะกรรมการ<span className="text-blue-500">สภานักเรียน</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
                        โรงเรียนนารีรัตน์จังหวัดแพร่
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3" onClick={() => navigate('/login')}>
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 relative overflow-hidden transition-all hover:ring-2 hover:ring-blue-200 cursor-pointer">
                    {!loading && (
                        user ? (
                            <img 
                                src={user.photoURL} 
                                referrerPolicy="no-referrer"
                                alt="User Avatar" 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = "https://www.w3schools.com/howto/img_avatar.png" }}
                            />
                        ) : (
                            <UserRound className="w-5 h-5"/>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}