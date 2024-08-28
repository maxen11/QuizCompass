import { useState , useRef, useEffect} from 'react';
import { collection, getDoc, doc } from "firebase/firestore"; 
import { db } from '../config/firebase-config.tsx';

interface Room {
    Name: string;
    Questions: Question[];
    Description: string;
    Date_created: string;
}

export async function getroom(id){

    const roomRef = doc(db, "rooms", id);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) {
      console.log("No such room!");
      return;
    }

    return{
        Name: roomDoc.data().Name,
        Questions: [],
        Description: roomDoc.data().Description,
        Date_created: roomDoc.data().Date_created.toDate().toString()
      };
}
     //const room[] = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
     //setroom(room);

    /* useEffect(() => {
    //getQuestions();    roomData = getroom();
    getrooms();
  }, []);
 */
