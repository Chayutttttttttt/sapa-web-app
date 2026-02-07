import { useState, useEffect } from "react";
import { auth, db } from "../data/firebase.js";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // 1. นำเข้า useNavigate
import { FaGoogle } from "react-icons/fa";
import { IoLogIn, IoLogOut } from "react-icons/io5";
import { doc, setDoc, query, where, limit, getDocs, collection } from "firebase/firestore";
import { useAuth } from "./Context.jsx";
import Swal from "sweetalert2";
import { VoteIcon } from "lucide-react";

export function Login() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const provider = new GoogleAuthProvider();
    const [clickAgain, setClickAgain] = useState(false);
    const cooldownTime = 5000;

    useEffect(() => {
        if (clickAgain) {
            const timer = setTimeout(() => setClickAgain(false), cooldownTime);
            return () => clearTimeout(timer);
        }
    }, [clickAgain]);
    
    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const loginUser = result.user;

            const userRef = doc(db, "accounts", loginUser.uid);
            await setDoc(userRef, { 
                UID: loginUser.uid,
                name: loginUser.displayName,
                email: loginUser.email,
                displayImg: loginUser.photoURL,
                tag: 'user'
            }, { merge: true });


            const userLikesRef = doc(db, "accounts", loginUser.uid, "likePosts", "init");
            await setDoc(userLikesRef, { initialized: true }, { merge: true });

            navigate('/');
        } catch (error) {
            console.error("Error during sign-in: ", error);
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            localStorage.removeItem('isPartyLoggedIn');
            localStorage.removeItem('partyData');
            navigate('/');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <div className="animate-fade-up min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
            {user ? (
                <div className="space-y-4">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <img src={user?.photoURL} referrerPolicy="no-referrer" className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-blue-50" alt="profile" />
                        <h2 className="text-xl font-bold text-slate-800">สวัสดี, {user.displayName}</h2>
                        <p className="text-slate-400">คุณเข้าสู่ระบบเรียบร้อยแล้ว</p>
                    </div>
                    
                    {!clickAgain ? (
                        <button onClick={() => setClickAgain(true)} className="hover:cursor-pointer w-full bg-red-50 text-red-600 px-6 py-3 rounded-2xl flex items-center justify-center hover:bg-red-100 transition-all font-bold">
                            <IoLogOut className="mr-2 w-5 h-5" /> ออกจากระบบ
                        </button>
                    ) : (
                        <button onClick={handleLogout} className="hover:cursor-pointer w-full bg-red-600 text-white px-6 py-3 rounded-2xl flex items-center justify-center hover:bg-red-700 transition-all font-bold animate-pulse">
                            คลิกอีกครั้งเพื่อยืนยัน
                        </button>
                    )}
                </div>
            ) : (
                <div className="max-w-md w-full space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-blue-950">ยินดีต้อนรับ</h2>
                        <p className="text-slate-400">เข้าสู่ระบบเพื่อร่วมแสดงความคิดเห็นและกดถูกใจ</p>
                    </div>

                    <div className="grid gap-3">
                        <button onClick={handleGoogleSignIn} className="w-full hover:cursor-pointer bg-white border border-slate-200 text-slate-700 px-6 py-4 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all font-bold shadow-sm">
                            <FaGoogle className="mr-3 w-5 h-5" /> Login with Google
                        </button>
                        
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 px-2 text-slate-400 font-bold">หรือสำหรับพรรค</span></div>
                        </div>

                        <button onClick={() => navigate('/partyLogin')} className="  hover:cursor-pointer w-full bg-blue-950 text-white px-6 py-4 rounded-2xl flex items-center justify-center hover:bg-blue-900 transition-all font-bold shadow-lg shadow-blue-100">
                            <VoteIcon className="mr-3 w-5 h-5" /> เข้าสู่ระบบสำหรับพรรค
                        </button>
                    </div>
                </div>
            )}
            
            <button onClick={() => navigate('/')} className=" hover:cursor-pointer mt-8 text-slate-400 font-bold flex items-center hover:text-blue-600 transition-colors">
                <IoLogIn className="mr-2" /> กลับไปหน้าหลัก
            </button>
        </div>
    );
}

export function PartyLogin() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const loggedIn = localStorage.getItem('isPartyLoggedIn');
        const party = JSON.parse(localStorage.getItem('partyData'));
        if (loggedIn && party) {
            navigate(`/partyAdmin/${party.UID}`);
        }
    }, [navigate]);

    const handlePartyLogin = async () => {
        if (!name || !password) {
            Swal.fire({ title: 'Error', text: 'กรุณากรอกข้อมูลให้ครบถ้วน', icon: 'error' });
            return;
        };

        try {
            const partiesRef = collection(db, "parties");
            const q = query(partiesRef, where("name", "==", name), where("password", "==", password), limit(1));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const party = querySnapshot.docs[0].data();
                const partyId = querySnapshot.docs[0].id;
                localStorage.setItem('isPartyLoggedIn', 'true');
                localStorage.setItem('partyData', JSON.stringify({ ...party, id: partyId }));

                Swal.fire({
                    title: 'สำเร็จ!',
                    text: `ยินดีต้อนรับพรรค ${party.name}`,
                    icon: 'success',
                    confirmButtonColor: '#1e3a8a',
                }).then(() => {
                    navigate(`/partyAdmin/${partyId}`);
                });
            } else {
                Swal.fire({ title: 'Error', text: 'ชื่อพรรคหรือรหัสผ่านไม่ถูกต้อง', icon: 'error' });
            }
        } catch (error) {
            console.error("Party login error: ", error);
        }
    };

    return (
        <div className="animate-fade-up min-h-[90vh] flex flex-col items-center justify-center px-6">
            <div className="max-w-md w-full bg-white p-8 rounded-4xl shadow-xl border border-blue-50">
                <div className="mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <VoteIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">Party Login</h2>
                    <p className="text-slate-400 text-sm">เฉพาะคณะกรรมการพรรคที่ได้รับอนุญาต</p>
                </div>

                <div className="space-y-4">
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="ชื่อพรรค" 
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    />
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="รหัสผ่าน" 
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    />
                    
                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <button onClick={() => navigate('/login')} className="hover:cursor-pointer bg-slate-100 text-slate-600 px-4 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                            ยกเลิก
                        </button>
                        <button onClick={handlePartyLogin} className="hover:cursor-pointer bg-blue-900 text-white px-4 py-4 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-100">
                            เข้าสู่ระบบ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}