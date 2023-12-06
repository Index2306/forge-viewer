import axios, {
    AxiosError, AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig
} from "axios";
import Cookies  from 'js-cookie';
import {debug} from "@/helpers/Logger";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Request Interceptor
const onRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const { method, url, headers } = config;
    // Set Headers Here
    // Check Authentication Here
    // Set Loading Start Here
    debug(`🚀 [HOST] ${API_URL} | [API] ${method?.toUpperCase()} ${url} | Request`);

    const token = Cookies.get('access_token');
    const locale = Cookies.get('app_locale');
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    if (locale) {
        headers['Accept-Language'] = locale;
    }

    return config;
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
    const { method, url } = response.config;
    const { status } = response;
    // Set Loading End Here
    // Handle Response Data Here
    // Error Handling When Return Success with Error Code Here
    debug(`🚀 [API] ${method?.toUpperCase()} ${url} | Response ${status}`);
    return response;
};

const onErrorResponse = (error: AxiosError | Error): Promise<AxiosError> => {
    if (axios.isAxiosError(error)) {
        const { message } = error;
        const { method, url } = error.config as AxiosRequestConfig;
        const { status } = error.response as AxiosResponse ?? {};

        debug(
            `🚨 [API] ${method?.toUpperCase()} ${url} | Error ${status} ${message}`
        );

        if (status === 401) {
            // "Login required"
            // Delete Token & Go To Login Page if you required.
            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            Cookies.remove('expire');
            Cookies.remove('user');
            window.location.href = '/auth/logout';
        }
    } else {
        debug(`🚨 [API] | Error ${error.message}`);
    }

    return Promise.reject(error);
};

const setupInterceptors = (instance: AxiosInstance): AxiosInstance => {
    instance.interceptors.request.use(onRequest, onErrorResponse);
    instance.interceptors.response.use(onResponse, onErrorResponse);
    return instance;
};


const axiosClient = setupInterceptors(axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
}));

export default axiosClient;