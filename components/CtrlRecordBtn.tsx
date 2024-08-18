import * as React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { red } from '@mui/material/colors';
import Fab from '@mui/material/Fab';
import {
    FiberManualRecord,
    StopCircle,
} from "@mui/icons-material";

export default function CircularIntegration({onRecord, onStop}) {
    const [loading, setLoading] = React.useState(false);
    const [isRecording, setIsRecording] = React.useState(false);
    const timer = React.useRef<ReturnType<typeof setTimeout>>();

    const buttonSx = {
        bgcolor: red[500],
        '&:hover': {
            bgcolor: red[700],
        },
    };

    React.useEffect(() => {
        return () => {
            clearTimeout(timer.current);
        };
    }, []);

    const handleButtonClick = () => {
        if (isRecording) {
            setLoading(false);
            setIsRecording(false);
            onStop();
        } else {
            setLoading(true);
            timer.current = setTimeout(() => {
                setLoading(false);
                setIsRecording(true);
                onRecord()
            }, 2000);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ m: 1, position: 'relative' }}>
                <Fab
                    aria-label="start-stop"
                    color='error'
                    sx={buttonSx}
                    onClick={handleButtonClick}
                >
                    {isRecording ? <StopCircle /> : <FiberManualRecord/>}
                </Fab>
                {loading && (
                    <CircularProgress
                        size={68}
                        sx={{
                            color: red[500],
                            position: 'absolute',
                            top: -6,
                            left: -6,
                            zIndex: 1,
                        }}
                    />
                )}
            </Box>
        </Box>
    );
}