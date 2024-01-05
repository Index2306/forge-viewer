import {createAsyncThunk} from "@reduxjs/toolkit";
import api from "@/api";

export const getBuckets = createAsyncThunk(
    'forge/oss/buckets',
    async (payload: any, thunkAPI) => {
        try {
            const response = await api.get(`${payload ? `forge/oss/buckets?id=${payload}` : 'forge/oss/buckets'}`);

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

export const getTokenViewerBucket = createAsyncThunk(
    'forge/oauth/token',
    async (_, thunkAPI) => {
        try {
            const response = await api.get('forge/oauth/token');

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