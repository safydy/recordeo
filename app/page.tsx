'use client';

import dynamic from 'next/dynamic';

export default function Home() {
    // need dynamic to import component using recorderrtc
    // see explanation:  https://github.com/muaz-khan/RecordRTC/issues/795#issuecomment-1138760844
    const Recorder = dynamic(() => import('@/components/Recorder'), {ssr: false});

    return (
        <>
            <Recorder/>
        </>
    );
}
