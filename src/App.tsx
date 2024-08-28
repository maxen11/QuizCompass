import { Component } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";

import Home from "./components/pages/Home.tsx";
import Browse from "./components/pages/Browse.tsx";
import Signin from "./components/pages/Signin.tsx";
import Signup from "./components/pages/Signup";
import Maploader from "./components/common/Map";
import MaploaderCountries from "./components/common/MapCountries";
import Navbarloader from "./components/layout/Navbar.tsx";
import CreateRoom from "./components/pages/CreateRoom.tsx";
import Profile from "./components/pages/Profile.tsx";
import Room from "./components/pages/Room.tsx";
import MyRooms from "./components/pages/MyRooms.tsx";

import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';


class App extends Component {
render() {
  return (
    <BrowserRouter>
      <div className="App">
          <Navbarloader/>
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/browse" element={<Browse />}></Route>
            <Route path="/signup" element={<Signup />}></Route>
            <Route path="/signin" element={<Signin />}></Route>
            <Route path="/createroom" element={<CreateRoom/>}></Route>
            <Route path="/profile" element={<Profile />}></Route>
            <Route path="/map" element={<Maploader />}></Route>
            <Route path="/room/:id?" element={<Room/>}/>
            <Route path="/mapcountries" element={<MaploaderCountries />}></Route>
            <Route path="/myrooms" element={<MyRooms/>}></Route>
            <Route path="/editroom/:id?" element={<CreateRoom editMode={true}/>}></Route>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
}
export default App;
