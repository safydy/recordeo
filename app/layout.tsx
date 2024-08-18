'use client';

import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import Box from "@mui/material/Box";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import * as React from "react";
import {PaletteMode} from "@mui/material";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import getLPTheme from "@/app/getLPTheme";
import CssBaseline from "@mui/material/CssBaseline";
import AppAppBar from "@/components/AppAppBar";
import Footer from "@/components/Footer";

const inter = Inter({subsets: ["latin"]});

export interface ToggleCustomThemeProps {
    showCustomTheme: Boolean;
    toggleCustomTheme: () => void;
}

export function ToggleCustomTheme({
                                      showCustomTheme,
                                      toggleCustomTheme,
                                  }: ToggleCustomThemeProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100dvw',
                position: 'fixed',
                bottom: 24,
            }}
        >
            <ToggleButtonGroup
                color="primary"
                exclusive
                value={showCustomTheme}
                onChange={toggleCustomTheme}
                aria-label="Platform"
                sx={{
                    backgroundColor: 'background.default',
                    '& .Mui-selected': {
                        pointerEvents: 'none',
                    },
                }}
            >
                <ToggleButton value>
                    <AutoAwesomeRoundedIcon sx={{fontSize: '20px', mr: 1}}/>
                    Custom theme
                </ToggleButton>
                <ToggleButton value={false}>Material Design 2</ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    const [mode, setMode] = React.useState<PaletteMode>('light');
    const [showCustomTheme, setShowCustomTheme] = React.useState(true);
    const LPtheme = createTheme(getLPTheme(mode));
    const defaultTheme = createTheme({palette: {mode}});

    const toggleColorMode = () => {
        setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const toggleCustomTheme = () => {
        setShowCustomTheme((prev) => !prev);
    };

    return (
        <html lang="en">
            <body className={inter.className}>
                <ThemeProvider theme={showCustomTheme ? LPtheme : defaultTheme}>
                    <CssBaseline/>
                    <AppAppBar mode={mode} toggleColorMode={toggleColorMode}/>

                    <Box sx={{
                        minHeight: 100,
                    }}>
                        {/*just to skip the nav bar*/}
                    </Box>
                    {children}
                    {/*<Box sx={{bgcolor: 'background.default'}}>*/}
                    {/*    <Footer/>*/}
                    {/*</Box>*/}
                    <ToggleCustomTheme
                        showCustomTheme={showCustomTheme}
                        toggleCustomTheme={toggleCustomTheme}
                    />
                </ThemeProvider>
            </body>
        </html>
    );
}
