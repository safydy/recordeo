'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, IconButton, Avatar, Stack } from '@mui/material';
import RecordRTC from 'recordrtc';
import Box from "@mui/material/Box";
import {
    FiberManualRecord,
    StopCircle,
    Pause,
    SaveAlt,
} from "@mui/icons-material";

interface RecorderProps {
    // Potential props for customization
}

const Recorder: React.FC<RecorderProps> = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const webcamRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [avatarPosition, setAvatarPosition] = useState({ x: 10, y: 10 });
    const recorderRef = useRef<MediaRecorder | null>(null);

    const startRecording = async () => {
        try {
            const screenStream = await getScreenStream();
            const webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });

            const combinedStream = combineStreams(screenStream, webcamStream);
            if (!combinedStream) return;

            const recorder = RecordRTC(combinedStream, { type: 'video' });
            recorderRef.current = recorder;
            recorder.startRecording();

            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    async function getScreenStream() {
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

    const combineStreams = (screenStream, webcamStream) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const screenVideo = document.createElement('video');
        screenVideo.srcObject = screenStream;
        screenVideo.play();

        const webcamVideo = document.createElement('video');
        webcamVideo.srcObject = webcamStream;
        webcamVideo.play();

        const context = canvas.getContext('2d');
        if (!context) return;

        const draw = () => {
            context.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
            context.drawImage(webcamVideo, avatarPosition.x, avatarPosition.y, 64, 64); // Adjust dimensions and position
            requestAnimationFrame(draw);
        };

        draw();
        return canvas.captureStream();
    };

    const stopRecording = () => {
        if (recorderRef.current) {
            recorderRef.current.stopRecording(() => {
                setRecordedBlob(recorderRef.current.getBlob());
                setIsRecording(false);
            });
        }
    };

    return (
        <>
            <Box className="recorder">
                {/* Screen recording element */}
                <video ref={videoRef} autoPlay></video>

                {/* Canvas for combining streams */}
                <canvas ref={canvasRef} width={640} height={480}/>

                <Box>
                    <IconButton color="secondary" onClick={startRecording} sx={{mr: 1}} size="large">
                        <FiberManualRecord/>
                    </IconButton>
                    <IconButton color="primary" onClick={stopRecording} size="large">
                        <StopCircle/>
                    </IconButton>
                    <IconButton color="primary" size="large">
                        <Pause/>
                    </IconButton>
                    <IconButton color="primary" size="large">
                        <SaveAlt/>
                    </IconButton>
                </Box>

                {recordedBlob && <video src={URL.createObjectURL(recordedBlob)} controls/>}
            </Box>
        </>
    );
};

export default Recorder;