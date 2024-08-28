import { useEffect , useState} from "react";
import { Col, Row, Card} from "react-bootstrap";
import RoomCard from "../common/RoomCard";
import Loading from "../common/Loading";
import {useAuth} from "../../contexts/AuthContext";
import { NavLink} from "react-router-dom";
import Swal from 'sweetalert2';
import {DbRoom} from "../../interfaces";
import { useDatabase } from "../../contexts/DatabaseContext";

export default function MyRooms (){


    const [dbrooms, setDbRooms] = useState<DbRoom[]>();
    const {currentUser} = useAuth();
    const {getDbRoomByUserID, deleteRoomFromDb} = useDatabase();

    useEffect(() => {

      const getRooms = async () => {
        try{
          if(currentUser){
            const UserID = currentUser.UserID;
            const rooms = await getDbRoomByUserID(UserID);
            if(rooms)
              setDbRooms(rooms);
          }
        } catch(error){
          console.error("Something went wrong getting rooms.", error);
        }
      }

      getRooms();
    }, []);

    const deleteRoom = async (docId: string) => {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Get room from rooms variable, delete image from storage, delete document.
          if(dbrooms){
            const dbroom = dbrooms.find(dbroom => dbroom.docId === docId);
            if(dbroom){
              const imageToDeleteURL = dbroom.imageURL;
              try{
                deleteRoomFromDb(dbroom.docId, imageToDeleteURL);
                const newRoomList = dbrooms.filter(dbroom => docId !== dbroom.docId); // make new filtered list, except for docId
                setDbRooms(newRoomList); // Only for local change to list
                Swal.fire({
                  title: "Deleted!",
                  text: "The room has been successfully deleted.",
                  icon: "success"
                });
              } catch(error){
                console.log("Something went wrong deleting room.", error);
                Swal.fire({
                  title: "Deleted!",
                  text: "Oops! Something went wrong deleting the room.",
                  icon: "error"
                });
              }
            } else{
              console.error("Couldn't find the room you want to delete!");
            }
          }
        }
      });
    }

    if(!dbrooms){
      return (
        <>
        <Loading/>
        </>
      )
    }

    return (
      <div className='d-flex align-items-center justify-content-center' style={{paddingTop: "3rem"}}>
         <Card style={{backgroundColor: "rgb(0,0,0,0.7)", width: "100%"}}>

          <h1 style={{color: "white"}}>My Rooms</h1>
          <Row className="g-12">
            {dbrooms && dbrooms.length!== 0 && dbrooms.map((dbroom, index) =>
              <Col xs={10} sm={8} md={6} lg={3} key={"room-col-"+index}>
                <RoomCard key={index} dbroom={dbroom} editable={true} deleteRoom={deleteRoom}/>
              </Col>
            )}
            {dbrooms.length === 0 && 
              <p style={{color: "white"}}>You haven't created any rooms yet! Create a room <NavLink to="/createroom">here</NavLink>.</p>
            }
          </Row>
        </Card>
      </div>
    );
}