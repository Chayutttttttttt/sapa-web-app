import {useState, useEffect} from "react";
import { PARTIES } from "../../data/parties";
import { useNavigate } from "react-router-dom";
import { db } from "../../data/firebase";
import { collection, getDocs } from "firebase/firestore";
import { formatDate } from "../../utils/formatDate";

export default function Learn() {
    const [topics, setTopics] = useState([]);
    const navigate = useNavigate();
    const [selectedTag, setSelectedTag] = useState("");

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const topicsCollection = collection(db, "learn");
                const topicsSnapshot = await getDocs(topicsCollection);
                const topicsList = topicsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTopics(topicsList);
            } catch (error) {
                console.error("Error fetching topics: ", error);
            }
        };
        fetchTopics();
    },[]);

    const allTags = topics.reduce((acc, topic) => {
        topic.tag.forEach(tag => {
            if (!acc.includes(tag)) {
                acc.push(tag);
            }
        });
        return acc;
    }, []);
    console.log(topics)
    return (
        <div className="animate-fade-up pb-28 min-h-screen max-w-xl mx-auto px-6 pt-8 space-y-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold ">ห้องเรียนรู้</h1>
                    <p className="text-slate-400 font-medium">วันที่ {formatDate(new Date())}</p>  
                </div>
            </div>

            <div className=" flex items-center justify-between">
                <div onClick={() => navigate(`./video`)} className="text-center p-2 bg-white w-full h-12 border-blue-200 border-2 rounded-3xl appearance-auto transition-all hover:cursor-pointer hover:border-blue-500 hover:text-blue-800 text-gray-400 text-xl font-medium">
                    <h1>รับชมเเบบวิดีโอ </h1>
                </div>
            </div>

            <div className="items-center justify-between mb-8">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2"># เลือกตามหมวดหมู่</label>
                <select
                    className="w-full h-12 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer text-gray-700"
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                >
                    <option value="" >ทั้งหมด</option>
                    {allTags.map((tag) => (
                        <option key={tag} value={tag}>{tag}</option>
                        ))}
                </select>
            </div>

            
            <div className="space-y-4">
                {topics
                    .filter(topic => selectedTag === "" || topic.tag.includes(selectedTag))
                    .map((topic) => (
                    <div
                        key={topic.id}
                        className="animate-fade-up bg-white p-5 rounded-3xl shadow-sm border border-slate-50 transition-all hover:shadow-md cursor-pointer"
                        onClick={() => navigate(`./${topic.id}`)}
                    >
                        <h2 className="text-xl font-bold text-blue-950 tracking-tight">เรื่อง : {topic.topic}</h2>
                        <h3 className="text-sm font-medium text-slate-500 mt-1">วันที่ : {formatDate(topic.date)}</h3>
                        <p className="text-slate-400 mt-1">แท็ก : {topic.tag.join(", ")}</p>
                    </div>
                ))}
            </div>

        </div>
    )
};