import {AiFillLike} from 'react-icons/ai';
import {useState, useEffect} from 'react';
import {useAuth} from "../../contexts/AuthContext";
import { useDatabase } from '../../contexts/DatabaseContext';

interface Props{
    documentID: string;
    displayAmount?: boolean;
    size?: string;
    color?: string;
}

export default function LikeButton({documentID, displayAmount=true, size='25px', color='blue'}: Props) {
    
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(0)
    const {currentUser} = useAuth();
    const {getRoomLikesById, addLikeToDb, removeLikeFromDb} = useDatabase();

    useEffect( () => {
        async function getInitialLikes() {
            try{
                const likeData = await getRoomLikesById(documentID);
                if(likeData){
                    setLikes(likeData.length); // FIXME: Complains about length
                    if(currentUser && likeData.includes(currentUser?.UserID)){
                        setIsLiked(true);
                    }
                }
            }
            catch (error){
                console.error("Unable to get like amount, setting to default 0", error);
                setLikes(0);
            }
        }

        getInitialLikes();
    }, []);
    

    const handleClick = async () => {
        if(currentUser){
            setIsLiked(!isLiked);
            if(isLiked){
                setLikes(likes-1);
                removeLikeFromDb(documentID, currentUser.UserID);
            }
            else{
                setLikes(likes+1);
                addLikeToDb(documentID, currentUser.UserID);
            }
        }
    };
    // TODO: Search through like array for own uid and mark like if already liked.
    const iconProps = {
        onClick: handleClick,
        ...(isLiked ? {color: color}:{}),
        size: size
    };

  return (
    <>
        <AiFillLike {...iconProps}/>
        {displayAmount && likes}
    </>
  )
}
