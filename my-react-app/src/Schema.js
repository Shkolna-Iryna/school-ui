import Password from "@mui/icons-material/Password";
import * as yup from "yup"

const regExpEmail = /^[\w.-]+@[\w.-]+\.\w{2,6}$/;


export const SchemaLogin = yup.object().shape({
    email: yup.string().required("Поле є обов'язковим").matches(regExpEmail, "Неправильний формати пошти"),
    password: yup.string().required("Поле є обов'язковим").min(6, "Необхідно мінімум шість символів")
})
    
export const Schema = yup.object().shape({
    name: yup.string().trim().required("Поле є обов'язковим").min(2, "Необхідно мінімум два символи"),
    email: yup.string().required("Поле є обов'язковим").matches(regExpEmail, "Неправильний формати пошти"),
    password: yup.string().required("Поле є обов'язковим").min(6, "Необхідно мінімум шість символів")

})