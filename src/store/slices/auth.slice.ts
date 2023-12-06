import {createSlice} from '@reduxjs/toolkit';
import {login} from "@/store/actions/auth.action";
import Cookies from 'js-cookie';
import {AuthModel, LoginResult} from "@/models";
import {RootState} from "@/store/store";

const initialState: AuthModel = {
    data: undefined,
    isError: false,
    isFetching: false,
    isSuccess: false,
    errorMessage: [],
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logoutAuthAction(state) {
            state.data = undefined;
            state.isError = false;
            state.isFetching = false;
            state.isSuccess = false;
            state.errorMessage = [];

            Cookies.remove('access_token');
            Cookies.remove('refresh_token');
            Cookies.remove('expire');
            Cookies.remove('user');
        },
        clearAuth(state) {
            state.data = undefined;
            state.isError = false;
            state.isFetching = false;
            state.isSuccess = false;
            state.errorMessage = [];
        }
    },
    extraReducers: (builder) => {
        builder.addCase(login.pending, (state, action) => {
            state.isFetching = true;
            state.isSuccess = false;
            state.isError = false;
            state.errorMessage = [];
        }).addCase(login.fulfilled, (state, {payload}) => {
            state.isFetching = false;
            state.isError = false;
            state.isSuccess = true;
            state.errorMessage = [];
            state.data = payload.result as LoginResult;

            // set data to cookie
            Cookies.set('access_token', payload.result.accessToken);
            Cookies.set('refresh_token', payload.result.refreshToken);
            Cookies.set('expire', payload.result.exp);
            Cookies.set('user', JSON.stringify(payload.result.user));
        }).addCase(login.rejected, (state, {payload}) => {
            state.isFetching = false;
            state.isSuccess = false;
            state.isError = true;
            state.errorMessage = payload as string[];
        })
    },
});

export const selectAuth = (state: RootState) => state.auth;

export const { clearAuth, logoutAuthAction } = authSlice.actions

export default authSlice.reducer;
