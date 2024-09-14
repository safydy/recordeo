'use client';
import RecordRTC from 'recordrtc';
import React, { useState, useRef } from 'react';
import Box from "@mui/material/Box";
import RecordControlButtons from "./RecordControlButtons";
import ConfigPanel from "@/components/ConfigPanel";
import {
    getStatus,
    getScreenDimension,
    getWebcamDimension,
    getWebcamPosition,
    getCanvasDimension,
    updateStatus,
    getWebcamXYPositions,
} from "@/stores/features/recorder";
import { useAppSelector, useAppDispatch } from "@/utils/storeHooks";
import {circleClip} from "@/utils/shapeDrawer";

interface RecorderProps {
    // Potential props for customization
}

const Recorder: React.FC<RecorderProps> = () => {
    const recordingStatus = useAppSelector(getStatus);
    let isDrawing = false;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasDimension = useAppSelector(getCanvasDimension);

    const screenDimension = useAppSelector(getScreenDimension);

    const webcamDimension = useAppSelector(getWebcamDimension);
    const webcamXYPositions = useAppSelector(getWebcamXYPositions);

    const recorderRef = useRef<MediaRecorder | null>(null);
    // Pay attention, useState is async, so you can't rely on the value immediately after setting it
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
    const [combinedStream, setCombinedStream] = useState<{stream: MediaStream | null, stopDrawing: () => void}>(null);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

    const dispatch = useAppDispatch();

    const handleStartRecording = async () => {
        try {
            console.debug('starting recording ...')
            dispatch(updateStatus("recording"));
            const currentScreenStream = await getNewScreenStream() as MediaStream;
            const currentWebcamStream = await getNewWebcamStream() as MediaStream;
            setScreenStream(currentScreenStream);
            setWebcamStream(currentWebcamStream);

            const currentCombinedStream = getCombinedStreams(currentScreenStream, currentWebcamStream);
            setCombinedStream(currentCombinedStream);

            if (!currentCombinedStream) {
                console.error('no combined stream found');
                return;
            }

            const recorder = RecordRTC(currentCombinedStream.stream, {type: 'video'});
            recorderRef.current = recorder;
            recorder.startRecording();
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    }

    /**
     * Combines the screen and webcam streams into a single stream
     * Refs cannot be put in Redux, so we have to declare this in the component instead
     */
    const getCombinedStreams = (currentScreenStream: MediaStream, currentWebcamStream: MediaStream) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error('Canvas ref not defined');
            return;
        }

        const screenVideo = document.createElement('video');
        screenVideo.srcObject = currentScreenStream as MediaStream;
        screenVideo.play();

        const webcamVideo = document.createElement('video');
        webcamVideo.srcObject = currentWebcamStream as MediaStream;
        webcamVideo.play();

        const context = canvas.getContext('2d');
        if (!context) return;

        // Provide a way to stop the drawing loop recursion
        const stopDrawing = () => {
            isDrawing = false;
        };

        const draw = () => {
            if (!isDrawing) {
                // Stop the loop created by requestAnimationFrame()
                return;
            }
            console.debug('drawing combined streams ...', {
                isDrawing,
                recordingStatus,
            });
            context.drawImage(screenVideo, 0, 0, canvasDimension.width, canvasDimension.height);
            const avatarRadius = webcamDimension.width / 2; // Radius of the circle
            const { x, y } = webcamXYPositions;
            circleClip(context, x, y, avatarRadius, () => {
                context.drawImage(webcamVideo, x, y, webcamDimension.width, webcamDimension.height);
            })

            requestAnimationFrame(draw);
        };

        isDrawing = true;
        draw();

        return {
            stream: canvas.captureStream(),
            stopDrawing,
        };
    }

    const handleStopRecording = (action: {shouldSetBlob: boolean} = {shouldSetBlob: true}) => {
        if (recorderRef.current) {
            recorderRef.current.stopRecording(() => {
                screenStream?.getTracks().forEach(track => track.stop());
                webcamStream?.getTracks().forEach(track => track.stop());
                combinedStream.stream?.getTracks().forEach(track => track.stop());

                combinedStream.stopDrawing();

                if (action.shouldSetBlob) {
                    setRecordedBlob(recorderRef.current?.getBlob());
                }

                console.debug('recording stopped', {
                    isDrawing,
                    recordingStatus,
                })
                dispatch(updateStatus("stopped"));
            });
        }
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

export const getNewScreenStream = async () => {
    try {
        const displayMediaOptions: MediaStreamConstraints = {
            video: true,
        };

        // For selecting a specific window, you can use the following:
        // displayMediaOptions.video = { mediaSource: 'window' };

        const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        return stream;
    } catch (error) {
        console.error('Error capturing screen:', error);
        return null;
    }
}

export const getNewWebcamStream = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        return stream;
    } catch (error) {
        console.error('Error capturing webcam:', error);
        return null;
    }
}