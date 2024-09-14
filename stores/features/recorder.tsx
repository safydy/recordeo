import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState, AppThunk } from "@/stores/store"
import {circleClip} from "@/utils/shapeDrawer";

export interface IDimension {
    height: number
    width: number
}

export type CategoricalPositionType = "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
export type RecordingStatusType = "initialized" | "recording" | "paused" | "stopped" | "error" | "finished"

export interface RecorderState {
    status: RecordingStatusType
    webcam: {
        dimension: IDimension
        position: CategoricalPositionType,
    },
    screen: {
        dimension: IDimension,
    },
    canvas: {
        dimension: IDimension,
    }
}

const initialState: RecorderState = {
    status: "initialized",
    webcam: {
        dimension: {
            width: 64,
            height: 64,
        },
        position: "top-left",
    },
    screen: {
        dimension: {
            width: 1024,
            height: 768,
        },
    },
    canvas: {
        dimension: {
            width: 1024,
            height: 768,
        },
    }
}

export const recorderSlice = createSlice({
    name: "recorder",
    initialState,
    reducers: {
        updateStatus: (state, action: PayloadAction<RecordingStatusType>) => {
            state.status = action.payload
        },
        webcamUpdateDimensions: (state, action: PayloadAction<IDimension>) => {
            state.webcam.dimension = action.payload
        },
        webcamUpdatePosition: (state, action: PayloadAction<CategoricalPositionType>) => {
            state.webcam.position = action.payload
        },
        screenUpdateDimensions: (state, action: PayloadAction<IDimension>) => {
            state.screen.dimension = action.payload
        },
        canvasUpdateDimensions: (state, action: PayloadAction<IDimension>) => {
            state.canvas.dimension = action.payload
        },
    },
})

export const {
    updateStatus,
    webcamUpdateDimensions,
    webcamUpdatePosition,
    screenUpdateDimensions,
    canvasUpdateDimensions,
} = recorderSlice.actions

export default recorderSlice.reducer

/**
 * ############# Selectors ############
 * Selector functions allows us to select a value from the Redux root state.
 * Selectors can also be defined inline in the `useSelector` call
 * in a component, or inside the `createSlice.selectors` field.
 */
export const getStatus = (state: RootState) => state.recorder.status
export const getWebcamDimension = (state: RootState) => state.recorder.webcam.dimension
export const getWebcamPosition = (state: RootState) => state.recorder.webcam.position
export const getScreenDimension = (state: RootState) => state.recorder.screen.dimension
export const getCanvasDimension = (state: RootState) => state.recorder.canvas.dimension

export const getWebcamXYPositions = (state: RootState) => {
    const { width: screenWidth, height: screenHeight } = state.recorder.screen.dimension;
    const { width: webcamWidth, height: webcamHeight } = state.recorder.webcam.dimension;
    const margin = 10;

    switch (state.recorder.webcam.position) {
        case 'top':
            return { x: (screenWidth - webcamWidth) / 2, y: margin };
        case 'bottom':
            return { x: (screenWidth - webcamWidth) / 2, y: screenHeight - webcamHeight - margin };
        case 'left':
            return { x: margin, y: (screenHeight - webcamHeight) / 2 };
        case 'right':
            return { x: screenWidth - webcamWidth - margin, y: (screenHeight - webcamHeight) / 2 };
        case 'top-left':
            return { x: margin, y: margin };
        case 'top-right':
            return { x: screenWidth - webcamWidth - margin, y: margin };
        case 'bottom-left':
            return { x: margin, y: screenHeight - webcamHeight - margin };
        case 'bottom-right':
            return { x: screenWidth - webcamWidth - margin, y: screenHeight - webcamHeight - margin };
        default:
            return undefined;
            throw new Error(`Invalid categorical position: ${state.recorder.webcam.position}`);
    }
}
/**
 * ######## Thunks #######
 * which can contain both sync and async logic
 * that has access to both `dispatch` and `getState`. They can be dispatched like
 * Eg: check here https://codesandbox.io/p/sandbox/github/reduxjs/redux-templates/tree/master/packages/rtk-app-structure-example?file=%2Fsrc%2Ffeatures%2Fcounter%2FcounterSlice.ts%3A81%2C27&from-embed=
 * #######################
 */