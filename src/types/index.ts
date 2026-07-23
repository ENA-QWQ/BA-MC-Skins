export interface SkinItem {
    id: string;
    character: string;
    variant: string;
    downloadUrl: string;
    sha256: string;
    createdAt: string;
    updatedAt: string;
    author: string;
}

export interface SkinDataState {
    data: SkinItem[];
    loading: boolean;
    error: string | null;
}