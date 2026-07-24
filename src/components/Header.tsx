import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface HeaderProps {
    title: string;
    showBack?: boolean;
}

export function Header({ title, showBack = true }: HeaderProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchValue = searchParams.get('search') || '';
    const [inputValue, setInputValue] = useState(searchValue);

    useEffect(() => {
        setInputValue(searchParams.get('search') || '');
    }, [searchParams]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        if (val.trim() === '') {
            navigate('/');
        } else {
            navigate(`/?search=${encodeURIComponent(val)}`);
        }
    };

    return (
        <div className="header">
            <div className="header-left">
                {showBack && (
                    <button className="back-btn" onClick={handleBack}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}
                <span className="header-title">{title}</span>
            </div>
            <div className="header-right">
                <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={inputValue}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
            </div>
        </div>
    );
}