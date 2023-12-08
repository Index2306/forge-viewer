import {createAsyncThunk} from "@reduxjs/toolkit";
import api, {configMetadata} from "@/api";

export const uploadFileToProject = createAsyncThunk(
    'file/upload',
    async (payload: any, thunkAPI) => {
        try {
            const response = await api.post(`v1/user/file/${payload.data.projectId}`, payload.data.data, {
                ...configMetadata,
                ...payload.config
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

export const getFileById = createAsyncThunk(
    'file/getById',
    async (payload: any, thunkAPI) => {
        try {
            const response = await api.get(`v1/user/file/831e056d-370b-4511-98fb-be8d3dbc26ff/${payload}`);

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

export const getAllfile = createAsyncThunk(
    'file/getAll',
    async (_, thunkAPI) => {
        try {
            const response = await api.get(`v1/user/Project/831e056d-370b-4511-98fb-be8d3dbc26ff`);

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