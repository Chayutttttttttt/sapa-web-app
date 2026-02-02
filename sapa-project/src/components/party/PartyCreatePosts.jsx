import { useState,useEffect, cache } from "react";
import Swal from "sweetalert2";
import { serverTimestamp } from "firebase/firestore";
import { db,storage } from "../../data/firebase";
import { collection,addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function PartyCreatePosts({party,PARTIES,navigateTo}) {
    const currentParty = PARTIES.find(p => p.id === party.UID);
    const [content, setContent] = useState("");
    const [description, setDescription] = useState("");
    const [hasImage, setHasImage] = useState(false);
    const [img, setImg] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (content.trim() === "" || description.trim() === "") {
            Swal.fire({
                title: 'Error',
                text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#7c3aed',
            });
            return;
        }
        setIsUploading(true);
        let imgURL = "";
        
        try {
            if (hasImage && img) {
                const maxSize = 2 * 1024 * 1024; 
                if (img.size > maxSize) {
                    Swal.fire({
                        title: 'Error',
                        text: 'ขนาดรูปภาพต้องไม่เกิน 2MB',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#7c3aed',
                    });
                    setIsUploading(false);
                    return;
                }
                const metaData = {
                    cacheControl: 'public, max-age=86400',
                    contentType: img.type,
                };

                const storageRef = ref(storage, `partyPosts/${img.name}`);
                const snapshot = await uploadBytes(storageRef, img, metaData);
                imgURL = await getDownloadURL(snapshot.ref);
            }
        } catch (error) {
            console.error("Error uploading image: ", error);
            return ;
        }

        try {
            const postRef = await addDoc(collection(db, "posts"), {
                partyID: party.UID,
                content: content,
                description: description,
                hasImage: hasImage,
                img: imgURL,
                date: serverTimestamp(),
                likes: 0,
            });

            const commentRef = collection(db, "posts", postRef.id, "comments");
            await addDoc(commentRef, {
                _status: "empty_collection_placeholder",
            });

            setContent("");
            setDescription("");
            setHasImage(false);
            setImg(null);

            Swal.fire({
                title: 'Success',
                text: 'สร้างโพสต์สำเร็จ',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#7c3aed',
            }).then(() => {
                navigateTo('partyPosts', party);
            });
        } catch (error) {
            console.error("Error creating post: ", error);
        } finally {
            setIsUploading(false);
        }
    }
    return (
        <div className="animate-fade-up h-[70vh] flex  flex-row md:flex-col items-center justify-center text-left px-6">
            <div className="w-175 bg-white p-5 rounded-3xl shadow-xl">
                {/* <h1>ยินดีต้อนรับสู่หน้าสร้างโพสต์สำหรับพรรค {currentParty.name}</h1> */}
                <h2 className="text-left text-2xl font-black">สร้างโพสต์ใหม่</h2>
                <div className="mt-4">
                    <input 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        type="text"
                        placeholder="หัวข้อโพสต์"
                        className="w-full p-3 border border-blue-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="รายละเอียดโพสต์"
                        rows="5"
                        cols="50"
                        type="text"
                        className="w-full p-3 border border-blue-200 rounded-lg h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    ></textarea>
                    <div className="mt-4 flex flex-col ">
                        <label className="mr-4 items-left">
                            <input 
                                type="checkbox"
                                checked={hasImage}
                                onChange={() => setHasImage(!hasImage)}
                                className="mr-2"
                            />
                            มีรูปภาพประกอบ
                        </label>
                        {hasImage && (
                            <input 
                                type="file"
                                onChange={(e) => setImg(e.target.files[0])}
                                className="w-full border border-blue-200 rounded-lg p-2"
                            />
                        )}
                    </div>
                    <div className="mt-6 flex justify-between">
                        <button onClick={handleCreatePost} className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition">
                            สร้างโพสต์
                        </button>
                        <button onClick={() => navigateTo('partyHome', party)} className="bg-gray-300 text-black px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-400 transition">
                            ย้อนกลับ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}