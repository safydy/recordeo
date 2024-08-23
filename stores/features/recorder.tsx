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
    recorderRef: MediaRecorder | null,
    recordedBlob: Blob | null,
    combinedStream: MediaStream | null,
    webcam: {
        dimension: IDimension
        position: CategoricalPositionType,
        stream: MediaStream | null,
    },
    screen: {
        dimension: IDimension,
        stream: MediaStream | null,
    },
    canvas: {
        dimension: IDimension,
        ref: HTMLVideoElement | null,
    }
}

const initialState: RecorderState = {
    status: "initialized",
    recorderRef: null,
    recordedBlob: null,
    combinedStream: null,
    webcam: {
        dimension: {
            width: 64,
            height: 64,
        },
        position: "top-left",
        stream: null,
    },
    screen: {
        dimension: {
            width: 1024,
            height: 768,
        },
        stream: null,
    },
    canvas: {
        dimension: {
            width: 1024,
            height: 768,
        },
        ref: null,
    }
}

export const recorderSlice = createSlice({
    name: "recorder",
    initialState,
    reducers: {
        updateStatus: (state, action: PayloadAction<RecordingStatusType>) => {
            state.status = action.payload
        },
        updateRecorderRef: (state, action: PayloadAction<MediaRecorder | null>) => {
            state.recorderRef = action.payload
        },
        webcamUpdateDimensions: (state, action: PayloadAction<IDimension>) => {
            state.webcam.dimension = action.payload
        },
        webcamUpdatePosition: (state, action: PayloadAction<CategoricalPositionType>) => {
            state.webcam.position = action.payload
        },
        webcamUpdateStream: (state, action: PayloadAction<MediaStream | null>) => {
            state.webcam.stream = action.payload
        },
        screenUpdateDimensions: (state, action: PayloadAction<IDimension>) => {
            state.screen.dimension = action.payload
        },
        screenUpdateStream: (state, action: PayloadAction<MediaStream | null>) => {
            state.screen.stream = action.payload
        },
        canvasUpdateRef: (state, action: PayloadAction<HTMLCanvasElement | null>) => {
            state.canvas.ref = action.payload
        },
        canvasUpdateDimensions: (state, action: PayloadAction<IDimension>) => {
            state.canvas.dimension = action.payload
        },
        combineStreams: (state) => {
            const canvas = state.canvas.ref;
            if (!canvas) {
                console.error('Canvas ref not defined');
                return;
            }

            const screenVideo = document.createElement('video');
            screenVideo.srcObject = state.screen.stream;
            screenVideo.play();

            const webcamVideo = document.createElement('video');
            webcamVideo.srcObject = state.webcam.stream;
            webcamVideo.play();

            const context = canvas.getContext('2d');
            if (!context) return;

            const draw = () => {
                context.drawImage(screenVideo, 0, 0, state.canvas.dimension.width, state.canvas.dimension.height);
                const avatarRadius = state.webcam.dimension.width / 2; // Radius of the circle
                const x = state.webcam.position.x;
                const y = state.webcam.position.y;
                circleClip(context, x, y, avatarRadius, () => {
                    context.drawImage(webcamVideo, x, y, state.webcam.dimension.width, state.webcam.dimension.height);
                })

                requestAnimationFrame(draw);
            };

            draw();
            state.combinedStream = canvas.captureStream();
        },
        stopRecording: (state, action: PayloadAction<{shouldSetBlob: boolean}>) => {
            if (state.recorderRef) {
                state.recorderRef.stopRecording(() => {
                    state.screen.stream?.getTracks().forEach(track => track.stop());
                    state.webcam.stream?.getTracks().forEach(track => track.stop());
                    state.combinedStream?.getTracks().forEach(track => track.stop());

                    if (action.payload.shouldSetBlob) {
                        state.recordedBlob = state.recorderRef?.getBlob();
                    }
                    state.status = "stopped";
                });
            }
        },
    },
})

export const {
    updateStatus,
    updateRecorderRef,
    webcamUpdateDimensions,
    webcamUpdatePosition,
    webcamUpdateStream,
    screenUpdateDimensions,
    screenUpdateStream,
    combineStreams,
    stopRecording,
    canvasUpdateRef,
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
export const getCanvasRef = (state: RootState) => state.recorder.canvas.ref
export const getCombinedStream = (state: RootState) => state.recorder.combinedStream
export const getRecordedBlob = (state: RootState) => state.recorder.recordedBlob

/**
 * ######## Thunks #######
 * which can contain both sync and async logic
 * that has access to both `dispatch` and `getState`. They can be dispatched like
 * Eg: check here https://codesandbox.io/p/sandbox/github/reduxjs/redux-templates/tree/master/packages/rtk-app-structure-example?file=%2Fsrc%2Ffeatures%2Fcounter%2FcounterSlice.ts%3A81%2C27&from-embed=
 * #######################
 */
export const setScreenStream = (): AppThunk => async (dispatch, getState) => {
    try {
        const displayMediaOptions: MediaStreamConstraints = {
            video: true,
        };

        // For selecting a specific window, you can use the following:
        // displayMediaOptions.video = { mediaSource: 'window' };

        const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        dispatch(screenUpdateStream(stream));
    } catch (error) {
        console.error('Error capturing screen:', error);
        dispatch(screenUpdateStream(null));
    }
}

export const setWebcamStream = (): AppThunk => async (dispatch, getState) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        dispatch(webcamUpdateStream(stream));
    } catch (error) {
        console.error('Error capturing webcam:', error);
        dispatch(webcamUpdateStream(null));
    }
}