import { useState} from 'react';
import {Form, Button, Card} from 'react-bootstrap';
import { Container } from 'react-bootstrap';
import { NavLink} from "react-router-dom";
import Googlebuttonlogin from '../common/Googlebutton.tsx';
import {useAuth} from "../../contexts/AuthContext.tsx";
import { useFormik } from 'formik';
import { SignInSchema } from '../../schemas/AuthSchemas.tsx';

export default function Signin() {

    const {signInWithEmailPassword} = useAuth();
    const [isWrongCredentials, setIsWrongCredentials] = useState<string | null>(null);

    const signIn = async (validEmail: string, validPassword: string) => {
        // event.preventDefault();
        try{
            if(validEmail && validPassword){
                await signInWithEmailPassword(validEmail, validPassword);
                //console.log("Successfully signed in. Signed in as ", auth.currentUser?.email, "\nUserinfo: ", userInfo);
                values.email = "";
                values.password ="";
                setIsWrongCredentials(null);
            }
        } catch (error: any) {
            //console.error("Failed to sign in: ", error);
            console.log(error.code);
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setIsWrongCredentials(error.code);
            }
        }
    };

    const {values, handleChange, handleSubmit, errors, touched, handleBlur} = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: SignInSchema,
        onSubmit: (values) => {
            signIn(values.email, values.password)
        },
    });

    return (
        <>
        <Container 
         className='d-flex align-items-center justify-content-center vh-100'
        //style={{minHeight: "100vh"}}
            >
            <div 
            className="w-100"
            style={{maxWidth:"400px"}}
            >
                <Card>
                    <Card.Body>
                        {Googlebuttonlogin()}
                        <p className="text-center mb-3 fs-4">or</p>
                        <h2 className="text-center mb-4">Sign in</h2>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group id="signinemail" className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    // ref={emailRef} 
                                    placeholder="Enter email" 
                                    name="email"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.email}
                                    className={errors.email && touched.email ? "form-error":""}
                                />
                                {errors.email && touched.email && <div className="error-message">{errors.email}</div>}
                            </Form.Group>
                            <Form.Group id="signinpassword" className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control 
                                    type="password" 
                                    // ref={passwordRef} 
                                    placeholder="Enter Password" 
                                    name="password"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.password}
                                    className={errors.password && touched.password ? "form-error":""}
                                />
                                {errors.password && touched.password && <div className="error-message">{errors.password}</div>}
                            </Form.Group>
                            <Button type="submit" className="w-100">Sign in</Button>
                        </Form>
                        <div>Don't have an account? <NavLink to="/signup">Sign up</NavLink></div>
                    </Card.Body>
                    {isWrongCredentials && <div className="error-message">Incorrect credentials! Please try again.</div>}
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