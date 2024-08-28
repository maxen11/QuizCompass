import {Button, Card, Container} from 'react-bootstrap';
import '../../css/RoomCard.css';
import LikeButton from './LikeButton';
import { NavLink } from 'react-router-dom';
import { DbRoom } from '../../interfaces';

interface Props {
  dbroom: DbRoom;
  editable?: boolean;
  deleteRoom?: (docId: string) => void;
}

export default function RoomCard({dbroom, editable=false, deleteRoom}: Props) {
  

    const deleteButtonProps = deleteRoom ? { onClick: () => deleteRoom(dbroom.docId) } : {};

    return (
    <>
    <Card style={{ width: '18rem' }} className="room-card">
      <div style={{width: "100%", height: "200px"}} className='d-flex align-items-center justify-content-center' >
        <Card.Img variant="top" style={{width: "100%",height:"100%", objectFit: "contain"}} src={dbroom.imageURL ?dbroom.imageURL:"./src/assets/react.svg"} />
      </div>
      <Card.Body className="room-card-body">
        <Card.Title>{dbroom.Name}</Card.Title>
        {dbroom.Description ?
          <Card.Text className="roomCardDescription">
            {dbroom.Description}
          </Card.Text>
          :
          <Card.Text>
            Some quick example text to build on the card title and make up the
            bulk of the card's content.
          </Card.Text>
        }
        <Container className="footer-container">
          <NavLink to={`/room/${dbroom.docId}`}>
            <Button variant="primary">Go to room</Button>
          </NavLink>
          <LikeButton documentID={dbroom.docId}/>
          {editable && deleteRoom &&
          <>
            <NavLink to={`/editroom/${dbroom.docId}`}>
              <Button>Edit</Button> 
            </NavLink>
            <Button {...deleteButtonProps}>Delete</Button> {/* Also delete image from storage when deleting room from db */}
          </>
          }
        </Container>
      </Card.Body>
    </Card>

    <style>
        {`
        .room-card {
          display: flex;
          flex-direction: column;
          height: 95%;  
        }
        
        .room-card-body {
          display: flex;
          flex-direction: column;
          flex: 1;  
          overflow: hidden;  
        }
        
        .roomCardDescription {
          flex-grow: 1;  
          font-size: 0.9em;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;  
          -webkit-box-orient: vertical;
        }
        
        .footer-container {
          margin-top: auto; 
        }
           
        `}

    </style>
    </>
  )
}
