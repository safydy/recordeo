'use client';

import React, { useState, useRef, useEffect } from 'react';
import RecordRTC from 'recordrtc';
import Box from "@mui/material/Box";
import RecordControlButtons from "./RecordControlButtons";
import ConfigPanel from "@/components/ConfigPanel";
import {circleClip} from "@/utils/shapeDrawer";

interface RecorderProps {
    // Potential props for customization
}

const Recorder: React.FC<RecorderProps> = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const webcamRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [avatarPosition, setAvatarPosition] = useState({ x: 32, y: 32 });
    const recorderRef = useRef<MediaRecorder | null>(null);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

    const startRecording = async () => {
        try {
            const currentScreenStream = await getScreenStream();
            const currentWebcamStream = await navigator.mediaDevices.getUserMedia({ video: true });

            setScreenStream(currentScreenStream);
            setWebcamStream(currentWebcamStream);

            const combinedStream = combineStreams(currentScreenStream, currentWebcamStream);
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

    const combineStreams = (currentScreenStream, currentWebcamStream) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const screenVideo = document.createElement('video');
        screenVideo.srcObject = currentScreenStream;
        screenVideo.play();

        const webcamVideo = document.createElement('video');
        webcamVideo.srcObject = currentWebcamStream;
        webcamVideo.play();

        const context = canvas.getContext('2d');
        if (!context) return;

        const draw = () => {
            context.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);

            const webcamWidth = 64;
            const webcamHeight = 64;
            const avatarRadius = webcamWidth / 2; // Radius of the circle
            circleClip(context, avatarPosition.x, avatarPosition.y, avatarRadius, () => {
                context.drawImage(webcamVideo, avatarPosition.x, avatarPosition.y, webcamWidth, webcamHeight);
            })

            requestAnimationFrame(draw);
        };

        draw();
        return canvas.captureStream();
    };

    const stopRecording = () => {
        if (recorderRef.current) {
            recorderRef.current.stopRecording(() => {
                screenStream.stop();
                webcamStream.stop();

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

                <RecordControlButtons onRecord={startRecording} onStop={stopRecording}/>
                <ConfigPanel/>
                {recordedBlob && <video src={URL.createObjectURL(recordedBlob)} controls/>}
            </Box>
        </>
    );
};

export default Recorder;