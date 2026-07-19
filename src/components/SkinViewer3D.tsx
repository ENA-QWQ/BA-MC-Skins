import { useEffect, useRef } from 'react';
import { SkinViewer } from 'skinview3d';
import * as THREE from 'three';

interface SkinViewer3DProps {
    skinUrl: string;
    width?: number;
    height?: number;
    autoRotate?: boolean;
}

export function SkinViewer3D({ skinUrl, width = 200, height = 400, autoRotate = true }: SkinViewer3DProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const viewerRef = useRef<SkinViewer | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const viewer = new SkinViewer({
            canvas: canvasRef.current,
            width,
            height,
            skin: skinUrl,
        });

        viewer.autoRotate = autoRotate;
        viewer.autoRotateSpeed = 1.0;

        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(5, 10, 7);
        viewer.scene.add(light);
        viewer.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

        viewerRef.current = viewer;

        return () => {
            viewer.dispose();
            viewerRef.current = null;
        };
    }, [skinUrl, width, height, autoRotate]);

    return <canvas ref={canvasRef} style={{ borderRadius: '8px', background: '#f0f0f0' }} />;
}