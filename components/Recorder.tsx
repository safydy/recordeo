'use client';
import { useSelector, useDispatch } from 'react-redux';
import RecordRTC from 'recordrtc';
import React, { useState, useRef, useEffect } from 'react';
import Box from "@mui/material/Box";
import RecordControlButtons from "./RecordControlButtons";
import ConfigPanel from "@/components/ConfigPanel";
import {
    getScreenDimension,
    getCanvasRef,
    getRecordedBlob,
    getCombinedStream,
    stopRecording,
    setScreenStream,
    setWebcamStream,
    combineStreams,
    updateRecorderRef,
    updateStatus,
    canvasUpdateRef,
} from "@/stores/features/recorder";
import { useAppSelector, useAppDispatch } from "@/utils/storeHooks";

interface RecorderProps {
    // Potential props for customization
}

const Recorder: React.FC<RecorderProps> = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const screenDimension = useAppSelector(getScreenDimension);
    const combinedStream = useAppSelector(getCombinedStream);
    const recordedBlob = useAppSelector(getRecordedBlob);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (canvasRef.current) {
            dispatch(canvasUpdateRef(canvasRef.current));
        }
    }, [canvasRef]);

    const handleStartRecording = async () => {
        await dispatch(setScreenStream());
        await dispatch(setWebcamStream());
        await dispatch(combineStreams());

        if (!combinedStream) {
            console.error('no combined stream found');
            return;
        }

        const recorder = RecordRTC(combinedStream, { type: 'video' });
        dispatch(updateRecorderRef(recorder))
        recorder.startRecording();

        dispatch(updateStatus("recording"));
    }

    const handleStopRecording = () => {
        dispatch(stopRecording({shouldSetBlob: true}))
    }

    return (
        <>
            <Box className="recorder">
                {/* Screen recording element */}
                {/*<video ref={videoRef} autoPlay></video>*/}

                {/* Canvas for combining streams */}
                <canvas ref={canvasRef} width={screenDimension.width} height={screenDimension.height}/>

                <RecordControlButtons onRecord={handleStartRecording} onStop={handleStopRecording}/>
                <ConfigPanel/>
                {recordedBlob && <video src={URL.createObjectURL(recordedBlob)} controls/>}
            </Box>
        </>
    );
};

export default Recorder;