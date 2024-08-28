import React, {useRef, useState, useEffect} from 'react';
import {Form, Button, Card, InputGroup, OverlayTrigger, Tooltip} from 'react-bootstrap';
import { useParams, useNavigate } from "react-router-dom";
import QuestionPopupEdit from '../common/QuestionPopupEdit';
import { v4 as uuidv4 } from 'uuid';
import {useAuth} from "../../contexts/AuthContext";
import Swal, { SweetAlertIcon } from 'sweetalert2';
import {Room, Question, questionItem} from "../../interfaces";
import { useDatabase } from '../../contexts/DatabaseContext';
import Loading from '../common/Loading';

interface optionalProps {
  editMode?: boolean;
}

// Custom error to validate forms
class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

export default function CreateRoom({editMode}: optionalProps) {

    const [questions, setQuestions] = useState<questionItem[]>([]);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [editRoom, setEditRoom] = useState<Room | null>(null);

    const nameRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const imageRef = useRef<HTMLInputElement>(null);

    const alertTimer = 2500; // 2500 ms = 2.5s
    const [permission, setPermission] = useState<boolean>(editMode ? false:true);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [uploadError, setUploadError] = useState<boolean>(false);
    
    const { currentUser } = useAuth();
    const { createRoom, getRoomById, getQuestionsById, updateRoom } = useDatabase();
    const redirect = useNavigate();

    const { id: documentID } = useParams<{ id: string }>();

    useEffect(() => {
        const checkIfEditing = async () => {
            if (editMode  && currentUser) {
                const room = await getRoomById(documentID);
                if (room && currentUser.UserID === room.UserID) {
                    setEditRoom(room);
                    setPermission(true);
                    const questionsCollection = await getQuestionsById(documentID);
                    if (questionsCollection) {
                        const newQuestions = questionsCollection.map((question) => ({
                            id: uuidv4(),
                            question: {
                            ...question,
                            ...(question.PointRange ? {PointRange: question.PointRange}:{})}
                        }));
                        setQuestions(newQuestions);
                    }
                } else {
                    setPermission(false);
                }
            } else if(!currentUser){
                setPermission(false);
            }
            setIsLoading(false);
        };
        checkIfEditing();
    }, []);

      useEffect(() => {
        if (editRoom && nameRef.current && descriptionRef.current) {
          nameRef.current.value = editRoom.Name;
          descriptionRef.current.value = editRoom.Description;
        }
      }, [editRoom && !isLoading]);
    //   useEffect(() => {
    //     console.log(questions);
    //   }, [questions]);
    const makeAlert = (iconString: SweetAlertIcon, titleString: string, hasConfirm: boolean, time: number) => {
        Swal.fire({
            icon: iconString,
            title: titleString,
            showConfirmButton: hasConfirm,
            timer: time
          });
    }

    // Adds new questions or replaces one based on updateId
    const addToList = (newQuestion: Question, updateId?: string) => {
        /*         console.log(updateId);
                console.log(newQuestion); */
        if(updateId){ //TODO -  update doesnt work if you only update question. Starts working after you change mapmode
            setQuestions((prev) => prev.map(item =>
                    item.id === updateId ? 
                        { id: item.id, question: newQuestion}
                        : 
                        item
                )
            );
        }else {
            const newItem = {id: uuidv4(), question: newQuestion};
            setQuestions([...questions, newItem]);
        }
    };

    const deleteItem = (deleteId: string) => {
        const newList = questions.filter(item => deleteId !== item.id); // make new filtered list, except for deleteId
        setQuestions(newList);
    }

    const clearForm = () => {
        if(nameRef.current) nameRef.current.value = "";
        if(descriptionRef.current) descriptionRef.current.value = "";
        if(imageRef.current) imageRef.current.value = "";
        setQuestions([]);
        setUploadedFile(null);
    }

    const validUploadExtensions = ["/image/jpeg", "image/png", "image/jpeg", "image/webp"];

    const handleFileInput = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if(validUploadExtensions.includes(file.type)){
                setUploadedFile(file); 
            } else {
                setUploadError(true);
                event.target.value = "";
            }
        } else{
            setUploadedFile(null);
        }
        console.log(uploadedFile);
    }

    // Return error text if any form element is non-populated.
    const checkForms = (): string | null => {
        if(nameRef.current && nameRef.current.value === "") return "No title for the room!"; 
        else if(descriptionRef.current && descriptionRef.current.value === "") return "No description for the room!";
        else if(!uploadedFile && !editMode) return "No image uploaded for the room!";
        else if(questions.length===0) return "No questions added!";
        return null; 
    }

    const submitRoomToDb =  async (event: React.FormEvent<HTMLFormElement>) => {
        //const roomRef = doc(db, "rooms");
        event.preventDefault();
        try{    
            const errorMsg = checkForms();
            if(errorMsg) throw new ValidationError(errorMsg);
            
             const room = {  // The names/capitalizations of these variables matters and are stored in firestore and checked in rules
                Name: nameRef.current?.value,
                Description: descriptionRef.current?.value,
                UserID: currentUser?.UserID,
                imageURL: editMode ? editRoom?.imageURL:"", // imageURL is set in createRoom, uploads provided file
                Date_created: editMode ? editRoom?.Date_created:new Date().toISOString(),
                Likes: editMode ? editRoom?.Likes:[]
             } as Room;

            const indexedQuestions = questions.map(({ id, question }) => ({
                ...question
            }))as Question[];

            if(editMode && editRoom){
                updateRoom(room, indexedQuestions, documentID, uploadedFile ?? uploadedFile);
            }else{
                createRoom(room, indexedQuestions, undefined, uploadedFile);
            }

            clearForm();
            Swal.fire({ // Not a call to makeAlert because of .then
                icon: "success",
                title: editMode ? "Room successfully updated!":"Room successfully created!",
                showConfirmButton: false,
                timer: alertTimer
              }).then(() => {
                  console.log("Successfully added room to db!");
                  redirect("/myrooms");
              });
            // makeAlert("success", editMode ? "Room successfully updated!":"Room successfully created!", false, alertTimer);
        } catch (error){
            if(error instanceof ValidationError){
                // console.error("Validation Error: ", error);
                makeAlert("error", error.message, false, alertTimer);
            } else{
                console.error("Something went wrong creating the room.\n", error);
                makeAlert("error", "Oops! Something unexpected happened.", false, alertTimer);
            }
        }
    }

    const loadContent = () => {
        return (
            <>
            <Card>
                <Card.Body>
                    <h2 className="text-center mb-4">{editMode ? "Room editor":"Room creator"}</h2>
                    <Form onSubmit={submitRoomToDb}>
                        <Form.Group id="createRoomName" className="mb-3">
                                <Form.Label>Room name</Form.Label>
                                <Form.Control ref={nameRef} type="text" placeholder="Enter name of your room"/>
                        </Form.Group>
                        <InputGroup>
                            <InputGroup.Text>Room Description</InputGroup.Text>
                            <Form.Control ref={descriptionRef} as="textarea" aria-label="With textarea"/>
                        </InputGroup>
                        <Form.Group controlId="formFile" className="mb-3">
                            <Form.Label>Upload image for room</Form.Label>
                                <Form.Control 
                                    type="file"
                                    accept='.jpg,.jpeg,.png,.webp'
                                    ref={imageRef}
                                    onBlur={(event: React.FocusEvent<HTMLInputElement>) =>{
                                        handleFileInput(event);
                                        if(uploadError) setUploadError(false);
                                    }}
                                />
                                {uploadError && <div style={{color: "red"}}>Unsupported file format. Try another.</div>}
                            </Form.Group>
                        <Form.Group className="mb-3">
                            {/* populate from list updated by onlick function of button with questionPopupEdit. Show list of questions here */}
                            <ul className="list-group">
                                {questions.length !== 0 && <p>Questions</p>}
                                {questions.map((item, index) => (
                                    <li key={index} style={{ display: "flex", alignItems: "center" }}> 
                                        <Form.Control
                                            readOnly
                                            value={"Question: "+item.question.Question}
                                        />
                                        <Form.Control
                                            readOnly
                                            value={"MapMode: "+item.question.MapMode}
                                        />
                                        <Form.Control
                                            readOnly
                                            value={"Answer: "+item.question.Answer}
                                        />
                                        {item.question.PointRange && 
                                             <Form.Control
                                             readOnly
                                             value={"Range: "+item.question.PointRange}
                                         />
                                         
                                        }
                                        {/* TODO - Select country on map when editing */}
                                        
                                        <QuestionPopupEdit buttonText={"Edit"} addQuestion={addToList} oldQuestion={item.question} id={item.id}/>
                                        <Button onClick={() => deleteItem(item.id)}>Delete</Button>
                                    </li>
                                ))}
                            </ul>    
                            <Form.Label>Add question</Form.Label>
                            <QuestionPopupEdit buttonText={"+"} addQuestion={addToList}/>
                        </Form.Group>
                        { currentUser ?
                            <>
                                <Button type="submit">{editMode ? "Save":"Create room"}</Button>
                            </>
                            :
                            <>
                                <OverlayTrigger 
                                    overlay={
                                        <Tooltip id="createroom-login-tooltip">You need to login!</Tooltip>
                                    }
                                    placement="right"
                                    >
                                    <span className="d-inline-block">
                                        <Button disabled style={{ pointerEvents: 'none' }}>
                                            Create Room
                                        </Button>
                                    </span>
                                </OverlayTrigger>
                            </>
                        }
                    </Form>
                </Card.Body>
            </Card>
        </>
        );
    }

    return (
        <div className="d-flex flex-column align-items-center justify-content-center vh-100">
            <div style={{width:"40%", height:"50%"}}>
            { !isLoading ? (
                permission ?
                    <>
                        {loadContent()}
                    </>
                    :
                    <Card style={{backgroundColor: "rgb(0,0,0,0.7)"}}>
                        <h4 style={{color: "white"}}>You do not have permission to view this page.</h4>
                    </Card>
                )
                :
                <Loading/>
            }
                    </div>
        </div>
    );
}