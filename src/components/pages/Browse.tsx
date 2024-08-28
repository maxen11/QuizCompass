import { useEffect , useState} from "react";
import { Col, Row, Card } from "react-bootstrap";
import RoomCard from "../common/RoomCard.tsx";
import Loading from "../common/Loading.tsx";
import SearchBar from "../common/SearchBar.tsx";
import { DbRoom } from "../../interfaces.tsx";
import { useDatabase } from "../../contexts/DatabaseContext.tsx";

export default function Browse (){

    const [rooms, setRooms] = useState<DbRoom[]>();
    const {getAllDbRooms} = useDatabase();

    useEffect(() => {

      const getRooms = async () => {
        const dbrooms = await getAllDbRooms();
        if(dbrooms)
          setRooms(dbrooms);
      }

      getRooms();
    }, []);

    if(!rooms){
      return (
        <>
          <Loading/>
        </>
      )
    }

    return (
      <div className='d-flex align-items-center justify-content-center' style={{paddingTop: "4rem"}}>
        <Card style={{backgroundColor: "rgb(0,0,0,0.7)", width: "100%", height: "100%"}}>
        <div >
          <h3 style={{ color: "white" }}>Browse</h3>
          <SearchBar />
        </div>
          <h1 style={{ color: "white" }}>Featured</h1>
        <Row className="g-12">
    {rooms && rooms.map((room, index) =>
      <Col xs={10} sm={8} md={6} lg={3} key={"room-col-" + index}>
        <RoomCard key={"roomcard-" + index} dbroom={room}/>
      </Col>
    )}
  </Row>
        </Card>
        {/* <h1>Custom Rooms</h1>
        <Row className="g-12">
        {rooms && rooms.map((room, index) =>
          <Col xs={12} sm={8} md={6} lg={4}>
          <RoomCard key={index} room={room}/>
          </Col>
          )}
        </Row> */}
        <style>
          {`

          `}
        </style>
      </div>
    );
}