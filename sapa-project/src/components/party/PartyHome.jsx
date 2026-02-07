import { useEffect, useState } from "react";
import { useParams, useNavigate, replace } from "react-router-dom";
import { LayoutDashboard, PenLine, Bell, LogOut,Loader2 } from "lucide-react";

export default function PartyHome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partyData, setPartyData] = useState(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isPartyLoggedIn');
    const storedData = JSON.parse(localStorage.getItem('partyData') || '{}');

    if (isLoggedIn !== 'true' || !storedData.id || storedData.id !== id) {
      localStorage.removeItem('isPartyLoggedIn');
      localStorage.removeItem('partyData');
      
      navigate('/partyLogin', { replace: true });
      return;
    }

    setPartyData(storedData);
  }, [id, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isPartyLoggedIn');
    localStorage.removeItem('partyData');
    navigate('/');

  if (!partyData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  };
  return (
    <div className="animate-fade-up min-h-[90vh] flex flex-col items-center justify-center text-center px-6 ">
      <div className="w-75 md:w-200 rounded-2xl  bg-white border-b border-slate-200 px-6 py-8">

        <div className="bg-white p-6 rounded-xl shadow-xl shadow-blue-900/5 border border-blue-50 space-y-3">
          <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
            เมนูการใช้งาน
          </h3>
          
          <button 
            onClick={() => navigate(`/partyAdmin/${id}/create`)} 
            className="group w-full flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-200"
          >
            <div className="flex items-center gap-3">
              <PenLine className="w-5 h-5" />
              <span>สร้างโพสต์นโยบายใหม่</span>
            </div>
            <span className="opacity-50 group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <button 
            onClick={() => navigate(`/partyAdmin/${id}/posts`)} 
            className="group w-full flex items-center justify-between bg-white border-2 border-slate-100 hover:border-blue-200 text-slate-700 font-bold py-4 px-6 rounded-xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-blue-600" />
              <span>จัดการโพสต์ทั้งหมด</span>
            </div>
            <span className="text-slate-300 group-hover:translate-x-1 transition-transform">→</span>
          </button>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 px-6 rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              ออกจากระบบตัวแทนพรรค
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}