import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { authSlice } from "@/store/slices/auth.slice";
import { toolSlice } from "@/store/slices/tool/tool.slice";
import { layerSlice } from './slices/tool/layer.slice';

const makeStore = () =>
    configureStore({
        reducer: {
            [authSlice.name]: authSlice.reducer,
            [toolSlice.name]: toolSlice.reducer,
            [layerSlice.name]: layerSlice.reducer,
        },
        devTools: true
    });

export const wrapper = createWrapper(makeStore);

type Store = ReturnType<typeof makeStore>;
export type AppDispatch = Store['dispatch'];
export type RootState = ReturnType<Store['getState']>;