import * as yup from "yup";

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

export const SignUpSchema = yup.object().shape({
    email: yup
        .string()
        .email("Invalid email.")
        .required("Required"),
    password: yup
        .string()
        .min(6)
        .matches(passwordRegex, {message: "Invalid password."})
        .required("Required"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords do not match!")
        .required("Required"),
});


export const SignInSchema = yup.object().shape({
    email: yup
        .string()
        .email("Invalid email.")
        .required("Required"),
    password: yup
        .string()
        .min(6)
        .matches(passwordRegex, {message: "Invalid password."})
        .required("Required"),
});