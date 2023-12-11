import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/api";

export const getTokenViewer = createAsyncThunk(
    'tool/getToken',
    async (payload, thunkAPI) => {
        try {
            const response = await api.get(`v1/user/tool/get-token`);

            if (response.status < 400) {
                return response.data;
            }
            return thunkAPI.rejectWithValue([response.data]);
        } catch (error: any) {
            if ('code' in error && error.code === 'ERR_NETWORK') {
                return thunkAPI.rejectWithValue(['Network Error']);
            }
            return thunkAPI.rejectWithValue(error?.response?.data.errors ?? ['Unknown']);
        }
    }
)

export const changeUnit = createAsyncThunk(
    'tool/changeUnit',
    async (payload: any, thunkAPI) => {
        try {
            const response = await api.post('v1/user/DesignAutomation/change-unit', payload);

            if (response.status < 400) {
                return response.data;
            }
            return thunkAPI.rejectWithValue([response.data]);
        } catch (error: any) {
            if ('code' in error && error.code === 'ERR_NETWORK') {
                return thunkAPI.rejectWithValue(['Network Error']);
            }
            return thunkAPI.rejectWithValue(error?.response?.data.errors ?? ['Unknown']);
        }
    }
)

export const saveFileData = createAsyncThunk(
    'tool/saveFileData',
    async (payload: any, thunkAPI) => {
        try {
            const response = await api.post(`v1/user/tool/save-data/${payload.id}`, { data: JSON.stringify(payload.data) });

            if (response.status < 400) {
                return response.data;
            }
            return thunkAPI.rejectWithValue([response.data]);
        } catch (error: any) {
            if ('code' in error && error.code === 'ERR_NETWORK') {
                return thunkAPI.rejectWithValue(['Network Error']);
            }
            return thunkAPI.rejectWithValue(error?.response?.data.errors ?? ['Unknown']);
        }
    }
)

export const algorithmSupport = createAsyncThunk(
    'tool/wiring',
    async (payload: any, thunkAPI) => {
        try {
            const response = await api.post('v1/user/tool/algorithm-support', {
                data: payload,
                type: 1
            });

            if (response.status < 400) {
                return response.data;
            }
            return thunkAPI.rejectWithValue([response.data]);
        } catch (error: any) {
            if ('code' in error && error.code === 'ERR_NETWORK') {
                return thunkAPI.rejectWithValue(['Network Error']);
            }
            return thunkAPI.rejectWithValue(error?.response?.data.errors ?? ['Unknown']);
        }
    }
)