import {Button} from 'react-bootstrap';
import {useAuth} from "../../contexts/AuthContext.tsx";

export default function Googlebuttonlogin() {

    const { signInWithGoogle } = useAuth();

return (<>
    <Button onClick={signInWithGoogle} variant="primary" size="lg" className="mb-3 w-100 bg-white text-dark outline-light">

    <img src="src/assets/google.svg"></img>
        Sign in with Google
    </Button>
</>)
}