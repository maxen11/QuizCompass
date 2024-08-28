
import Dropdown from 'react-bootstrap/Dropdown';
import { NavLink} from "react-router-dom";
import {useAuth} from "../../contexts/AuthContext";

export default function ProfileDropdown(){

    const {currentUser, signout} = useAuth();
    const ProfilePictureDefault = "./src/assets/default-user.jpg";
    let profilePic;
    if(currentUser){
        if(currentUser.profilePicture === ""){
            profilePic = ProfilePictureDefault
        } else{
            profilePic = currentUser.profilePicture;
        }
        console.log("currentUser: ",currentUser);
    } else{
        profilePic = ProfilePictureDefault;
    }

    return (
        <>
         <Dropdown drop="start">
            <Dropdown.Toggle as="div" id="dropdown-custom-components">
            <img src={profilePic} style={{ width: "40px", cursor:"clickable" }} className='img-fluid rounded-circle h-10' />
            </Dropdown.Toggle>
                {currentUser ?

                    <Dropdown.Menu className="profile-dropdown-options">
                        <Dropdown.Header>{currentUser.Email}</Dropdown.Header>
                        <Dropdown.Divider />
                        <Dropdown.Item eventKey="1"><NavLink className="d-block w-100" style={{ width: "100%" }} to="/profile">Profile</NavLink></Dropdown.Item>
                        <Dropdown.Item eventKey="2"><NavLink className="d-block w-100" to="/myrooms">My Rooms</NavLink></Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item eventKey="3" onClick={signout}><NavLink className="d-block w-100" to="/">Sign out</NavLink></Dropdown.Item>
                    </Dropdown.Menu>
                    :
                    <Dropdown.Menu className="profile-dropdown-options">
                        <Dropdown.Header>Not signed in</Dropdown.Header>
                        <Dropdown.Divider />
                        <Dropdown.Item eventKey="1"><NavLink to="/signin">Sign in</NavLink></Dropdown.Item>
                    </Dropdown.Menu>
                }
        </Dropdown>
                <style>
                    {`
                        .profile-dropdown-options *:hover{
                            background: #e0e0e0;
                        }
                        .profile-dropdown-options *{
                            text-decoration: none;
                        }
                    `}
                </style>
        </>
    );
}