import { useState,useEffect } from "react";
import { db } from "../../data/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { formatDate } from "../../utils/formatDate";

export default function PartyPosts({party,PARTIES,navigateTo,openPost}) {
    const currentParty = PARTIES.find(p => p.id === party.UID);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const postsQuery = query(
            collection(db, "posts"),
            where("partyID", "==", party.UID),
            orderBy("date", "desc")
        );
        const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
            const postsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPosts(postsData);
            
        }, (error) => {
            console.error("Error listening to party posts: ", error);
        });

        return () => unsubscribe();
        
    }, [party.UID]);

    return (
        <div className="p-6 animate-fade-up h-[70vh] flex flex-col items-center justify-center px-6">
            <h1 className="text-center text-3xl mb-6 font-light"> โพสต์ทั้งหมดของพรรค {currentParty.name}</h1>
            {posts.length === 0 ? (
                <p>ยังไม่มีโพสต์สำหรับพรรคนี้</p>
            ) : (
                <div className="space-y-4 animate-fade-up">
                    {posts.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => openPost(p.id,true)}
                            className="hover:-translate-y-1 transition-all cursor-pointer mt-4 p-5 w-80 md:w-100 bg-white rounded-3xl border border-blue-50 shadow-xs "
                        >
                            <div>
                                <p className="text-xs text-slate-400">
                                    {formatDate(p.date?.toDate ? p.date.toDate() : p.date)}
                                </p>
                                <h4 className="font-bold text-gray-600 leading-relaxed mb-3">
                                {p.content}
                                </h4>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-6">
                <button onClick={() => navigateTo('partyHome', party)} className="bg-gray-300 text-black px-4 py-2 rounded-lg cursor-pointer  hover:bg-gray-400 transition">
                    ย้อนกลับ
                </button>
            </div>
        </div>
    );
}