import { useState } from 'react';
import { Octokit } from '@octokit/rest';
import { CommentForm } from './CommentForm';
import { useAuth } from '../../context/AuthContext';
import { refreshUserToken } from '../../services/github';

interface CommentItemProps {
    comment: {
        id: number;
        user: { login: string; avatar_url: string };
        body: string;
        body_html: string;
        created_at: string;
        replies?: CommentItemProps['comment'][];
    };
    issueNumber: number;
    token: string;
    repoOwner: string;
    repoName: string;
    onReplySuccess: () => void;
    onDeleteSuccess: () => void;
}


function hasReplyTo(body: string | undefined | null): number | null {
    if (!body) return null;
    const match = body.match(/<!-- reply_to: (\d+) -->/);
    return match ? parseInt(match[1], 10) : null;
}

export function CommentItem({
                                comment,
                                issueNumber,
                                token,
                                repoOwner,
                                repoName,
                                onReplySuccess,
                                onDeleteSuccess,
                            }: CommentItemProps) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { user, updateTokens, logout } = useAuth();

    const isAuthor = user?.login === comment.user.login;

    const formattedDate = new Date(comment.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const performDelete = async (currentToken: string) => {
        const octokit = new Octokit({ auth: currentToken });
        await octokit.issues.deleteComment({
            owner: repoOwner,
            repo: repoName,
            comment_id: comment.id,
        });
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        setDeleting(true);
        let currentToken = token;

        try {
            await performDelete(currentToken);
            onDeleteSuccess();
        } catch (err: any) {
            if (err.status === 403 && err.message?.includes('Resource not accessible by integration')) {
                try {
                    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
                    const refreshToken = localStorage.getItem('github_refresh_token');
                    if (!refreshToken) {
                        logout();
                        alert('Session expired. Please login again.');
                        return;
                    }
                    const newTokens = await refreshUserToken(clientId, refreshToken);
                    updateTokens(newTokens.access_token, newTokens.refresh_token);
                    currentToken = newTokens.access_token;
                    await performDelete(currentToken);
                    onDeleteSuccess();
                } catch (refreshErr) {
                    logout();
                    alert('Session expired. Please login again.');
                }
            } else {
                alert('Failed to delete comment. Please try again.');
            }
        } finally {
            setDeleting(false);
        }
    };

    const filteredReplies = comment.replies ? comment.replies.filter(reply => {
        const parentId = hasReplyTo(reply.body);
        return parentId === comment.id;
    }) : [];

    const hasReplies = filteredReplies.length > 0;

    return (
        <div className={`comment-item ${hasReplies ? 'has-replies' : ''}`}>
            <div className="comment-header">
                <img src={comment.user.avatar_url} alt={comment.user.login} className="comment-avatar" />
                <span className="comment-author">{comment.user.login}</span>
                <span className="comment-date">{formattedDate}</span>
                <div className="comment-actions-wrapper">
                    <button className="comment-actions-btn" aria-label="Comment actions">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                        </svg>
                    </button>
                    <div className="comment-dropdown-menu">
                        <div
                            className="comment-dropdown-item"
                            onClick={() => setShowReplyForm(true)}
                        >
                            Reply
                        </div>
                        {isAuthor && (
                            <div
                                className="comment-dropdown-item comment-dropdown-item-danger"
                                onClick={handleDelete}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div
                className="comment-body"
                dangerouslySetInnerHTML={{ __html: comment.body_html || '' }}
            />
            {showReplyForm && (
                <CommentForm
                    issueNumber={issueNumber}
                    token={token}
                    repoOwner={repoOwner}
                    repoName={repoName}
                    parentId={comment.id}
                    onSuccess={() => {
                        setShowReplyForm(false);
                        onReplySuccess();
                    }}
                />
            )}
            {hasReplies && (
                <div className="comment-replies">
                    {filteredReplies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            issueNumber={issueNumber}
                            token={token}
                            repoOwner={repoOwner}
                            repoName={repoName}
                            onReplySuccess={onReplySuccess}
                            onDeleteSuccess={onDeleteSuccess}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}