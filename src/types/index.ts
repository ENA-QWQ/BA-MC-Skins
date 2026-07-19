export interface SkinItem {
    id: string;
    character: string;
    variant: string;
    downloadUrl: string;
    sha256: string;
}

export interface SkinDataState {
    data: SkinItem[];
    loading: boolean;
    error: string | null;
}