import { db } from "./firebase.js";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { collection } from "firebase/firestore";

export async function commentPost(postID,navigateTo,user,content) {
    if (!user) return navigateTo("login");
    try {
        const commentsRef = collection(db, "posts", postID, "comments");
        await addDoc(commentsRef, {
            userID: user.uid,
            userName: user.displayName,
            userImg: user.photoURL,
            content: content,
            tag: 'user',
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding comment:", error);
    }
};

export async function partyCommentsPost(postID,party,content) {
    if (!postID) return [];
    try {
        const commentsRef = collection(db, "posts", postID, "comments");
        await addDoc(commentsRef, {
            userID: party.id,
            userName: party.name,
            userImg: party.img,
            content: content,
            tag: 'party',
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding party comment:", error);
    }
};