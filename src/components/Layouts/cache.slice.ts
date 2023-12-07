import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "@/store/store";

const initialState: any = {
    thumbnail: {}
};

export const cacheSlice = createSlice({
    name: 'cache',
    initialState,
    reducers: {
        clearCache(state) {
            state = {
                thumbnail: {}
            }
        },
        addCache(state, {payload}) {
            delete state.thumbnail[payload];
            state.thumbnail = {
                ...state.thumbnail,
                [payload.key]: payload.data
            }
            // state[payload.key] = payload.data;
        },
        removeCache(state, {payload}) {
            delete state.thumbnail[payload];
        }
    }
});

export const selectCache = (state: RootState) => state.cache;

export const { clearCache, addCache, removeCache } = cacheSlice.actions

export default cacheSlice.reducer;