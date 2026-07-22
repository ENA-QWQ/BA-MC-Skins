import { useEffect, useRef, useState } from 'react';
import { SkinViewer } from 'skinview3d';

interface SkinViewer3DProps {
    skinUrl: string;
    width?: number;
    height?: number;
    autoRotate?: boolean;
}

export function SkinViewer3D({ skinUrl, width = 200, height = 400, autoRotate = true }: SkinViewer3DProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const viewerRef = useRef<SkinViewer | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        try {
            const viewer = new SkinViewer({
                canvas: canvasRef.current,
                width,
                height,
                skin: skinUrl,
            });

            viewer.autoRotate = autoRotate;
            viewer.autoRotateSpeed = 1.0;

            viewerRef.current = viewer;
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        }

        return () => {
            if (viewerRef.current) {
                viewerRef.current.dispose();
                viewerRef.current = null;
            }
        };
    }, [skinUrl, width, height, autoRotate]);

    if (error) {
        return <div className="error-text">Skin viewer error: {error.message}</div>;
    }

    return <canvas ref={canvasRef} />;
}