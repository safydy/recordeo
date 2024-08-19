import {
    Drawer,
    Fab,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
} from '@mui/material';
import Box from "@mui/material/Box";
import {
    Settings as SettingsIcon
} from "@mui/icons-material";
import * as React from "react";

export default function ConfigPanel() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [avatarPosition, setAvatarPosition] = React.useState('bottom-right');

    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    }

    const handleAvatarPositionChange = (event: SelectChangeEvent<{ value: string }>) => {
        setAvatarPosition(event.target.value as string);
    }

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'absolute', right: 5, top: '50%'}}>
                <Box sx={{ m: 1, position: 'relative' }}>
                    <Fab
                        aria-label="setting"
                        color='primary'
                        onClick={toggleDrawer}
                    >
                        <SettingsIcon />
                    </Fab>
                </Box>
            </Box>
            <Drawer open={isOpen} anchor='right' onClose={toggleDrawer}>
                <Box sx={{padding: 2, minWidth: 350}}>
                    <FormControl fullWidth>
                        <InputLabel id="avatar-position-select-label">Avatar Position</InputLabel>
                        <Select
                            labelId="avatar-position-select-label"
                            id="avatar-position-select"
                            value={avatarPosition}
                            label="Age"
                            onChange={handleAvatarPositionChange}
                        >
                            <MenuItem value='top-left'>Top Left</MenuItem>
                            <MenuItem value='top'>Top</MenuItem>
                            <MenuItem value='top-right'>Top Right</MenuItem>
                            <MenuItem value='bottom-left'>Bottom Left</MenuItem>
                            <MenuItem value='bottom'>Bottom</MenuItem>
                            <MenuItem value='bottom-right'>Bottom Right</MenuItem>
                            <MenuItem value='left'>Left</MenuItem>
                            <MenuItem value='right'>Right</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Drawer>
        </>
    )
}