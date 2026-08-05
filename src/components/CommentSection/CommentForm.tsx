import React, { useState, useRef, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import { useAuth } from '../../context/AuthContext';
import { refreshUserToken } from '../../services/github';

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
    const { updateTokens, logout } = useAuth();

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

    const performRequest = async (currentToken: string) => {
        const octokit = new Octokit({ auth: currentToken });
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim() || submitting) return;

        setSubmitting(true);
        let currentToken = token;

        try {
            await performRequest(currentToken);
            setBody('');
            onSuccess();
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
                    await performRequest(currentToken);
                    setBody('');
                    onSuccess();
                } catch (refreshErr) {
                    logout();
                    alert('Session expired. Please login again.');
                }
            } else {
                alert('Failed to post comment. Please try again.');
            }
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