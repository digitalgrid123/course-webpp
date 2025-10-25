import { CustomAxiosResponse } from "@/types";
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const publicApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

const authApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

authApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      if (!config.headers)
        config.headers = {} as InternalAxiosRequestConfig["headers"];
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

const handleResponse = <T>(
  response: AxiosResponse<CustomAxiosResponse<T>>
): AxiosResponse<CustomAxiosResponse<T>> & CustomAxiosResponse<T> => {
  return Object.assign(response, response.data) as AxiosResponse<
    CustomAxiosResponse<T>
  > &
    CustomAxiosResponse<T>;
};

const handleError = (error: AxiosError<CustomAxiosResponse>) => {
  if (typeof window !== "undefined") {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      localStorage.clear();
      document.cookie =
        "isLogged=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/";
    }
  }
  return Promise.reject(error);
};

publicApi.interceptors.response.use(handleResponse, handleError);
authApi.interceptors.response.use(handleResponse, handleError);

export const apiConnection = {
  public: {
    get: <T>(url: string, config?: InternalAxiosRequestConfig) =>
      publicApi.get<CustomAxiosResponse<T>>(url, config),
    post: <T>(
      url: string,
      data?: unknown,
      config?: InternalAxiosRequestConfig
    ) => publicApi.post<CustomAxiosResponse<T>>(url, data, config),
    put: <T>(
      url: string,
      data?: unknown,
      config?: InternalAxiosRequestConfig
    ) => publicApi.put<CustomAxiosResponse<T>>(url, data, config),
    delete: <T>(url: string, config?: InternalAxiosRequestConfig) =>
      publicApi.delete<CustomAxiosResponse<T>>(url, config),
  },
  auth: {
    get: <T>(url: string, config?: InternalAxiosRequestConfig) =>
      authApi.get<CustomAxiosResponse<T>>(url, config),
    post: <T>(
      url: string,
      data?: unknown,
      config?: InternalAxiosRequestConfig
    ) => authApi.post<CustomAxiosResponse<T>>(url, data, config),
    put: <T>(
      url: string,
      data?: unknown,
      config?: InternalAxiosRequestConfig
    ) => authApi.put<CustomAxiosResponse<T>>(url, data, config),
    delete: <T>(url: string, config?: InternalAxiosRequestConfig) =>
      authApi.delete<CustomAxiosResponse<T>>(url, config),
  },
};
