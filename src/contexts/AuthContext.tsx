// create context for login with firebase

import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {auth,db} from "../config/firebase-config";
import { doc, getDoc, setDoc} from 'firebase/firestore';
import {signInWithPopup,GoogleAuthProvider } from 'firebase/auth';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword} from 'firebase/auth';
import {User} from "../interfaces";

export interface AuthContextTypes {
    currentUser: User | null;
    setCurrentUser: (currentUser: User | null) => void;
    signInWithGoogle: () => void;
    signUpWithEmailPassword: (email: string, password: string) => void;
    signInWithEmailPassword: (email: string, password: string) => void;
    signout: () => void;

}

interface ProviderProps{
    children: ReactNode;
  }

const AuthContext = createContext<AuthContextTypes | undefined>(undefined);
const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({ children }: ProviderProps) => {

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const defaultProfilePictureURL = "";

    useEffect(() => {
        const authState = onAuthStateChanged(auth, async (user) =>{
            if(user){
                const userRef = doc(db, `users/${user.uid}`);
                const docSnap = await getDoc(userRef);

                if(docSnap.exists()){
                    setCurrentUser({...docSnap.data()} as User);
                    console.log("doc.snap data: ", docSnap.data());
                    console.log("user: ", user);
                } else {
                    setCurrentUser({Email: user.email, UserID: user.uid, profilePicture: defaultProfilePictureURL } as User);
                }
            } else {
                setCurrentUser(null); // Maybe add so you are an anonymous user here
            }
        });
        return () => authState();
    },[]);

    const signInWithGoogle = async () => {
        try{
            const userData = await signInWithPopup(auth, googleProvider);
            const user = userData.user;
            const userRef = doc(db, `users/${user.uid}`);
            const docSnap = await getDoc(userRef);
            if(!docSnap.exists()){
                await setDoc(userRef, {
                    UserID: user.uid,
                    Email: user.email,
                    profilePicture: user.photoURL || defaultProfilePictureURL
                } as User);
                setCurrentUser({ ...docSnap.data()} as User); // not really necessary to also add rest of google data
            }
        } catch(error){
            console.error("Something went wrong signin in with google.", error);
        }
    }

    const signUpWithEmailPassword = async (email: string, password: string) => {
          const userData = await createUserWithEmailAndPassword(auth, email, password);
          const user = userData.user;
          const userRef = doc(db, `users/${user.uid}`);
          await setDoc(userRef, {
            UserID: user.uid,
            Email: user.email,
            profilePicture: defaultProfilePictureURL
          });
          setCurrentUser({Email: user.email, UserID: user.uid, profilePicture: defaultProfilePictureURL } as User);
        
      };

    const signInWithEmailPassword = async(email: string, password: string) =>{
            const userData = await signInWithEmailAndPassword(auth, email, password);
            const user = userData.user;
            const userRef = doc(db, `users/${user.uid}`);
            let docSnap = await getDoc(userRef);
            if(!docSnap.exists()) {
                await setDoc(userRef, {
                    UserID: user.uid,
                    Email: user.email,
                    profilePicture: defaultProfilePictureURL
                });
                docSnap = await getDoc(userRef);
            }
            setCurrentUser({...docSnap.data()} as User);
    }

    const signout = async () => {
        try{
            await signOut(auth);
            setCurrentUser(null);
        } catch (error){
            console.error("Something went wrong signing out: ", error);
        }
    }

    return (
        <>
            <AuthContext.Provider value={{currentUser, setCurrentUser, signInWithGoogle, signInWithEmailPassword, signout, signUpWithEmailPassword}}>
                {/* children is a special variable in react used to pass child elements. So to wrap the rest of the page */}
                {children}
            </AuthContext.Provider>
        </>

    );
};

export const useAuth = (): AuthContextTypes => { 
    const context = useContext(AuthContext);
    if(!context) throw new Error("useDatabase must be in a provider.");
    return context;
};