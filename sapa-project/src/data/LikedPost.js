import { doc, updateDoc, increment, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase.js";

const likedPost = async (post,user,likedPosts,navigateTo) => {
    if (!user) return navigateTo("login");
    
    const myLikePost = doc(db, "accounts", user.uid, "likePosts", post.id);
    const postRef = doc(db, "posts", post.id);
    const isLiked = likedPosts.includes(post.id);

    try {
        if (isLiked) {
            await deleteDoc(myLikePost);
            await updateDoc(postRef, { likes: increment(-1) });
        }
        else {
            await setDoc(myLikePost, { postID: post.id });
            await updateDoc(postRef, { likes: increment(1) });
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
};

export default likedPost;