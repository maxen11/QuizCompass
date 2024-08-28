import { Button , Card} from "react-bootstrap";
import Maploader from "../common/Map";
import MapCountryloader from "../common/MapCountries";
import { useState , useRef} from 'react';
// import EndGame from "../common/EndGame"
import mapboxgl from 'mapbox-gl';
import {Room, Question} from "../../interfaces";

// interface RoomListProp{
//     room: Room;
//     questions: Question[];
// }

interface Props {
    room: Room;
    questions: Question[];
    restart: (restart : boolean)=>void;
}

export default function Game({room, questions, restart}: Props){
    const [questionNumber, setquestionNumber] = useState<number>(0)
    const [selectedLocation, setSelectedLocation] = useState<number[] |string | null>(null);
    const [answer, setAnswer] = useState<string[] | number[] | null>(null);    
    const [showAnswer, setShowAnswer] = useState<boolean>(false);
    const [finish, setFinish] = useState<boolean>(false);
    const [displayedAnswer, setDisplayedAnswer] = useState<string | null>(null);
    const [pointRange, setPointRange] = useState<number>(0);  
    const [mapIsLoading, setMapIsLoading] = useState<boolean>(false);
    
    const score = useRef<number>(0);

    const calculateScore= () => {
        if (questions[questionNumber].MapMode === "country"){
            setDisplayedAnswer(`The correct answer is: ${questions[questionNumber].Answer}`)
            if(questions[questionNumber].Answer === selectedLocation){
                score.current+=1;
            }
        } else {
                const pointRange = questions[questionNumber].PointRange as number;
                setPointRange(pointRange);
                if(selectedLocation && selectedLocation.length > 1){
                    const user_lng = selectedLocation[0] as number;
                    const user_lat = selectedLocation[1] as number;
                    const userCoordinates = new mapboxgl.LngLat(user_lng, user_lat);

                    const answer_lng = questions[questionNumber].Answer[0] as number;
                    const answer_lat = questions[questionNumber].Answer[1] as number;
                    const answerCoordinates = new mapboxgl.LngLat(answer_lng, answer_lat);

                    const distance = Math.round(userCoordinates.distanceTo(answerCoordinates));
                    setDisplayedAnswer(`You are ${distance}m from the correct answer`); // in meters

                    // console.log("your are ",distance, "m from the answer");
                    // console.log("this is the range: ",questions[questionNumber].PointRange);    
                    if(distance < pointRange)
                        score.current+=1;
                } else{
                    setDisplayedAnswer(`You did not answer the question`);
                }
            }     
    }

    function handlePlayAgain(){
        restart(false);
    }
    function endGame(){
        setFinish(true);
    }
    const submitAnswer = () => {
        //setquestionNumber(questionNumber+1);
        //console.log(questions[questionNumber].question.Answer);
            setMapIsLoading(true);
            setAnswer(questions[questionNumber].Answer);
            setShowAnswer(true);
            calculateScore();
    }
    const nextQuestion= () => {
        if (noQuestions){
            //setDisplayedAnswer(null);
            setPointRange(0);
            setSelectedLocation(null);
            setShowAnswer(false);
            setAnswer(null);
            setquestionNumber(questionNumber+1);
        }else {
            console.log("There are questions left: ", noQuestions);
            //score 
        }
    }

    const noQuestions: boolean = (questions && questions.length-1 > questionNumber);

    return (
        <div className='d-flex align-items-center justify-content-center' style={{paddingTop: "3rem",width: "100vw", height:"100vh"}}>
            <Card style={{backgroundColor: "rgb(0,0,0,0.7)", color: "white", width: "100%", height:"100%"}}>
                <h1 className="text-light">{room.Name}</h1>
                {/* <Card style={{ height: '90vh', display: 'flex', flexDirection: 'column'}}> */}
                {finish ?
                    <Card style={{display: 'flex'}} className="mx-auto">
                        <div className='mx-auto align-items-center justify-content-center'>
                            <h1>Score: {score.current}/{questions.length}</h1>
                            <Button variant="btn btn-primary btn-lg" onClick={handlePlayAgain}>Play again?</Button>
                        </div >
                    </Card>
                    :
                    (
                    <>
                     <Card style={{ height: '90vh', display: 'flex', flexDirection: 'column'}} className=" align-items-center justify-content-center">
                    <h2 className="text-center text-dark">{questions[questionNumber].Question}</h2>
                    { questions[questionNumber].MapMode === "country" ?
                        <MapCountryloader addSelectedLocation={setSelectedLocation} addAnswer={answer as string[] | null} isLoading={setMapIsLoading}/>
                        :
                        <Maploader addSelectedPin={setSelectedLocation} pointsArea={pointRange} addAnswer={answer as number[] | null} isLoading={setMapIsLoading}/>}
                    { showAnswer ? <>
                        <h2>{displayedAnswer}</h2>
                        {(noQuestions ? 
                            
                            (mapIsLoading ? 
                                <div className="question-button">
                                    <Button onClick={nextQuestion} disabled>Next Question</Button>
                                </div>
                                :
                                <div className="question-button">
                                    <Button onClick={nextQuestion}>Next Question</Button>
                                </div>
                            )
                            :
                            <div className="question-button">
                                <Button onClick={endGame}>End Game</Button>
                            </div>
                        )}
                        </>
                    :
                    <div className="question-button">
                        <Button onClick={submitAnswer}>Submit Answer</Button>
                    </div>
                    
                } 
                </Card>
                </>
                )}
                
            {/* </Card> */}
        </Card>
        <style>
            {`
                .question-button {
                    width: 30%;
                    padding: 10px;
                }
                .question-button button {
                    width: 100%;
                    height: 120%;
                }
            `}
        </style>
        </div>
    );

}