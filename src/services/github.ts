import { Octokit } from '@octokit/rest';

export const getOctokit = (token: string) => {
    return new Octokit({ auth: token });
};

export const fetchUser = async (token: string) => {
    const octokit = getOctokit(token);
    const { data } = await octokit.users.getAuthenticated();
    return {
        login: data.login,
        avatar_url: data.avatar_url,
        name: data.name || undefined,
    };
};

export const refreshUserToken = async (
    clientId: string,
    refreshToken: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> => {
    const params = new URLSearchParams({
        client_id: clientId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    });

    const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: params,
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error_description || data.error);
    }
    return data;
};

export const getIssueForSkin = async (
    octokit: Octokit,
    owner: string,
    repo: string,
    skinId: string
): Promise<number | null> => {
    const { data } = await octokit.issues.listForRepo({
        owner,
        repo,
        labels: `skin:${skinId}`,
        state: 'all',
        per_page: 1,
    });
    if (data.length === 0) return null;
    return data[0].number;
};