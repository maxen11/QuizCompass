import { NavLink} from "react-router-dom";
import { Navbar, Container, Nav, Image } from 'react-bootstrap';
import ProfileDropdown from "../common/ProfileDropdown";
import GameLobby from "../common/GameLobby";

export default function Navbarloader(){

    return (
      <>
     <header className="header" style={{ position: "fixed", top: 0, zIndex: 1 , width: "100%"}}>
      <Navbar bg="light" expand="lg">
        <Container fluid>
          <Navbar.Brand className="d-flex align-items-center">
            <NavLink to="/" className="d-flex align-items-center website-logo">
              <Image src="src/assets/logo2.webp" style={{ width: "40px", height: "40px" }} />
              <span className="ms-2">QuizCompass</span>
            </NavLink>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <NavLink to="/browse" className="nav-link">Browse</NavLink>
              <NavLink to="/createroom" className="nav-link">Create Room</NavLink>
            </Nav>
            <div className="endNav">
              <GameLobby/>
              <Navbar.Text className="justify-content-end">
                <ProfileDropdown />
              </Navbar.Text>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      </header>
      <style>
        {`
          .website-logo{
            text-decoration: none;
          }
          .endNav {
            display: flex;
            align-items: center;
            gap: 2rem;
          }
        `}
      </style>
      </>
  );
}