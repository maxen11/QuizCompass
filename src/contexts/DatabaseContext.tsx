// create context for login with firebase

import { createContext, useContext, ReactNode} from "react";
import { doc, getDoc, collection, getDocs, setDoc, query, where, deleteDoc, arrayUnion, updateDoc, arrayRemove } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, deleteObject} from "firebase/storage";
import { v4  } from 'uuid';
import { Room, Question, User, Lobby, Message, LobbyUser, DbRoom } from "../interfaces";
import { db, storage, realTimeDb} from "../config/firebase-config";
import {ref as dbRef, set, push, get, remove} from "firebase/database";

export interface DatabaseContextTypes {
    // Storage function/s
    uploadImageToDb: (file: File, oldURL?: string) => Promise<string>;

    // Firestore functions
    getRoomById: (id: string | undefined) => Promise<Room | null>;
    getAllDbRooms: () => Promise<DbRoom[]>;
    getDbRoomByUserID: (UserID: string) => Promise<DbRoom[] | null> 
    createRoom: (room: Room, questions: Question[], documentID?: string | undefined, image?: File | null, imageURL?: string | null) => Promise<void>;
    updateRoom: (room: Room, questions: Question[], documentID:string | undefined, image?: File | null, imageURL?: string | null) => Promise<void>;
    deleteRoomFromDb: (docId: string, imageToDeleteURL?: string) => void;
    getQuestionsById: (documentID: string | undefined) => Promise<Question[] | null>;
    getRoomLikesById: (docId: string) => Promise<string[] | null>;
    addLikeToDb: (docId: string, UserID: string) => void;
    removeLikeFromDb: (docId: string, UserID: string) => void;
    updateUserInDb: (user: User) => void;  

    // Realtime-database functions
    addLobby: (lobby: Lobby) => void;
    addMessageToLobby: (lobbyId: string,message: Message) => void;
    getLobby: (lobbyId: string) => Promise<Lobby | null>;
    addUserToLobby: (user: LobbyUser, lobbyId: string) => void;
    getLobbyPlayers: (lobbyId: string) => Promise<LobbyUser[] | null>;
    removeLobby: (lobbyId: string) => void;
    // addNewMessagesListener: (lobbyId: string, handleNewMessage: (snapshot: DataSnapshot) => void) => void;
  }

  interface ProviderProps{
    children: ReactNode;
  }

const DatabaseContext = createContext<DatabaseContextTypes | undefined>(undefined);

// Note: Functions do not use try-catch for errors, handle errors when calling instead
export const DatabaseProvider = ({ children }: ProviderProps) => {

    // ################################################################## Firestore ######################################################################################################

    const checkValidUrl = async(url: string): Promise<boolean> => {
        try {
            const resp = await fetch (url, {method: "head"});
            return resp.ok;
        } catch( error ){
            return false;
        }
    }

    const uploadImageToDb = async (file: File, oldURL?: string): Promise<string> => {
        if(oldURL && await checkValidUrl(oldURL)){ // For updating images
            const oldImageRef = ref(storage, oldURL);
            await deleteObject(oldImageRef);
        }
        const imageDbRef = ref(storage, `roomImages/${v4()}`);
        await uploadBytes(imageDbRef, file);
        return await getDownloadURL(imageDbRef);  
    }
    
    // Note: No need to call uploadImageToDb before calling createRoom, the function already do this.
    const createRoom = async (room: Room, questions: Question[], documentID?: string | undefined, image?: File | null): Promise<void> => {
        let roomRef = null;
        if(documentID){ // Updates room
             roomRef = doc(db, "rooms", documentID);
        }else { // Creates new room
             roomRef = doc(collection(db, "rooms"));
        }
        if(image){
            const newImageUrl = await uploadImageToDb(image, room.imageURL);
            room.imageURL = newImageUrl;
        }
        await setDoc(roomRef, {  // The names/capitalizations of these variables matters and are stored in firestore and checked in rules
            ...room
        });

        const newQuestionCollectionRef = collection(roomRef, "Questions");

        questions.forEach(async (question, index) =>{
            await setDoc(doc(newQuestionCollectionRef, (index+1).toString()), {
                ...question
            });
        });
    }

    const getRoomById = async (documentID: string | undefined): Promise<Room | null> => {
        if(documentID){
            const roomRef = doc(db, "rooms", documentID);
            const roomDoc = await getDoc(roomRef);
            return roomDoc.data() as Room;
        }
        return null;
    }

    const getAllDbRooms = async (): Promise<DbRoom[]> => {
        const roomCollection = collection(db, "rooms");
        const roomDocsSnap = await getDocs(roomCollection);
        const dbroom = roomDocsSnap.docs.map(doc => ({
              docId: doc.id,
            ...doc.data()
            })) as DbRoom[];
        return dbroom;
    }

    const getDbRoomByUserID = async ( UserID: string): Promise<DbRoom[] | null> => {
        if(UserID){
            const roomCollection = collection(db, "rooms");
            const q = query(roomCollection, where("UserID", "==", UserID));
            const roomDocsSnap = await getDocs(q);
            const dbroom = roomDocsSnap.docs.map(doc => ({
                docId: doc.id,
              ...doc.data()
              })) as DbRoom[];
            return dbroom;
        }
        return null;
    }

    const getQuestionsById = async (documentID: string | undefined): Promise<Question[] | null> => {
        if(documentID){
            const roomRef = doc(db, "rooms", documentID);
            const questionsCollectionRef = collection(roomRef, "Questions");
            const questionsSnapshot = await getDocs(questionsCollectionRef);
            const questions= questionsSnapshot.docs.map(qdoc => ({
                ...qdoc.data()
            })) as Question[];
            return questions;
        }
        return null;
    }

    const updateRoom = async (room: Room, questions: Question[], documentID:string | undefined, image?: File | null): Promise<void> => {
        if(image){
            await createRoom(room, questions, documentID, image);
        } else{
            await createRoom(room, questions, documentID);
        }
    }

    const deleteRoomFromDb = async (docId: string, imageToDeleteURL?: string) => {
        if(imageToDeleteURL){
            const imageRef = ref(storage, imageToDeleteURL);
            await deleteObject(imageRef);
        }
        const docRef = doc(db, "rooms", docId);
        await deleteDoc(docRef);
    }

    // Returns a list of UserIDs. Used to check both length and if a specific user has liked something
    const getRoomLikesById = async (docId: string): Promise<string[] | null> => {
        const docRef = doc(db, "rooms", docId);
        const docSnap = await getDoc(docRef);
        const likeData = docSnap.data()?.Likes;
        return likeData;
    }

    const addLikeToDb = async (docId: string, UserID: string) => {
        const docRef = doc(db, "rooms", docId);
        await updateDoc(docRef, {
            Likes: arrayUnion( UserID)
        });
    };

    const removeLikeFromDb = async (docId: string, UserID: string) => {
        const docRef = doc(db, "rooms", docId);
        await updateDoc(docRef, {
            Likes: arrayRemove( UserID)
        });
    };

    const updateUserInDb = async (user: User) => {
        const userRef = doc(db, `users/${user.UserID}`);
        console.log(user);
        await setDoc(userRef, {
            ...user
        });
    }


    // ################################################################## Realtime-database ######################################################################################################
    
    const addLobby = async(lobby: Lobby) => {
        if(lobby && realTimeDb){
            await set(dbRef(realTimeDb, "lobbies/"+lobby.id), lobby);
        }
    }

    const addMessageToLobby = async(lobbyId: string,message: Message) => {
        if(message && realTimeDb){
            const msgRef = dbRef(realTimeDb, `lobbies/${lobbyId}/messages`);
            const newMsgRef = push(msgRef); // Makes so messages have uniqe id
            await set(newMsgRef, message);
        }
    }
    
    const getLobby = async(lobbyId: string): Promise<Lobby | null> => {
        const lobbyRef = dbRef(realTimeDb, `lobbies/${lobbyId}`);
        const snapshot = await get(lobbyRef);
        if (snapshot.exists()) {
            return snapshot.val() as Lobby;
        } else {
            return null;
        }
        // return null;
    }

    // Call on join lobby
    const addUserToLobby = async(user: LobbyUser, lobbyId: string) => {
        if(user && realTimeDb){
            const userRef = dbRef(realTimeDb, `lobbies/${lobbyId}/users`);
            const newUserRef = push(userRef); // Makes so messages have uniqe id
            await set(newUserRef, user);
        }
    } 

    const getLobbyPlayers = async(lobbyId: string): Promise<LobbyUser[] | null> => {
        const lobbyRef = dbRef(realTimeDb, `lobbies/${lobbyId}/users`);
        const snapshot = await get(lobbyRef);
        if (snapshot.exists()) {
            return snapshot.val() as LobbyUser[];
        } else {
            return null;
        }
    }

    const removeLobby = async(lobbyId: string) => {
        const lobbyRef = dbRef(realTimeDb, `lobbies/${lobbyId}`);
        await remove(lobbyRef)
    }

    // in chat component, adds multiple listeners for some reason when in this file
    // const addNewMessagesListener = async (lobbyId: string, handleNewMessage: (snapshot: DataSnapshot) => void) => {
    //     if(lobbyId){
    //         const messagesRef = dbRef(realTimeDb, `lobbies/${lobbyId}/messages`);
    //         onChildAdded(messagesRef, handleNewMessage);
    //         return () => {
    //             off(messagesRef, 'child_added', handleNewMessage);
    //         };
    //     }
    // }

    // const removeUserFromLobby = async() => {}
    // const updateLobbyScores = async() => {}
    // const getLobbyQuestion = async() => {}
    // const getLobbyMessages = async() => {}
    // const getLobbyScores = async() => {}



    return (
        <>
            <DatabaseContext.Provider value={{
                // Storage
                uploadImageToDb, 
                // Firestore
                createRoom, 
                getRoomById, 
                getAllDbRooms,
                getDbRoomByUserID,
                getQuestionsById, 
                updateRoom,
                deleteRoomFromDb,
                getRoomLikesById,
                addLikeToDb,
                removeLikeFromDb,
                updateUserInDb,
                // Realtime-database
                addLobby, 
                addMessageToLobby, 
                getLobby,
                addUserToLobby,
                getLobbyPlayers,
                removeLobby,
                // addNewMessagesListener
                }}>
                {/* children is a special variable in react used to pass child elements. So to wrap the rest of the page */}
                {children}
            </DatabaseContext.Provider>
        </>

    );
};

export const useDatabase = (): DatabaseContextTypes => { 
    const context = useContext(DatabaseContext);
    if(!context) throw new Error("useDatabase must be in a provider.");
    return context;
};