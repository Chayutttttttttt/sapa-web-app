import { HomeIcon, Layers, Vote,ArchiveRestore , LibraryBig,School,Gamepad2,MonitorPlay} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../app.css';

export default function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      id="main-nav"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%]  max-w-sm glass-header border border-white/60 shadow-2xl shadow-blue-900/10 rounded-4xl px-8 py-4 flex justify-between items-center z-50 transition-all duration-300 backdrop-blur-md bg-white/80"
    >

      <button
        onClick={() => navigate('/')}
        className={`nav-item flex flex-col items-center gap-1 transition-colors ${
          isActive('/') ? 'text-blue-600' : 'text-slate-400'
        } hover:text-blue-600 cursor-pointer`}
      >
        <HomeIcon className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">
          หน้าหลัก
        </span>
        <div className={`w-1 h-1 rounded-full mt-1 transition-opacity ${
          isActive('/') ? 'bg-blue-600 opacity-100' : 'opacity-0'
        }`}></div>
      </button>

      <button
        onClick={() => navigate('/learn')}
        className={`nav-item flex flex-col items-center gap-1 transition-colors ${
          isActive('/learn') ? 'text-blue-600' : 'text-slate-400'
        } hover:text-blue-600 cursor-pointer`}
      >
        <LibraryBig className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">
          ห้องเรียนรู้
        </span>
        <div className={`w-1 h-1 rounded-full mt-1 transition-opacity ${
            isActive('/learn') ? 'bg-blue-600 opacity-100' : 'opacity-0'
          }`}>
        </div>
      </button>

      <button
        onClick={() => window.location.href = "https://my-mooc-app.web.app/"}
        className={`text-slate-400 nav-item flex flex-col items-center gap-1 transition-colors hover:text-blue-600 cursor-pointer`}
      >
        <MonitorPlay className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">
          NRDD MOOC
        </span>
        <div className={`w-1 h-1 rounded-full mt-1 transition-opacity`}>
        </div>
      </button>
      
      <button
        onClick={() => navigate('/school')}
        className={`nav-item flex flex-col items-center gap-1 transition-colors ${
          isActive('/school') ? 'text-blue-600' : 'text-slate-400'
        } hover:text-blue-600 cursor-pointer`}
      >
        <Vote className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">
          NR eVote
        </span>
        <div className={`w-1 h-1 rounded-full mt-1 transition-opacity ${
          isActive('/school') ? 'bg-blue-600 opacity-100' : 'opacity-0'
        }`}></div>
      </button>
      
      <button
        onClick={() => window.location.href = "https://www.roblox.com/games/71496120037979/NRDD-map?gameSetTypeId=100000003&homePageSessionInfo=8669509c-4f10-4e23-becd-fa4c6e3186d1&isAd=false&numberOfLoadedTiles=186&page=homePage&placeId=71496120037979&playContext=homePage&position=0&positionInRow=0&rowOnPage=1&sortPos=1&sortSubId=&universeId=10133533159"}
        className={`text-slate-400 nav-item flex flex-col items-center gap-1 transition-color hover:text-blue-600 cursor-pointer`}
      >
        <Gamepad2 className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-tighter ">
          NRDD MAP
        </span>
        <div className={`w-1 h-1 rounded-full mt-1 transition-opacity`}>
        </div>
      </button>

      {/* <button
        onClick={() => navigate('/school/parties')}
        className={`nav-item flex flex-col items-center gap-1 transition-colors ${
          isActive('/parties') || isActive('/profile') ? 'text-blue-600' : 'text-slate-400'
        } hover:text-blue-600 cursor-pointer`}
      >
        <Layers className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">
          พรรค
        </span>
        <div className={`w-1 h-1 rounded-full mt-1 transition-opacity ${
          isActive('/school/parties') || isActive('/profile') ? 'bg-blue-600 opacity-100' : 'opacity-0'
        }`}></div>
      </button> */}

      {/* <button
        onClick={() => navigate('/school/vote')}
        className={`nav-item flex flex-col items-center gap-1 transition-colors ${
          isActive('/school/vote') ? 'text-blue-600' : 'text-slate-400'
        } hover:text-blue-600 cursor-pointer`}
      >
        <Vote className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">
          ผลการเลือกตั้ง
        </span>
        <div className={`w-1 h-1 rounded-full mt-1 transition-opacity ${
          isActive('/school/vote') ? 'bg-blue-600 opacity-100' : 'opacity-0'
        }`}></div>
      </button> */}

      {/* <button
        onClick={() => navigate('/debate')}
        className={`nav-item flex flex-col items-center gap-1 transition-colors ${
          isActive('/debate') ? 'text-blue-600' : 'text-slate-400'
        } hover:text-blue-600 cursor-pointer`}
      >
        <ArchiveRestore className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">
          โหวต
        </span>
        <div className={`w-1 h-1 rounded-full mt-1 transition-opacity ${
          isActive('/debate') ? 'bg-blue-600 opacity-100' : 'opacity-0'
        }`}></div>
      </button> */}

      
    </nav>
  );
}