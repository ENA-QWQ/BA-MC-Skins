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

export const ensureIssueForSkin = async (
    octokit: Octokit,
    owner: string,
    repo: string,
    skinId: string,
    title?: string,
    body?: string
): Promise<number> => {
    const existing = await getIssueForSkin(octokit, owner, repo, skinId);
    if (existing !== null) return existing;

    const issueTitle = title || `[Skin] ${skinId}`;
    const issueBody = body || `Skin ID: ${skinId}`;
    const { data } = await octokit.issues.create({
        owner,
        repo,
        title: issueTitle,
        body: issueBody,
        labels: [`skin:${skinId}`],
    });
    return data.number;
};