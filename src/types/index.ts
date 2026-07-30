export interface SkinItem {
    id: string;
    game: string;
    character: string;
    variant: string;
    downloadUrl: string;
    sha256: string;
    createdAt: string;
    updatedAt: string;
    author: string;
    isOriginal: boolean;
    originalAuthor: string | null;
    originalSource: string | null;
    license: string | null;
    note: string | null;
}

export interface SkinDataState {
    data: SkinItem[];
    loading: boolean;
    error: string | null;
}