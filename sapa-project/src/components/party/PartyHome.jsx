import { useState,useEffect } from "react";
import { db } from "../../data/firebase";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";

export default function PartyHome({party,PARTIES,navigateTo,setIsParty}) {
  const currentParty = PARTIES.find(p => p.id === party.UID);

  return (
    PARTIES.find(p => p.id === party.UID) && (
      <div className="animate-fade-up h-[70vh] flex flex-col items-center justify-center text-center px-6">
        <div>
          
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-xl">
          <h1>ยินดีต้อนรับสู่หน้าพรรค {currentParty.name}</h1>
          <button onClick={() => navigateTo('partyCreatePosts', party)} className="transition w-full mt-4 bg-blue-500 hover:bg-blue-700 cursor-pointer text-white font-bold py-2 px-4 rounded shadow-blue-500">
            สร้างโพสต์ใหม่
          </button>
          <button onClick={() => navigateTo('partyPosts', party)} className="transition w-full mt-4 bg-cyan-500 hover:bg-cyan-700 cursor-pointer text-white font-bold py-2 px-4 rounded shadow-cyan-500">
            โพสต์ทั้งหมด
          </button>
          <button onClick={() => { localStorage.removeItem('isPartyLoggedIn'); localStorage.removeItem('partyData'); setIsParty(false); navigateTo('home')}} className="transition mt-4 bg-red-800 hover:bg-red-700 cursor-pointer text-white font-bold py-2 px-4 rounded">
            ออกจากระบบ
          </button>
        </div>
        
      </div>
    )
  );
}