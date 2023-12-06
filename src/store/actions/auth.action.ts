import {createAsyncThunk} from "@reduxjs/toolkit";
import {LoginModel, RegisterModel} from "@/models";
import api from "@/api";

export const login = createAsyncThunk(
    'login',
    async (userLogin: LoginModel, thunkAPI) => {
        try {
            const response = await api.post('v1/auth/signin', userLogin)
            if (response.status < 400) {
                return response.data;
            }
            return thunkAPI.rejectWithValue([response.data]);
        } catch (error: any) {
            if ('code' in error && error.code === 'ERR_NETWORK') {
                return thunkAPI.rejectWithValue(['Network error!']);
            }
            return thunkAPI.rejectWithValue(error?.response?.data?.errors ?? ['Network error!']);
        }
    }
)

export const register = createAsyncThunk(
    'register',
    async (userRegister: RegisterModel, thunkAPI) => {
        try {
            const response = await api.post('v1/Auth/signup', userRegister)
            if (response.status < 400) {
                return response.data;
            }
            return thunkAPI.rejectWithValue([response.data]);
        } catch (error: any) {
            if ('code' in error && error.code === 'ERR_NETWORK') {
                return thunkAPI.rejectWithValue(['Network error!']);
            }
            return thunkAPI.rejectWithValue(error?.response?.data?.errors ?? ['Network error!']);
        }
    }
)