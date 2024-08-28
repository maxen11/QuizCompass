export interface Question {
    Answer: string[] | number[];
    MapMode:string;
    Question:string;
    PointRange?: number;
    Nr?:number;
  }
  
  export interface questionItem {
      id: string; // ID for local handling
      question: Question;
  }
  
  export interface Room {
    Name: string;
    Description: string;
    imageURL: string;
    Date_created: string;
    UserID: string;
    Likes: string[];
  }

  export interface DbRoom extends Room{
    docId: string;
  }

 export interface User{
    UserID: string;
    Email: string;
    profilePicture: string;
}

export interface Lobbies{
  lobbies: Lobby[];
}

export interface Lobby{
  id: string;
  // roomDocId: string;
  users: LobbyUser[];
  messages: Message[];
}

export interface Message {
  // msgID: string; // added through firebase
  user: string;
  // userID: string;
  text: string;
  messageColor: string;
  // timestamp: string; // added on creation instead
}

export interface LobbyUser { // Maybe add a isHost field. Can quit room, others can just leave.
  userID: string;
  username: string;
  messageColor: string;
}

export interface indexedAlgoliaRoom extends Room{
  objectID: string;
}
