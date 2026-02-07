import { formatDate } from "../utils/formatDate";
import { MoveUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PARTIES } from "../data/parties";

export default function Parties({ parties = PARTIES }) { 
    const navigate = useNavigate();

    return (
        <div className="animate-fade-up pb-28 min-h-screen relative max-w-xl mx-auto px-6 pt-8 space-y-4">
            <div>
                <h2 className="text-3xl font-black text-blue-950 tracking-tight">พรรคทั้งหมด</h2>
                <p className="text-slate-400 font-medium">วันที่ {formatDate(new Date())}</p>
            </div>

            <div className="flex flex-col gap-4">
                {parties.map((party) => (
                    <div 
                        key={party.id} 
                        className="rounded-xl group relative bg-white p-4 md:p-6 rounded-2rem border border-blue-50 flex items-center gap-4 md:gap-5 cursor-pointer hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300" 
                        onClick={() => navigate(`/profile/${party.id}`)}
                    >
                        <div 
                            className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105 shrink-0 overflow-hidden" 
                            style={{ border: `4px solid ${party.icon || '#f1f5f9'}` }}
                        >
                            <img src={party.img} className="w-full h-full object-cover" alt={party.name} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-extrabold text-blue-950 text-base md:text-lg mb-0.5 truncate">
                                {party.name}
                            </h3>
                            <p className="text-blue-600 text-[10px] md:text-[11px] font-black uppercase tracking-[2px] mb-1 truncate">
                                {party.shortName}
                            </p>
                            <p className="text-slate-400 text-xs font-medium line-clamp-1">
                                {party.bio}
                            </p>
                        </div>

                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-300 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                            <MoveUp className="w-4 h-4 md:w-5 md:h-5 rotate-45" /> 
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}