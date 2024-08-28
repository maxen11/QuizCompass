import { useState , useRef, useEffect} from 'react';
import { collection, getDocs } from "firebase/firestore"; 
import { db } from '../config/firebase-config.tsx';

export function getRoomsQuestions(){
async () => {
    const subquerySnapshot = await getDocs(collection(db, "rooms/testroom/Questions"));
    subquerySnapshot.forEach((doc)=> {
        console.log(doc.id, " => ", doc.data());
    });
    //const room[] = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    //setroom(room);
  } 

    /* useEffect(() => {
    //getQuestions();
    getrooms();
  }, []);
 */
}