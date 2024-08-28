import { Component } from "react";
import {Button, Card, Row} from 'react-bootstrap';
import { NavLink } from "react-router-dom";

class Home extends Component {
  render() {/*
    return (
      <div>
        <h2>Welcome to QuizCompass</h2>
        <p>This is a paragraph on the HomePage of the SPA App.</p>
      </div>
    );*/
    return (
    <>
      <div className='d-flex align-items-center justify-content-center vh-100'> 
      <Card className='text-center'style={{ width: '18rem'}}>
        <Card.Body>
        <Card.Title>
          Welcome to QuizCompass
        </Card.Title>
          <NavLink to="/signin">
            <Row className="mb-3">
              <Button variant="outline-primary" size="lg" >Sign in</Button>
            </Row>
          </NavLink>
            <NavLink to="/signup">
              <Row className="mb-3">
                <Button variant="outline-primary" size="lg" >Sign up</Button>
              </Row>
            </NavLink>
        </Card.Body>
      </Card>
      </div> 
    </>
    );
  }
}

export default Home;