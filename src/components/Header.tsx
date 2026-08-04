import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { useAuth } from '../context/AuthContext';
import { fetchUser } from '../services/github';
import { useSkinData } from '../hooks/useSkinData';

interface HeaderProps {
    title?: string;
    showBack?: boolean;
}

const PROXY_URL = 'https://mscdownload.pages.dev/proxy?url=';

export function Header({showBack = true }: HeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const searchValue = searchParams.get('search') || '';
    const [inputValue, setInputValue] = useState(searchValue);
    const { config } = useSiteConfig();
    const { user, isLoggedIn, login, logout } = useAuth();
    const { data: skinData } = useSkinData();
    const [deviceFlowActive, setDeviceFlowActive] = useState(false);
    const [verificationUri, setVerificationUri] = useState('');
    const [userCode, setUserCode] = useState('');
    const [waitMessage, setWaitMessage] = useState('Waiting for confirmation...');
    const [pollingTimeout, setPollingTimeout] = useState<number | null>(null);

    const siteTitle = config?.siteTitle || 'Skin Gallery';
    const enableSearch = config?.enableSearch !== undefined ? config.enableSearch : true;

    const buildBreadcrumbs = () => {
        const base = { name: siteTitle, path: '/' };
        const crumbs = [base];
        const pathname = location.pathname;

        if (pathname === '/') return crumbs;

        const parts = pathname.split('/').filter(Boolean);

        if (parts[0] === 'game') {
            const gameName = parts[1];
            if (gameName) {
                crumbs.push({ name: gameName, path: `/game/${gameName}` });
                if (parts.length > 2 && parts[2] === 'character') {
                    const characterName = parts[3];
                    if (characterName) {
                        crumbs.push({ name: characterName, path: `/game/${gameName}/character/${characterName}` });
                    }
                }
            }
        } else if (parts[0] === 'skin') {
            const id = parts[1];
            if (id && skinData) {
                const skin = skinData.find(s => s.id === id);
                if (skin) {
                    const gameName = skin.game;
                    const characterName = skin.character;
                    const variantName = skin.variant;
                    crumbs.push(
                        { name: gameName, path: `/game/${gameName}` },
                        { name: characterName, path: `/game/${gameName}/character/${characterName}` },
                        { name: variantName, path: `/skin/${id}` }
                    );
                }
            }
        }

        return crumbs;
    };

    const breadcrumbs = buildBreadcrumbs();

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
                    <div className="breadcrumb-wrapper">
                        {breadcrumbs.map((crumb, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            const isFirst = index === 0;
                            if (isFirst) {
                                return (
                                    <span key={index} className="breadcrumb-item">
                    <Link to="/" className="breadcrumb-home">{crumb.name}</Link>
                                        {!isLast && <span className="breadcrumb-separator"> / </span>}
                  </span>
                                );
                            }
                            if (isLast) {
                                return (
                                    <span key={index} className="breadcrumb-item">
                    <span className="breadcrumb-current">{crumb.name}</span>
                  </span>
                                );
                            }
                            return (
                                <span key={index} className="breadcrumb-item">
                  <Link to={crumb.path} className="breadcrumb-link">{crumb.name}</Link>
                  <span className="breadcrumb-separator"> / </span>
                </span>
                            );
                        })}
                    </div>
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
                            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
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
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
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