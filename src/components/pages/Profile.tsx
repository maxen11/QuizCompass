import { useAuth } from "../../contexts/AuthContext";
import { NavLink} from "react-router-dom";
import Form from 'react-bootstrap/Form';
import { Card , Image, Button} from "react-bootstrap";
import {User} from "../../interfaces";
import { useState} from 'react';
import Swal from 'sweetalert2';
import { useDatabase } from "../../contexts/DatabaseContext";

function Profile(){ 

    const {currentUser, setCurrentUser} = useAuth();
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const defaultProfilePictureURL = "./src/assets/default-user.jpg";
    const [uploadError, setUploadError] = useState<boolean>(false);
    const alertTimer = 2500;
    const {uploadImageToDb, updateUserInDb} = useDatabase();
    console.log("currentUser: ", currentUser);
    
    const updateProfilePicture = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try{
          if(uploadedFile && currentUser){
            const oldImageURL = currentUser.profilePicture;
            const profilePicURL = await uploadImageToDb(uploadedFile, oldImageURL);
            const newUserData = {...currentUser, profilePicture: profilePicURL} as User;
            updateUserInDb(newUserData);
            setCurrentUser(newUserData);
            setUploadedFile(null);
            Swal.fire({
              icon: "success",
              title: "Profile image successfully updated!",
              showConfirmButton: false,
              timer: alertTimer
            });
          }
        } catch(error){
          console.error("Something went wrong updating profile picture.", error);
          Swal.fire({
            icon: "error",
            title: "Oops! Something went wrong updating profile picture.",
            showConfirmButton: false,
            timer: alertTimer
          });
        }
    }

    const validUploadExtensions = ["/image/jpeg", "image/png", "image/jpeg", "image/webp"];

    const handleFileInput = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if(validUploadExtensions.includes(file.type)){
                setUploadedFile(file); 
            } else {
                setUploadError(true);
                event.target.value = "";
            }
        } else{
            setUploadedFile(null);
        }
        console.log(uploadedFile);
    }

    return (
    <div  className='d-flex align-items-center justify-content-center vh-100'>
    {currentUser ?
      <>
        <Card style={{width: "30%"}}>
          <Image src={currentUser.profilePicture || defaultProfilePictureURL} className='img-fluid h-10' style={{height: "15%" , width:"15%"}}/>
          <Card>

            <Form onSubmit={updateProfilePicture}>
              <Form.Group controlId="formFile" style={{width: "100%"}}>
                <Form.Label>Update profile picture</Form.Label>
                <Form.Control 
                  type="file" 
                  accept='.jpg,.jpeg,.png,.webp' 
                  onBlur={(event: React.FocusEvent<HTMLInputElement>) =>{
                    handleFileInput(event);
                    if(uploadError) setUploadError(false);
               }} 
                />
                {uploadError && <div style={{color: "red"}}>Unsupported file format. Try another.</div>}
                <Button type="submit">Upload</Button>
              </Form.Group>
            </Form>
          </Card>

          {/* <p> {currentUser && currentUser.displayName && "Display Name: "+currentUser.displayName}</p> */}
          <p>Email: {currentUser.Email}</p>
        </Card>
      </>
      :
      <>
        <p>You are not signed in. <NavLink to="/signin">Sign in</NavLink></p>
      </>
    }

    </div>
    );
}

export default Profile;