import { useEffect, useState } from 'react';

export default function ProgressBar({ duration, className }: { duration: number; className: string }) {
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setStarted(true));
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <div className={`snackbar-progress-track ${className}`}>
            <div
                className={"progress-bar-fill"}
                style={{
                    height: '100%',
                    width: started ? '100%' : '0%',
                    transition: `width ${duration}ms linear`
                }}
            />
        </div>
    );
};