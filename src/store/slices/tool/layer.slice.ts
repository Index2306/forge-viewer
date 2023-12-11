import {RootState} from "@/store/store";
import {createSlice} from "@reduxjs/toolkit";
import {LayerItemList, LayerItemModel} from "@/models";
import {LayerKey, LayerStatus} from "@/contants/tool";

const initialState: LayerItemList = {
    layerList: [
        { key: LayerKey.ROOMS, status: LayerStatus.OPEN },
        { key: LayerKey.SMOKE_DETECTOR, status: LayerStatus.OPEN },
        { key: LayerKey.WIRING, status: LayerStatus.OPEN },
        { key: LayerKey.MANUAL_CALL_POINT, status: LayerStatus.OPEN },
        { key: LayerKey.DOORS, status: LayerStatus.CLOSE },
        { key: LayerKey.FIRE_COMPARTMENTS, status: LayerStatus.CLOSE },
        { key: LayerKey.ALARM_AREAS, status: LayerStatus.CLOSE },
    ],
    isLayerToolActive: false,
    activeLayer: null
}

export const layerSlice = createSlice({
    name: 'layer',
    initialState,
    reducers: {
        clearLayer: (state) => {
            state.layerList = [
                { key: LayerKey.ROOMS, status: LayerStatus.OPEN },
                { key: LayerKey.SMOKE_DETECTOR, status: LayerStatus.OPEN },
                { key: LayerKey.WIRING, status: LayerStatus.OPEN },
                { key: LayerKey.MANUAL_CALL_POINT, status: LayerStatus.OPEN },
                { key: LayerKey.DOORS, status: LayerStatus.CLOSE },
                { key: LayerKey.FIRE_COMPARTMENTS, status: LayerStatus.CLOSE },
                { key: LayerKey.ALARM_AREAS, status: LayerStatus.CLOSE },
            ]
            state.isLayerToolActive = false
        },
        changeActiveLayerTool: (state, { payload }) => {
            state.isLayerToolActive = payload;
        },
        changeStatusAll: (state, { payload }) => {
            state.layerList = [...state.layerList].map((val: LayerItemModel) => ({...val, status: payload}))
        },
        changeStatusKey: (state, {payload}) => {
            const index = state.layerList.findIndex(f => `${f.key}` === `${payload.key}`);
            if (index > -1) {
                state.layerList[index] = {
                    ...state.layerList[index],
                    status: payload.status
                }
            }
        },
        changeSelectedStatusKeyExceptOthers: (state, { payload }) => {
            state.layerList = [...state.layerList].map(l => {
                if (l.key === payload.key) {
                    return {...l, status: payload.status}
                }
                return {...l, status: LayerStatus.CLOSE}
            })
        },
        changeLayerList: (state, {payload}) => {
            state.layerList = [...payload]
        },
        changeGroupSelectedStatusKeysExceptOthers: (state, { payload }) => {
            const arr = [...state.layerList].map(l => {
                if (payload.includes(l.key)) {
                    return {...l, status: LayerStatus.OPEN}
                }
                return {...l, status: LayerStatus.CLOSE}
            })

            state.layerList = arr
        }
    },
});

export const selectLayer = (state: RootState) => state.layer;

export const {
    clearLayer,
    changeActiveLayerTool,
    changeStatusAll,
    changeStatusKey,
    changeSelectedStatusKeyExceptOthers,
    changeGroupSelectedStatusKeysExceptOthers,
    changeLayerList,
} = layerSlice.actions

export default layerSlice.reducer;