import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { useAuth } from '../context/AuthContext';
import { fetchUser } from '../services/github';

interface HeaderProps {
    title?: string;
    showBack?: boolean;
}

const PROXY_URL = 'https://mscdownload.pages.dev/proxy?url=';

export function Header({ title, showBack = true }: HeaderProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchValue = searchParams.get('search') || '';
    const [inputValue, setInputValue] = useState(searchValue);
    const { config } = useSiteConfig();
    const { user, isLoggedIn, login, logout } = useAuth();
    const [deviceFlowActive, setDeviceFlowActive] = useState(false);
    const [verificationUri, setVerificationUri] = useState('');
    const [userCode, setUserCode] = useState('');
    const [waitMessage, setWaitMessage] = useState('Waiting for confirmation...');
    const [pollingTimeout, setPollingTimeout] = useState<number | null>(null);

    const headerTitle = title || config?.siteTitle || 'Skin Gallery';
    const enableSearch = config?.enableSearch !== undefined ? config.enableSearch : true;

    useEffect(() => {
        setInputValue(searchParams.get('search') || '');
    }, [searchParams]);

    useEffect(() => {
        return () => {
            if (pollingTimeout) clearTimeout(pollingTimeout);
        };
    }, [pollingTimeout]);

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

    const parseResponse = (text: string) => {
        try {
            return JSON.parse(text);
        } catch {
            const params = new URLSearchParams(text);
            const result: Record<string, string> = {};
            params.forEach((value, key) => {
                result[key] = value;
            });
            return result;
        }
    };

    const startDeviceFlow = async () => {
        setDeviceFlowActive(true);
        setWaitMessage('Waiting for confirmation...');
        try {
            const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

            const formBody = new URLSearchParams({
                client_id: clientId,
                scope: 'repo user'
            });

            const deviceRes = await fetch(
                `${PROXY_URL}https://github.com/login/device/code`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formBody,
                }
            );
            const deviceText = await deviceRes.text();
            const deviceData = parseResponse(deviceText);
            if (deviceData.error) throw new Error(deviceData.error_description || deviceData.error);

            const { device_code, user_code, verification_uri, interval } = deviceData;
            setVerificationUri(verification_uri);
            setUserCode(user_code);

            let intervalMs = (parseInt(interval) || 5) * 1000;
            let done = false;

            const poll = async () => {
                if (done) return;
                try {
                    const tokenFormBody = new URLSearchParams({
                        client_id: clientId,
                        device_code,
                        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                    });

                    const tokenRes = await fetch(
                        `${PROXY_URL}https://github.com/login/oauth/access_token`,
                        {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json'
                            },
                            body: tokenFormBody,
                        }
                    );
                    const tokenText = await tokenRes.text();
                    const tokenData = parseResponse(tokenText);
                    if (tokenData.access_token) {
                        done = true;
                        setDeviceFlowActive(false);
                        const userInfo = await fetchUser(tokenData.access_token);
                        login(tokenData.access_token, userInfo);
                    } else if (tokenData.error === 'authorization_pending') {
                        const timeoutId = setTimeout(poll, intervalMs);
                        setPollingTimeout(timeoutId);
                    } else if (tokenData.error === 'slow_down') {
                        const newInterval = parseInt(tokenData.interval) || 70;
                        intervalMs = newInterval * 1000;
                        setWaitMessage(`Rate limited, retry in ${newInterval}s...`);
                        const timeoutId = setTimeout(poll, intervalMs);
                        setPollingTimeout(timeoutId);
                    } else {
                        throw new Error(tokenData.error_description || tokenData.error || 'Unknown error');
                    }
                } catch (err) {
                    setDeviceFlowActive(false);
                    alert('Login failed: ' + (err as Error).message);
                }
            };

            const initialTimeout = setTimeout(poll, intervalMs);
            setPollingTimeout(initialTimeout);

        } catch (err) {
            setDeviceFlowActive(false);
            alert('Failed to start device login: ' + (err as Error).message);
        }
    };

    const handleLogin = () => {
        startDeviceFlow();
    };

    const handleLogout = () => {
        if (pollingTimeout) clearTimeout(pollingTimeout);
        setDeviceFlowActive(false);
        logout();
    };

    return (
        <>
            <div className="header">
                <div className="header-left">
                    {showBack && (
                        <button className="back-btn" onClick={handleBack}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <span className="header-title">{headerTitle}</span>
                </div>
                <div className="header-right">
                    {enableSearch && (
                        <div className="search-wrapper">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={inputValue}
                                onChange={handleSearchChange}
                                className="search-input"
                            />
                        </div>
                    )}
                    {isLoggedIn && user ? (
                        <div className="user-menu-wrapper">
                            <div className="user-menu-trigger">
                                <img src={user.avatar_url} alt={user.login} className="user-avatar" />
                                <span className="user-name">{user.login}</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                            <div className="dropdown-menu">
                                <div className="dropdown-item" onClick={handleLogout}>
                                    Logout
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button onClick={handleLogin} disabled={deviceFlowActive} className="login-btn">
                            {deviceFlowActive ? 'Waiting...' : 'Login with GitHub'}
                        </button>
                    )}
                </div>
            </div>
            {deviceFlowActive && (
                <div className="device-modal-overlay">
                    <div className="device-modal">
                        <p>Visit the link below and enter the code:</p>
                        <p><a href={verificationUri} target="_blank" rel="noopener noreferrer">{verificationUri}</a></p>
                        <div className="verification-code">{userCode}</div>
                        <p className="waiting-text">{waitMessage}</p>
                    </div>
                </div>
            )}
        </>
    );
}