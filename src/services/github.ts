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