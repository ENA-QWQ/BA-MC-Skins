import { useEffect, useState } from 'react';
import { Octokit } from '@octokit/rest';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';

interface Comment {
    id: number;
    user: { login: string; avatar_url: string };
    body: string;
    created_at: string;
    replies?: Comment[];
}

interface CommentSectionProps {
    issueNumber: number;
    skinId: string;
    token: string | null;
    repoOwner: string;
    repoName: string;
}

function buildCommentTree(comments: any[]): Comment[] {
    const sorted = [...comments].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const map = new Map<number, Comment>();
    const roots: Comment[] = [];

    for (const c of sorted) {
        const node: Comment = {
            id: c.id,
            user: {
                login: c.user.login,
                avatar_url: c.user.avatar_url,
            },
            body: c.body,
            created_at: c.created_at,
            replies: [],
        };
        map.set(c.id, node);
    }

    for (const c of sorted) {
        const node = map.get(c.id)!;
        const replyMatch = c.body.match(/<!-- reply_to: (\d+) -->/);
        if (replyMatch) {
            const parentId = parseInt(replyMatch[1], 10);
            const parent = map.get(parentId);
            if (parent) {
                parent.replies!.push(node);
            } else {
                roots.push(node);
            }
        } else {
            roots.push(node);
        }
    }

    return roots;
}

export function CommentSection({
                                   issueNumber,
                                   token,
                                   repoOwner,
                                   repoName,
                               }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchComments = async () => {
        if (!token || token === '') return;
        setLoading(true);
        setError(null);
        try {
            const octokit = new Octokit({ auth: token });
            const { data } = await octokit.issues.listComments({
                owner: repoOwner,
                repo: repoName,
                issue_number: issueNumber,
            });
            const tree = buildCommentTree(data);
            setComments(tree);
        } catch (err: any) {
            setError(err.message || 'Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && issueNumber) {
            fetchComments();
        }
    }, [token, issueNumber, refreshTrigger]);

    const handleCommentPosted = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    if (!token || token === '') {
        return <p className="login-prompt">Please login to see and post comments.</p>;
    }

    if (loading) return <div className="loading-text">Loading comments...</div>;
    if (error) return <div className="error-text">{error}</div>;

    return (
        <div className="comment-section">
            <h3 className="comment-section-title">Comments</h3>
            <CommentForm
                issueNumber={issueNumber}
                token={token}
                repoOwner={repoOwner}
                repoName={repoName}
                onSuccess={handleCommentPosted}
            />
            <div className="comment-list">
                {comments.length === 0 ? (
                    <p className="no-comments">No comments yet. Be the first!</p>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            issueNumber={issueNumber}
                            token={token}
                            repoOwner={repoOwner}
                            repoName={repoName}
                            onReplySuccess={handleCommentPosted}
                        />
                    ))
                )}
            </div>
        </div>
    );
}