import { HomeIcon, Layers, Vote } from 'lucide-react'
import '../app.css'

export default function navigation_bar( {
    page,
    navigateTo
}) {
  return (
    <>
      <nav
        id="main-nav"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm glass-header border border-white/60 shadow-2xl shadow-blue-900/10 rounded-4xl px-8 py-4 flex justify-between items-center z-50 transition-all duration-300 backdrop-blur-md bg-white/80"
      >
        <button
          onClick={() => navigateTo('home')}
          id="nav-home"
          className={`nav-item flex flex-col items-center gap-1 ${
            page === 'home' ? 'text-blue-600' : 'text-slate-400'
          } hover:text-blue-600`}
        >
          {/* <HomeIcon className="w-6 h-6" /> */}
          <HomeIcon className="w-6 h-6 hover:cursor-pointer" />
          <span className="text-[10px] font-bold uppercase tracking-tighter ">
            หน้าหลัก
          </span>
          <div className="nav-indicator bg-blue-600 w-1 h-1 rounded-full mt-1"></div>
        </button>

        
        <button
          onClick={() => navigateTo('parties')}
          id="nav-parties"
          className={`nav-item flex flex-col items-center gap-1 ${
            page === 'parties' || page === 'profile'? 'text-blue-600' : 'text-slate-400'
          } hover:text-blue-600`}
        >
          {/* <Layers className="w-6 h-6" /> */}
          <Layers className="w-6 h-6 hover:cursor-pointer" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            พรรค
          </span>
          <div className="nav-indicator w-1 h-1 rounded-full mt-1"></div>
        </button>

        <button
          onClick={() => navigateTo('vote')}
          id="nav-vote"
          className={`nav-item flex flex-col items-center gap-1 ${
            page === 'vote' ? 'text-blue-600' : 'text-slate-400'
          } hover:text-blue-600`}
        >
          {/* <Vote className="w-6 h-6" /> */}
          <Vote className="w-6 h-6 hover:cursor-pointer" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            Vote
          </span>
          <div className="nav-indicator w-1 h-1 rounded-full mt-1"></div>
        </button>
      </nav>
    </>
  )
}