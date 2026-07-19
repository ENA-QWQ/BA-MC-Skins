import { useState, useEffect } from 'react';
import { SkinItem, SkinDataState } from '../types';

export function useSkinData(): SkinDataState {
    const [state, setState] = useState<SkinDataState>({
        data: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        fetch('/BA-MC-Skins/data.json')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch data.json');
                return res.json();
            })
            .then((data: SkinItem[]) => {
                setState({ data, loading: false, error: null });
            })
            .catch((err) => {
                setState({ data: [], loading: false, error: err.message });
            });
    }, []);

    return state;
}