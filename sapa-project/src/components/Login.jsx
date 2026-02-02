import { useState,useEffect, use } from "react";
import { auth } from "../data/firebase.js"
import { GoogleAuthProvider,signInWithPopup } from "firebase/auth";
import { FaGoogle } from "react-icons/fa";
import { IoLogIn,IoLogOut } from "react-icons/io5";
import { db } from "../data/firebase.js";
import { doc, setDoc, query, where, limit, getDocs, collection } from "firebase/firestore";
import { useAuth} from "./Context.jsx";
import Vote from "./Vote.jsx";
import Swal from "sweetalert2";
import { VoteIcon } from "lucide-react";

const Logout = async (navigateTo) => {
    try {
        await auth.signOut();
        navigateTo('home');
        console.log("User signed out successfully");
    } catch (error) {
        console.error("Error during sign-out: ", error);
    }
};

export function Login({navigateTo, setForParty}) {
    const { user } = useAuth();
    const provider = new GoogleAuthProvider();
    const [clickAgain, setClickAgain] = useState(false);
    const cooldownTime = 5000;
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setClickAgain(false);
        }, cooldownTime);

        return () => clearTimeout(timer);
    }, [clickAgain]);

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const loginUser = result.user;

            const userRef = doc(db, "accounts",loginUser.uid);

            await setDoc(userRef, { 
                UID: loginUser.uid,
                name: loginUser.displayName,
                email: loginUser.email,
                displayImg: loginUser.photoURL,
                tag: 'user'
            },{ merge: true });

            const userLikesRef = doc(db, "accounts", loginUser.uid, "likePosts","init");
            await setDoc(userLikesRef, { initialized: true }, { merge: true });

            console.log("User Info: ", loginUser);
            navigateTo('home');
        } catch (error) {
            console.error("Error during sign-in: ", error);
        }
    };

    return (
        <div className="animate-fade-up h-[70vh] flex flex-col items-center justify-center text-center px-6">
            {user ? (
                <div className="flex flex-col items-center justify-center">
                    <h2 className="">คุณเข้าสู่ระบบในชื่อ {user.displayName} เเล้ว กรุณากลับไปหน้าหลัก</h2>
                    {clickAgain === false ? (<button onClick={() => setClickAgain(true)} className="mt-4 bg-red-950 text-white px-4 py-2 rounded-md flex items-center hover:cursor-pointer hover:bg-red-900 transition">
                        <IoLogOut className="mr-2"  />  ออกจากระบบ
                    </button>) : (<button onClick={() => Logout(navigateTo)} className="mt-4 bg-red-950 text-white px-4 py-2 rounded-md flex items-center hover:cursor-pointer hover:bg-red-900 transition">
                        <IoLogOut className="mr-2"  />  คลิกอีกครั้งเพื่อออกจากระบบ
                    </button>)}
                </div>
            ) : (
                <div>
                    <h2>เข้าสู่ระบบด้วย Google หรือ เข้าสู่ระบบสำหรับพรรคการเลือกตั้ง</h2>
                    <div className="flex flex-col md:flex-row md:gap-2 items-center justify-center">
                        <button onClick={handleGoogleSignIn} className="mt-4 bg-indigo-950 text-white px-4 py-2 rounded-md flex items-center hover:cursor-pointer hover:bg-indigo-900 transition">
                            <FaGoogle className="mr-2" /> Login with Google
                        </button>
                        <button onClick={() => navigateTo('partyLogin')} className="mt-4 bg-sky-800 text-white px-4 py-2 rounded-md flex items-center hover:cursor-pointer hover:bg-sky-700 transition">
                            <VoteIcon className="mr-2" /> เข้าสู่ระบบสำหรับพรรค
                        </button>
                    </div>
                </div>
                
            )}
            <button onClick={() => navigateTo('home')} className="mt-4 bg-indigo-800 text-white px-4 py-2 rounded-md flex items-center hover:cursor-pointer hover:bg-indigo-700 transition">
                <IoLogIn className="mr-2" /> กลับไปหน้าหลัก
            </button>
        </div>
    )
}

export function PartyLogin({navigateTo}) {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const loggedIn = localStorage.getItem('isPartyLoggedIn');
        const party = JSON.parse(localStorage.getItem('partyData'));
        if (loggedIn && party) {
            navigateTo('partyHome', party);
        }
    }, [navigateTo]);

    const handlePartyLogin = async (name, password, navigateTo) => {
        if (!name || !password) {
            Swal.fire({
                title: 'Error',
                text: 'กรุณากรอกชื่อพรรคและรหัสผ่านให้ครบถ้วน',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#7c3aed',
            });
            return;
        };
        try {
            const partiesRef = collection(db, "parties");
            const q = query(partiesRef, where("name", "==", name), where("password", "==", password), limit(1));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const party = querySnapshot.docs[0].data();
                localStorage.setItem('isPartyLoggedIn', 'true');
                localStorage.setItem('partyData', JSON.stringify(party));
                Swal.fire({
                    title: 'Success',
                    text: 'เข้าสู่ระบบสำเร็จ',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#7c3aed',
                }).then(() => {
                    navigateTo('partyHome', party);
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'ชื่อพรรคหรือรหัสผ่านไม่ถูกต้อง',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#7c3aed',
                });
                return;
            }
        } catch (error) {
            console.error("Error during party login: ", error);
        }
    };

    return (
        <div className="animate-fade-up h-[70vh] flex flex-col items-center justify-center text-center px-6">
            {/* <h2 className="">หน้าการเข้าสู่ระบบสำหรับพรรคการเลือกตั้ง ยังอยู่ในระหว่างการพัฒนา โปรดรอการอัปเดตในอนาคต</h2> */}
            <h2 className="text-xl font-bold">เข้าสู่ระบบสำหรับพรรคการเลือกตั้ง</h2>
            <div className="mt-1 flex flex-col items-center justify-center">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อพรรค" className="mt-4 px-4 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="รหัสผ่าน" className="mt-4 px-4 py-2 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <div className="flex flex-row flex-2 gap-3">
                    <button onClick={() => handlePartyLogin(name, password, navigateTo)} className="mt-4 bg-sky-800 text-white px-4 py-2 rounded-md flex items-center hover:cursor-pointer hover:bg-sky-700 transition">
                        เข้าสู่ระบบ
                    </button>
                    <button onClick={() => navigateTo('login')} className="mt-4 bg-indigo-800 text-white px-4 py-2 rounded-md flex items-center hover:cursor-pointer hover:bg-indigo-700 transition">
                        กลับไปหน้าหลัก
                    </button>
                </div>
            </div>
        </div>
    )
}