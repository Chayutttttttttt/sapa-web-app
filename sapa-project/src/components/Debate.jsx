import { useState,useEffect } from "react";
import { doc,addDoc } from "firebase/firestore";
import { useAuth } from "./Context";

export default function Debate() {
    const { user } = useAuth()
    const [choseDebateParty,setChoseDebateParty] = useState('');
    const [isVote,setIsVote] = useState(false);
    
    const cards = [
        {
            id:'p1',
            name:'พรรคประชานารี',
            color:'#FF00FF',
            img:'https://i.postimg.cc/Bn3r6mLH/debate_p1.png'
        },
        {
            id:'p2',
            color:'#FF6400',
            name:'Gorgeous radiant Nareerat',
            img:'https://i.postimg.cc/FHvMRTdc/debate_p2.png'
        },
        {
            id:'p3',
            color:'#097969',
            name:'NR NEXT GEN',
            img:'https://i.postimg.cc/dVFb15kG/debate_p3.png'
        }
    ]
    
    return (
        <div className='transition-all' style={{backgroundColor: choseDebateParty && `${choseDebateParty.color}20`}}>
            <div className='animate-fade-up pb-25 min-h-screen relative max-w-xl mx-auto px-6 pt-8 '>
                <h2 className="text-center font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-slate-900 to-slate-700 md:text-3xl text-xl mb-4">
                    คุณชอบการ DEBATE <span className="text-blue-600">ของพรรคไหน?</span>
                </h2>
                {cards.map((p) => {
                    return (
                        <div key={p.id} className="w-full flex flex-col justify-center items-center">
                            <img 
                                src={p.img} 
                                onClick={() => setChoseDebateParty(p)} 
                                className={`transition-all hover:cursor-pointer hover:scale-105 ${
                                    choseDebateParty.id === p.id ? 'w-100' : 'grayscale w-90'
                                }`} 
                                alt={p.name} 
                            />
                            <p className="text-xl font-black pb-1">{p.name}</p>
                        </div>
                    )
                })}
            </div>
        </div>
        
    )
};