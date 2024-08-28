import { useParams, NavLink} from 'react-router-dom';
import { Button} from 'react-bootstrap';

interface Props {
    score:number;
}
export default function EndGame({score}:Props){
    //const { id: roomId } = useParams<{ id: string }>();
    const roomId = useParams().id;
    console.log(roomId);
    //const navigate = useNavigate();

    const handlePlayAgain = () => {
      // Navigate to the same route to force a re-render
      window.location.reload();
      //navigate(`/room/${roomId}`, { replace: true });
    };
    return (
    <>
        <h1>Score: </h1>
        <p>you got: {score}</p>
        <NavLink to={`/room/${roomId}`}>
            <Button variant="outline-primary" size="lg" onClick={handlePlayAgain}>Play again?</Button>
        </NavLink>
    </>
    )
}

