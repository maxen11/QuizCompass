import {Form, Button, Card, InputGroup} from 'react-bootstrap';
import { v4 } from 'uuid';
import { useAuth } from '../../contexts/AuthContext';
import React, { useState, useEffect, useRef } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import {Message} from "../../interfaces";
import {ref as dbRef, onChildAdded, off, DataSnapshot} from "firebase/database";
import { realTimeDb} from "../../config/firebase-config";


interface ChatProps {
    lobbyId: string;
    messageColor: string;
}


function Chat({lobbyId, messageColor}: ChatProps) {
    
    const [messages, setMessages] = useState<Message[]>([])
    // const [hasListener, setHasListener] = useState<boolean>(false);
    const messageBoxRef = useRef<HTMLInputElement>(null);
    const {currentUser} = useAuth();
    const {addMessageToLobby} = useDatabase();
    
    const Message = (message: Message) => {
        return (
            <>
                <p><span style={{color: message.messageColor}}>{message.user}</span>: {message.text}</p>
            </>
        );
    };

    // Handle submit to db here. Maybe add functions to database context
    const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(currentUser && messageBoxRef.current && messageBoxRef.current.value !== "" ){
            const newMessage = {
                msgID: v4(), // Maybe id not necessary (maybe if you want to delete msg)
                user: currentUser.Email,
                messageColor: messageColor,
                text: messageBoxRef.current.value,
                timestamp: new Date().toISOString()
            } as Message;
            addMessageToLobby(lobbyId, newMessage);
            messageBoxRef.current.value = "";
        } else {
            console.error("Not logged in or somethings not done loading.")
        }
    };
    const [autoScroll, setAutoScroll] = useState<boolean>(true);
    const outerChatboxRef = useRef<HTMLDivElement>(null);

    // Makes sure auto scroll is only on when scroll is on bottom.
    const handleScroll = () => {
        if (outerChatboxRef.current) {
          const isAtBottom = outerChatboxRef.current.scrollHeight - outerChatboxRef.current.scrollTop === outerChatboxRef.current.clientHeight;
          setAutoScroll(isAtBottom);
        }
      };
      
      // Auto scroll to bottom if at bottom with every new message
      useEffect(() => {
        if (outerChatboxRef.current && autoScroll) {
          outerChatboxRef.current.scrollTop = outerChatboxRef.current.scrollHeight;
        }
      }, [messages, autoScroll]);

      const handleNewMessage = (snapshot: DataSnapshot) => {
        const newMessage = snapshot.val();
        setMessages((prevMessages) => [...prevMessages, newMessage]); // Updater function, safer for async stuff, ensures correct state
      };

      useEffect(() => {
        // if(lobbyId){
        //     const cleanup = addNewMessagesListener(lobbyId, handleNewMessage);
        //     return () => {
        //         off(addNewMessagesListener);
        //     };
        // }
        if(lobbyId){
            const messagesRef = dbRef(realTimeDb, `lobbies/${lobbyId}/messages`);
            onChildAdded(messagesRef, handleNewMessage);
            return () => {
                off(messagesRef, 'child_added', handleNewMessage);
            };
            // setHasListener(true);
        }
      }, [lobbyId]);

    return (
        <>
            <Card className='chatroom'>
                <h3>Chat room</h3>
                <p>id: {lobbyId}</p>
                <div className="outer-chatbox" ref={outerChatboxRef} onScroll={handleScroll}>
                    <div className="inner-chatbox">                        
                    {messages.map((message, index) => (
                            <div key={index}>{Message(message)}</div>
                        ))}
                    </div>
                </div>
                    <Form onSubmit={(event) => sendMessage(event)}>
                        <InputGroup>
                            <Form.Control ref={messageBoxRef} placeholder='Send message' className="messagebox"/>
                            <Button type="submit" className="send-button">Send</Button>
                        </InputGroup>
                    </Form>
            </Card>
        <style>
            {`
                .messagebox {
                    border-radius: 25px;
                }
                .outer-chatbox {
                    position: relative;
                    height: 50vh;
                    border: 1px solid black;
                    border-radius: 10px;
                    overflow-y: scroll;
                  }
                  .inner-chatbox {
                    position: absolute;
                    left: 20px;
                  }
            `}
        </style>
        </>
    );
}

export default Chat;