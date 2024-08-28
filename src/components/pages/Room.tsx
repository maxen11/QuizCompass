import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {Button, Card, Image} from 'react-bootstrap';
import Game from './Game';
import Loading from "../common/Loading";
import {Room, Question} from "../../interfaces";
import { useDatabase } from '../../contexts/DatabaseContext';

function RoomPage() {
  const roomId = useParams().id;
  const [room, setRoom] = useState<Room | null>(null);
  //const room: Room | null = (null);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>();

  const {getRoomById, getQuestionsById} = useDatabase();
  //roomId = "testroom";
  
  useEffect(() => {
    if (roomId) {
      const getData = async () => {
        
        const getroom = await getRoomById(roomId);
        if (getroom){
          setRoom(getroom);
          //console.log(room);
        }
        const getquestions = await getQuestionsById(roomId);
        if (getquestions){
          setQuestions(getquestions);
          //console.log(questions);
        }
      }
      getData()
    }
  }, [roomId]);

  // useEffect(() => {
  //   console.log(questions);
  // }, [questions]);

  if (!room) {
    return (
      <>
        <Loading/>
      </>
    );
  }

  const loadGame = () => {
    setStarted(true)
  }
  
  return (
  <>
  { started && questions ? 
    <Game room={room} questions={questions} restart={setStarted}/>
    : 
    <div className='d-flex align-items-center justify-content-center' style={{paddingTop: "5rem"}}>
        <Card style={{backgroundColor: "rgb(0,0,0,0.7)", color: "white"}} className='d-flex align-items-center justify-content-center mx-auto my-auto'>
        <div style={{ width: "500px", height: "500px"}} className='d-flex align-items-center justify-content-center'>
          <Image src={room.imageURL} style={{
            width: '100%',
            height: '100%',
            objectFit: "contain"
          }}></Image>
          </div>
        <h4>{room.Name}</h4>
          <div>{room.Description}</div>
          <div>Number of qustions: {questions?.length}</div>
          <div>Created: {room.Date_created}</div>
          <Button onClick={loadGame}>Start Quiz!</Button>
      </Card>
    </div>
    }
  </>
  );
}

export default RoomPage;
