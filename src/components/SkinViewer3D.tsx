import { useEffect, useRef, useState } from 'react';
import { SkinViewer } from 'skinview3d';

interface SkinViewer3DProps {
    skinUrl: string;
    width?: number;
    height?: number;
    autoRotate?: boolean;
    enableRotate?: boolean;
    enableZoom?: boolean;
}

export function SkinViewer3D({
                                 skinUrl,
                                 width = 200,
                                 height = 400,
                                 autoRotate = true,
                                 enableRotate = true,
                                 enableZoom = true,
                             }: SkinViewer3DProps) {
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

            if (viewer.controls) {
                viewer.controls.enableRotate = enableRotate;
                viewer.controls.enableZoom = enableZoom;
            }

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

    useEffect(() => {
        if (viewerRef.current?.controls) {
            viewerRef.current.controls.enableRotate = enableRotate;
            viewerRef.current.controls.enableZoom = enableZoom;
        }
    }, [enableRotate, enableZoom]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let startX = 0;
        let startY = 0;
        let isDragging = false;

        const handleMouseDown = (e: MouseEvent) => {
            startX = e.clientX;
            startY = e.clientY;
            isDragging = false;
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (e.buttons === 0) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.sqrt(dx * dx + dy * dy) > 5) {
                isDragging = true;
            }
        };

        const handleMouseUp = () => {
            // 可以不做特殊处理
        };

        const handleClick = (e: MouseEvent) => {
            if (isDragging) {
                e.stopPropagation();
                e.preventDefault();
            }
        };

        const handleDragStart = (e: DragEvent) => {
            e.preventDefault();
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('dragstart', handleDragStart);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('dragstart', handleDragStart);
        };
    }, []);

    if (error) {
        return <div className="error-text">Skin viewer error: {error.message}</div>;
    }

    return <canvas ref={canvasRef} />;
}