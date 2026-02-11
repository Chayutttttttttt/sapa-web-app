import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { serverTimestamp, collection, addDoc,doc,getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../data/firebase";
import { useParams, useNavigate } from "react-router-dom";
import { ImagePlus, X, Send, ChevronLeft, Loader2 } from "lucide-react";

export default function PartyCreatePosts({ PARTIES }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [party,setParty] = useState([]);

    useEffect(() => {
        if (!id) return;
        const fetchParty = async () => {
            try {
                const docRef = doc(db, "parties", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                setParty({ id: docSnap.id, ...docSnap.data() });
                } else {
                console.log("ไม่พบข้อมูลพรรคนี้ในระบบ");
                setParty(null);
                }
            } catch (error) {
                console.error("Error fetching party:", error);
            }
        };
        fetchParty();
    }, [id]);
    
    if (!party) return <div>กำลังโหลดข้อมูลพรรค...</div>;

    const currentParty = PARTIES.find(p => p.id === party.UID);
    const [content, setContent] = useState("");
    const [description, setDescription] = useState("");
    const [hasImage, setHasImage] = useState(false);
    const [imgFile, setImgFile] = useState(null);
    const [imgPreview, setImgPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImgFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImgPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        
        if (!content.trim() || !description.trim()) {
            Swal.fire({
                title: 'ข้อมูลไม่ครบ',
                text: 'กรุณากรอกหัวข้อและรายละเอียดโพสต์',
                icon: 'warning',
                confirmButtonColor: '#1e3a8a',
            });
            return;
        }

        setIsUploading(true);
        let imgURL = "";
        
        try {
            if (hasImage && imgFile) {
                const maxSize = 2 * 1024 * 1024; 
                if (imgFile.size > maxSize) {
                    Swal.fire('Error', 'ขนาดรูปภาพต้องไม่เกิน 2MB', 'error');
                    setIsUploading(false);
                    return;
                }

                const storageRef = ref(storage, `partyPosts/${Date.now()}_${imgFile.name}`);
                const snapshot = await uploadBytes(storageRef, imgFile);
                imgURL = await getDownloadURL(snapshot.ref);
            }

            const postRef = await addDoc(collection(db, "posts"), {
                partyID: party.UID,
                content: content,
                description: description,
                hasImage: hasImage,
                img: imgURL,
                date: serverTimestamp(),
                likes: 0,
            });

            await addDoc(collection(db, "posts", postRef.id, "comments"), {
                _status: "initial_placeholder",
            });

            Swal.fire({
                title: 'สำเร็จ!',
                text: 'โพสต์นโยบายถูกเผยแพร่แล้ว',
                icon: 'success',
                confirmButtonColor: '#1e3a8a',
            }).then(() => {
                navigate(`/partyAdmin/${id}/posts`);
            });

        } catch (error) {
            console.error("Error creating post: ", error);
            Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถสร้างโพสต์ได้ในขณะนี้', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    if (!currentParty) return null;

    return (
        <div className="animate-fade-up min-h-screen bg-slate-50 pb-28 pt-8 px-6">
            <div className="max-w-xl mx-auto">
                <button 
                    onClick={() => navigate(`/partyAdmin/${id}`)}
                    className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-6 hover:text-blue-600 transition-colors cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" /> ย้อนกลับไปหน้าจัดการ
                </button>

                <div className="bg-white rounded-xl shadow-xl shadow-blue-900/5 border border-blue-50 overflow-hidden">
                    <div className="bg-blue-900 px-6 py-4">
                        <h2 className="text-white font-black text-lg">สร้างโพสต์ใหม่</h2>
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">{currentParty.name}</p>
                    </div>

                    <div className="p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">หัวข้อโพสต์</label>
                            <input 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                type="text"
                                placeholder="..."
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-slate-700"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">รายละเอียดนโยบาย</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="..."
                                rows="6"
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-600 leading-relaxed"
                            ></textarea>
                        </div>
                        <div className="pt-2">
                            <label className="inline-flex items-center cursor-pointer group">
                                <input 
                                    type="checkbox"
                                    checked={hasImage}
                                    onChange={() => setHasImage(!hasImage)}
                                    className="hidden"
                                />
                                <div className={`w-5 h-5 rounded-md border-2 mr-3 flex items-center justify-center transition-all ${hasImage ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                    {hasImage && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <span className={`text-sm font-bold transition-colors ${hasImage ? 'text-blue-600' : 'text-slate-500'}`}>ต้องการเพิ่มรูปภาพประกอบ</span>
                            </label>

                            {hasImage && (
                                <div className="mt-4 animate-fade-down">
                                    {!imgPreview ? (
                                        <label className="w-full h-40 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer">
                                            <ImagePlus className="w-8 h-8 text-slate-300 mb-2" />
                                            <span className="text-xs font-bold text-slate-400 uppercase">เลือกไฟล์รูปภาพ (Max 2MB)</span>
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    ) : (
                                        <div className="relative rounded-xl overflow-hidden border border-slate-200">
                                            <img src={imgPreview} className="w-full h-48 object-cover" alt="preview" />
                                            <button 
                                                onClick={() => {setImgFile(null); setImgPreview(null);}}
                                                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors cursor-pointer"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="pt-4 flex gap-3">
                            <button 
                                disabled={isUploading}
                                onClick={handleCreatePost} 
                                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-white transition-all cursor-pointer shadow-lg ${isUploading ? 'bg-slate-400 shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        เผยแพร่
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}