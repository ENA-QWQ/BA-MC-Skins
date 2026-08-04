import React, { useState, useRef, useEffect } from 'react';
import { Octokit } from '@octokit/rest';

interface CommentFormProps {
    issueNumber: number;
    token: string;
    repoOwner: string;
    repoName: string;
    parentId?: number;
    onSuccess: () => void;
}

export function CommentForm({
                                issueNumber,
                                token,
                                repoOwner,
                                repoName,
                                parentId,
                                onSuccess,
                            }: CommentFormProps) {
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [body]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBody(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim()) return;

        setSubmitting(true);
        try {
            const octokit = new Octokit({ auth: token });
            let content = body.trim();
            if (parentId) {
                content += `\n\n<!-- reply_to: ${parentId} -->`;
            }
            await octokit.issues.createComment({
                owner: repoOwner,
                repo: repoName,
                issue_number: issueNumber,
                body: content,
            });
            setBody('');
            onSuccess();
        } catch (err) {
            alert('Failed to post comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className="comment-form" onSubmit={handleSubmit}>
            <div className="comment-input-wrapper">
                <textarea
                    ref={textareaRef}
                    className="comment-textarea"
                    value={body}
                    onChange={handleChange}
                    placeholder={parentId ? 'Write a reply...' : 'Write a comment...'}
                    rows={1}
                    disabled={submitting}
                />
                <button type="submit" className="comment-submit-btn" disabled={submitting || !body.trim()}>
                    {submitting ? 'Posting...' : 'Post'}
                </button>
            </div>
        </form>
    );
}