import { useAuth } from "./Context.jsx";
import { UserRound } from "lucide-react";

export default function Header({
    navigateTo
}) {
    const { user } = useAuth();
    // console.log("photoURL:", user ? user.photoURL : "No user logged in");
    return (
        <>  
            <header className="sticky top-0 z-50 glass-header border-b border-blue-100 px-6 py-4 flex items-center justify-between">
                <div
                    onClick={() => navigateTo('home')}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center shadow-xl shadow-blue-200 transition-transform group-active:scale-90">
                    <img
                        src="./img/logoSAPA.png"
                        className="text-white w-10 h-10"
                        alt="NR Logo"
                    />
                    </div>
                    <div>
                    <h1 className="text-[16px] font-extrabold leading-none tracking-tight text-blue-950 md:text-[20px] lg:text-xl">
                        คณะกรรมการ<span className="text-blue-500">สภานักเรียน</span>
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                        โรงเรียนนารีรัตน์จังหวัดแพร่
                    </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 hover:cursor-pointer" onClick={() => navigateTo('login')}>
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 relative overflow-hidden">
                    {/* <i data-lucide="user" className="w-5 h-5"></i> */}
                    {user ? (
                        <img src={user.photoURL} alt="User Avatar" className="w-full h-full object-cover"/>
                    ) : (<UserRound className="w-5 h-5"/>)}
                    </div>
                </div>
            </header>
        </>
    )
}