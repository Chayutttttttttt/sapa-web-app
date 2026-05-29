import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context";
import { MoveLeft, Heart } from "lucide-react";
import { db } from "../../data/firebase";
import { doc, onSnapshot, setDoc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import { formatDate } from "../../utils/formatDate";

const HEART_COLORS = [
  "text-pink-200", // like_1 - lightest pink
  "text-pink-300", // like_2
  "text-pink-400", // like_3
  "text-pink-500", // like_4
  "text-pink-600", // like_5 - darkest pink
];

const HEART_SIZES = [
  "w-6 h-6",   // like_1 - smallest
  "w-7 h-7",   // like_2
  "w-8 h-8",   // like_3
  "w-9 h-9",   // like_4
  "w-10 h-10", // like_5 - largest
];

export default function Topic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [topic, setTopic] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRating, setIsRating] = useState(false);

  // Fetch topic data from Firebase
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    const topicRef = doc(db, "learn", id);
    const unsubscribe = onSnapshot(
      topicRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setTopic({ id: snapshot.id, ...snapshot.data() });
        } else {
          setTopic(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching topic:", error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [id]);

  // Fetch user's rating for this topic
  useEffect(() => {
    if (!user || !id) {
      setUserRating(0);
      return;
    }
    const ratingRef = doc(db, "accounts", user.uid, "topicRatings", id);
    const unsubscribe = onSnapshot(
      ratingRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUserRating(snapshot.data().rating || 0);
        } else {
          setUserRating(0);
        }
      },
      (error) => {
        console.error("Error fetching user rating:", error);
      }
    );
    return () => unsubscribe();
  }, [user, id]);

  // Handle heart click for rating
  const handleHeartClick = async (level) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (isRating) return;
    setIsRating(true);

    try {
      const ratingRef = doc(db, "accounts", user.uid, "topicRatings", id);
      const topicRef = doc(db, "learn", id);

      // Map levels to like field names
      const likeFields = {
        1: "like_1",
        2: "like_2",
        3: "like_3",
        4: "like_4",
        5: "like_5",
      };

      // If clicking the same level, remove the rating
      if (userRating === level) {
        await deleteDoc(ratingRef);
        // Decrease the counter
        await updateDoc(topicRef, {
          [likeFields[level]]: increment(-1),
        });
        setUserRating(0);
      } else {
        // Update counters: decrease previous level, increase new level
        const updates = {};

        // Decrease previous level if exists
        if (userRating > 0) {
          updates[likeFields[userRating]] = increment(-1);
        }

        // Increase new level
        updates[likeFields[level]] = increment(1);

        // Update topic with counters
        await updateDoc(topicRef, updates);

        // Set new rating in user's document
        await setDoc(ratingRef, {
          topicID: id,
          rating: level,
          timestamp: new Date(),
        });
        setUserRating(level);
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    } finally {
      setIsRating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-6 pt-32 text-center text-slate-400 font-bold animate-pulse">
        กำลังโหลดเนื้อหา...
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-xl mx-auto px-6 pt-32 text-center text-slate-400 font-bold">
        ไม่พบหัวข้อที่ขอ
      </div>
    );
  }

  return (
    <div className="break-all max-w-xl mx-auto px-6 pt-8 pb-24 space-y-4">
      <button
        onClick={() => navigate("/learn")}
        className="flex flex-row gap-1 group appearance-none bg-white border border-blue-100 text-blue-900 py-2 pl-4 pr-10 rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:cursor-pointer"
      >
        <MoveLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        กลับ
      </button>

      <div className="animate-fade-up bg-white rounded-3xl shadow-md border border-white overflow-hidden">
        {/* Image Section */}
        {topic.img && (
          <div className="p-4 w-full h-full overflow-hidden ">
            <img
              src={topic.img}
              alt={topic.topic}
              className="w-full h-full object-cover rounded-2xl border-slate-100 border-5 shardow-sm hover:scale-102 transition-transform cursor-pointer"
              onClick={() => topic.img && window.open(topic.img, '_blank', 'noopener,noreferrer')}
            />
          </div>
        )}

        {/* Content Section */}
        <div className="p-5 space-y-3">
          <h2 className="font-black text-2xl text-slate-900">เรื่อง : {topic.topic}</h2>
          <h3 className="text-sm font-medium text-slate-500">วันที่ : {formatDate(topic.date)}</h3>

          {topic.tag && topic.tag.length > 0 && (
            <p className="text-sm text-slate-500">
              <span className="font-bold text-slate-600">แท็ก: </span>
              {topic.tag.join(", ")}
            </p>
          )}

          {/* Heart Rating System */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <span className="text-slate-600 font-medium text-sm">ระดับความเข้าใจ:</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleHeartClick(level)}
                  className="transition-all hover:scale-125 focus:outline-none disabled:opacity-50"
                  disabled={isRating}
                  title={`ให้ ${level} หัวใจ`}
                >
                  <Heart
                    className={`${HEART_SIZES[level - 1]} ${
                      userRating >= level
                        ? `fill-current ${HEART_COLORS[level - 1]}`
                        : "text-slate-300"
                    } transition-all cursor-pointer`}
                  />
                </button>
              ))}
            </div>
            {userRating > 0 && (
              <span className="text-xs font-bold text-pink-600 ml-2">
                {userRating}★
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
