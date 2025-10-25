import { apiConnection } from "@/services/apiConnection";
import {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
  SendOtpCredentials,
  SendOtpResponse,
  VerifyOtpCredentials,
  VerifyOtpResponse,
} from "@/types";

export const loginApi = (credentials: LoginCredentials) => {
  return apiConnection.auth
    .post("/login", credentials)
    .then((response) => response as unknown as LoginResponse);
};

export const registerApi = (credentials: RegisterCredentials) => {
  return apiConnection.auth
    .post("/register", credentials)
    .then((response) => response as unknown as RegisterResponse);
};

export const sendOtpApi = (credentials: SendOtpCredentials) => {
  return apiConnection.auth
    .post("/send-otp", credentials)
    .then((response) => response as unknown as SendOtpResponse);
};

export const verifyOtpApi = (credentials: VerifyOtpCredentials) => {
  return apiConnection.auth
    .post("/verify-otp", credentials)
    .then((response) => response as unknown as VerifyOtpResponse);
};
