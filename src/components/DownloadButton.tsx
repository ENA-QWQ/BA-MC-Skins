import { useState } from 'react';

interface DownloadButtonProps {
    url: string;
    filename: string;
}

export function DownloadButton({ url, filename }: DownloadButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(url, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
                padding: '10px 20px',
                backgroundColor: isDownloading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isDownloading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
            }}
        >
            {isDownloading ? 'Downloading...' : 'Download Skin'}
        </button>
    );
}