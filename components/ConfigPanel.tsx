import {Drawer, Fab} from '@mui/material';
import Box from "@mui/material/Box";
import {
    Settings as SettingsIcon
} from "@mui/icons-material";
import * as React from "react";

export default function ConfigPanel() {
    const [isOpen, setIsOpen] = React.useState(false);

    function toggleDrawer() {
        setIsOpen(!isOpen);
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
                <div>
                    <h2>Param1</h2>
                    <label htmlFor="param1">Param1</label>
                    <input id="param1" type="text"/>

                    <h2>Param2</h2>
                    Amet animi commodi dicta dolore impedit libero,
                </div>
            </Drawer>
        </>
    )
}