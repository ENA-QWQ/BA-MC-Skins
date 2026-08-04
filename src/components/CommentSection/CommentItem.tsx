import { useState } from 'react';
import { CommentForm } from './CommentForm';

interface CommentItemProps {
    comment: {
        id: number;
        user: { login: string; avatar_url: string };
        body: string;
        created_at: string;
        replies?: CommentItemProps['comment'][];
    };
    issueNumber: number;
    token: string;
    repoOwner: string;
    repoName: string;
    onReplySuccess: () => void;
}

export function CommentItem({
                                comment,
                                issueNumber,
                                token,
                                repoOwner,
                                repoName,
                                onReplySuccess,
                            }: CommentItemProps) {
    const [showReplyForm, setShowReplyForm] = useState(false);

    const formattedDate = new Date(comment.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="comment-item">
            <div className="comment-header">
                <img src={comment.user.avatar_url} alt={comment.user.login} className="comment-avatar" />
                <span className="comment-author">{comment.user.login}</span>
                <span className="comment-date">{formattedDate}</span>
            </div>
            <div className="comment-body">{comment.body}</div>
            <button className="comment-reply-btn" onClick={() => setShowReplyForm(!showReplyForm)}>
                {showReplyForm ? 'Cancel' : 'Reply'}
            </button>
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
            {comment.replies && comment.replies.length > 0 && (
                <div className="comment-replies">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            issueNumber={issueNumber}
                            token={token}
                            repoOwner={repoOwner}
                            repoName={repoName}
                            onReplySuccess={onReplySuccess}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}