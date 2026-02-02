import React,{ useEffect , useState} from "react";
import { auth } from "../data/firebase.js"
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return React.useContext(AuthContext);
};

export default { AuthProvider , useAuth };