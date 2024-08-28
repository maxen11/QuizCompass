import { useState, useRef } from 'react';
import {useAuth} from '../../contexts/AuthContext';
import Chat from "./Chat";
import {Button, Card, CloseButton, Navbar} from 'react-bootstrap';
import { useDatabase } from '../../contexts/DatabaseContext';
import { Lobby, LobbyUser } from "../../interfaces";
import { v4  } from 'uuid';
import Swal from 'sweetalert2';
import Dropdown from 'react-bootstrap/Dropdown';
import Overlay from 'react-bootstrap/Overlay';

function GameLobby () {

    const [isLobbyStarted, setIsLobbyStarted] = useState<boolean>(false);
    const [lobbyId, setLobbyId] = useState<string | null>(null);
    const { addLobby, getLobby, addUserToLobby, removeLobby } = useDatabase();
    const { currentUser } = useAuth();
    
    const randomColor = () => {
        let rand_hex_color = "#";
        const hex_chars = "0123456789abcdef";
        for (let i = 0; i < 6; i++) {
            const rand_index = Math.floor(Math.random() * hex_chars.length);
            const hex_char = hex_chars[rand_index];
            rand_hex_color += hex_char;
        }
        return rand_hex_color;
    };
   
    const [userColor] = useState(randomColor());
    
    // Setup lobby here. generate all json data, lobby id, generate user color, messages. Upload to db.
    const startAndSubmitLobby = async () => {
        try{

            if(currentUser){
                
                const lobbyUser = {
                    userID: currentUser.UserID,
                    username: currentUser.Email,
                    messageColor: userColor
                } as LobbyUser;
                const newLobbyId = v4();
                
                const newLobby: Lobby = {
                    id: newLobbyId,
                    // roomDocId: roomID,
                    users: [lobbyUser],
                    messages: []
                };
                
                addLobby(newLobby);
                setLobbyId(newLobbyId);
                setIsLobbyStarted(true);
            } 
        } catch(error){
            console.error("Error when creating new lobby: ", error);
        }
    }


    const joinLobby = async () => {
        Swal.fire({
            title: "Input room id",
            input: "text",
            inputAttributes: {
              autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Join",
            showLoaderOnConfirm: true,
            preConfirm: async (lobbyId) => {
              try {
                const lobby = await getLobby(lobbyId);
                if(lobby && currentUser){
                    setLobbyId(lobbyId);
                    setIsLobbyStarted(true);
                    const lobbyUser: LobbyUser = {
                        userID: currentUser.UserID,
                        username: currentUser.Email,
                        messageColor: randomColor()
                    };
                    addUserToLobby(lobbyUser, lobbyId);
                } else {
                    throw new Error("");
                }
              } catch (error) {
                Swal.showValidationMessage(`
                  Invalid lobby id
                `);
              }
            },
            allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                title: `Successfully joined lobby`
              });
            }
          });
    }

    const [show, setShow] = useState(false);
    const [target, setTarget] = useState(null);
    const ref = useRef(null);

    const handleClick = (event: any) => {
        setShow(!show);
        setTarget(event.target);
    };

    const quitLobby = () => {
        if(lobbyId){
            removeLobby(lobbyId);
            setIsLobbyStarted(false)
        }
    }

    // useeffetc routechange, navigate.listen, remove lobby user

    return (
    <>
    {/* Display online users, card with joines users amount like */}
            {isLobbyStarted && lobbyId ?
                <>  
                    <div ref={ref}>
                        <Button onClick={handleClick}>Open Chat</Button>
                        <Overlay
                            show={show}
                            target={target}
                            placement="bottom"
                            container={ref}
                            containerPadding={10}
                        >
                            <Card>
                                <CloseButton onClick={() => setShow(false)}/>
                                <Chat lobbyId={lobbyId} messageColor={userColor}/>
                                <Button onClick={quitLobby}>Quit Lobby</Button>
                            </Card>
                        </Overlay>
                    </div>
                </>
                : currentUser ?
                <>
                    {/* <Button onClick={startAndSubmitLobby}>Create Lobby</Button>
                    <Button onClick={joinLobby}>Join Lobby</Button> */}
                    <Dropdown drop="start">
                        <Dropdown.Toggle as="div" id="dropdown-custom-components">
                            <Navbar.Text style={{color:"black"}}>Lobby</Navbar.Text>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="profile-dropdown-options">
                            <Dropdown.Item eventKey="1" onClick={startAndSubmitLobby}>Create Lobby</Dropdown.Item>
                            <Dropdown.Item eventKey="2" onClick={joinLobby}>Join Lobby</Dropdown.Item>
                        </Dropdown.Menu>   
                    </Dropdown>
                </>
                :
                null
            }
        </>
    );
};

export default GameLobby;