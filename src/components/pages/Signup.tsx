import { useState} from 'react';
import {Form, Button, Card} from 'react-bootstrap';
import { Container } from 'react-bootstrap';
import { NavLink} from "react-router-dom";
import Googlebuttonlogin from '../common/Googlebutton.tsx';
import {useAuth} from "../../contexts/AuthContext.tsx";
import PasswordStrengthBar from 'react-password-strength-bar';
import { useFormik } from 'formik';
import { SignUpSchema } from '../../schemas/AuthSchemas.tsx';


export default function Signup() {
    // const emailRef = useRef<HTMLInputElement>(null);
    // const passwordRef = useRef<HTMLInputElement>(null);
    // const confirmPasswordRef = useRef<HTMLInputElement>(null);

    // const [currentPassword,setCurrentPassword] = useState<string>("");
    const { signUpWithEmailPassword } = useAuth();
    const [isWrongCredentials, setIsWrongCredentials] = useState<boolean>(false);

    const {values, handleChange, handleSubmit, errors, touched, handleBlur} = useFormik({
        initialValues: {
            email: "",
            password: "", 
            confirmPassword: "",
        },
        validationSchema: SignUpSchema,
        onSubmit: (values) => {
            signUp(values.email, values.password)
        },
    });

    const signUp = async (validEmail: string, validPassword: string) => {
        // event.preventDefault();
        try{
            if(validEmail && validPassword){
                await signUpWithEmailPassword(validEmail, validPassword);
                values.email = "";
                values.password = "";
                values.confirmPassword = "";
                setIsWrongCredentials(false);
            }
        } catch(error: any){
            console.error("Failed to sign up: ", error);
            if(error.code === "auth/email-already-in-use"){
                setIsWrongCredentials(true);
            }
        }
     };

     console.log(errors);

  return (
    <>
    <Container 
         className='d-flex align-items-center justify-content-center vh-100'
        //style={{minHeight: "100vh"}}style={{ display: "flex", alignItems: "center" }}
    >
        <div 
            className="w-100"
            style={{maxWidth:"400px"}}
        >
            <Card>
                <Card.Body>   
                    {Googlebuttonlogin()}
                    <p className="text-center mb-3 fs-4">or</p>
                    <h2 className="text-center mb-4">Sign up</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group id="email" className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    // ref={emailRef} 
                                    placeholder="Enter email" 
                                    name="email"
                                    onChange={(e) => {
                                        handleChange(e);
                                        if(isWrongCredentials) setIsWrongCredentials(false);
                                    }}
                                    onBlur={handleBlur}
                                    value={values.email}
                                    className={errors.email && touched.email ? "form-error":""}
                                />
                        {isWrongCredentials && <div className="error-message">Email already in use.</div>}
                         {errors.email && touched.email && <div className="error-message">{errors.email}</div>}
                        </Form.Group>
                        <Form.Group id="password" className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                // ref={passwordRef}
                                // onChange={(event) => setCurrentPassword(event.target.value)} 
                                placeholder="Enter Password" 
                                name="password"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.password}
                                className={errors.password && touched.password ? "form-error":""}
                            />
                            {errors.password && touched.password && <div className="error-message">{errors.password}</div>}
                            <PasswordStrengthBar password={values.password} />
                        </Form.Group>
                        <Form.Group id="confirmPassword" className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                // ref={confirmPasswordRef} 
                                placeholder="Enter Password" 
                                name="confirmPassword"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.confirmPassword}
                                className={errors.confirmPassword && touched.confirmPassword ? "form-error":""}
                            />
                        {errors.confirmPassword && touched.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                        </Form.Group>
                        <Button type="submit" className="w-100">Sign Up</Button>
                    </Form>
                    <div>
                       Already have an account? <NavLink to="/signin">Sign in</NavLink>
                    </div>
                </Card.Body>
            </Card>
        </div>
        </Container>

        <style>
            {`  
              .form-error {
                    border-color: #fc8181 !important;
                }
            .error-message {
                color: red;
            }
            `}
        </style>
    </>
  )
}