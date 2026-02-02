import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase.js";

export async function getUserData(user) {
    if (!user) return null;

    try {
        const userDoc = await getDoc(doc(db, "accounts", user.uid));
        return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
}