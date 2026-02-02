import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase.js";

export function getLikePosts(user,setLikePosts) {
    if (!user) {
        setLikePosts([]);
        return () => {}; 
    }
    
    const likes = collection(db, "accounts", user.uid, "likePosts");
    const unsubscribe = onSnapshot(likes,(querySnapshot) => {
        const likedPostIds = querySnapshot.docs.filter(doc => doc.id !== 'init').map((doc) => {
            const data = doc.data();
            return data.postID
        });
        // console.log(likedPostIds);
        setLikePosts(likedPostIds);
    }, (error) => {
        console.error("Error fetching liked posts:", error);
    });

    return unsubscribe;
};