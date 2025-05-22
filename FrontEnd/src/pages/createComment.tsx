    import { Delete as DeleteIcon, Edit as EditIcon, Reply as ReplyIcon } from '@mui/icons-material';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Container,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './createComment.css';

    interface CommentType {
    comment_id: string;
    content: string;
    user: {
        username: string;
        profile_picture: string;
    };
    parent_id: string | null;
    replies?: CommentType[];
    createdAt: string;
    }

    export default function Comments() {
    const { idPost } = useParams();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyingToUser, setReplyingToUser] = useState<{ id: String, username: string} | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const updatePostCommentCount = async () => {
        try {
            await axios.post(`http://localhost:3000/posts/${idPost}/update-comment-count`);
        } catch (err) {
            console.error('Error updating comment count:', err);
        }
    };

    const fetchComments = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            
            const response = await axios.get(
                `http://localhost:3000/posts/${idPost}/comments`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            setComments(response.data || []);
        } catch (err) {
            console.error('Error fetching comments:', err);
            setError('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [idPost]);

    useEffect(() => {
        if (replyTo && replyingToUser) {
            setNewComment(`@${replyingToUser.username}`);
        }
    }, [replyTo, replyingToUser]);

    const handleComment = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Please login to comment');
                return;
            }

            if(!newComment.trim()) {
                setError('Comment cannot be empty');
                return;
            }

            await axios.post(
                `http://localhost:3000/posts/${idPost}/comments`,
                {
                    content: newComment,
                    parent_id: replyTo|| null
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setNewComment('');
            setReplyTo(null);
            setReplyingToUser(null);
            await fetchComments(); // Refresh comments after posting
            await updatePostCommentCount();
        } catch (err) {
            console.error('Error posting comment:', err);
            setError('Failed to post comment');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (idComment: string) => {
        try {
            if (!editContent.trim()) {
                setError('Comment cannot be empty');
                return;
            }

            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:3000/comments/${idComment}`,
                { content: editContent },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setEditingId(null);
            setEditContent('');
            await fetchComments();
        } catch (err) {
            console.error('Error editing comment:', err);
            setError('Failed to edit comment');
        }
    };

    const handleDelete = async (idComment: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:3000/comments/${idComment}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            await fetchComments();
            await updatePostCommentCount();
        } catch (err) {
            console.error('Error deleting comment:', err);
            setError('Failed to delete comment');
        }
    };

    const formatCommentText = (text: string) => {
        return text.split(' ').map((word, idx) => {
            if (word.startsWith('@')) {
            const username = word.slice(1);
            return (
                <a
                key={idx}
                href={`/users/${username}`}
                style={{ color: '#007bff', textDecoration: 'none', marginRight: 4 }}
                >
                @{username}
                </a>
            );
            }
            return (<span key={idx} style={{ marginRight: 4 }}>{word}</span>);
        });
    };

    const getAllRepliesForComment = (comments: CommentType[], parentId: string): CommentType[] => {
        const directReplies = comments.filter(c => c.parent_id === parentId);
        let allReplies: CommentType[] = [...directReplies];

        directReplies.forEach(reply => {
            allReplies = allReplies.concat(getAllRepliesForComment(comments, reply.comment_id));
        });
        return allReplies;
    }


    const canModifyComment = (comment: CommentType) => {
        return comment.user.username === currentUser.username;
    };

    const renderComment = (comment: CommentType, depth: number = 0) => (
        <Box
            key={comment.comment_id}
            className={`comment-box ${depth > 0 ? 'reply' : ''}`}
            sx={{
                ml: depth * 3,
                borderLeft: depth > 0 ? '2px solid #ff5700' : 'none',
                backgroundColor: depth % 2 === 0 ? '#f8f9fa' : '#fff'
            }}
        >
            <Box className="comment-header">
                <Avatar
                    src={comment.user.profile_picture || '/default-avatar.png'}
                    sx={{ width: 32, height: 32 }}
                />
                <Box>
                    <Typography variant="subtitle2">{comment.user.username}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {new Date(comment.createdAt).toLocaleString()}
                    </Typography>
                </Box>
            </Box>

            {editingId === comment.comment_id ? (
                <Box className="edit-box">
                    <TextField
                        fullWidth
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        multiline
                        size="small"
                        error={!editContent.trim()}
                        helperText={!editContent.trim() ? 'Comment cannot be empty' : ''}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                            onClick={() => handleEdit(comment.comment_id)}
                            disabled={!editContent.trim()}
                            variant="contained"
                            size="small"
                        >
                            Save
                        </Button>
                        <Button
                            onClick={() => setEditingId(null)}
                            size="small"
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            ) : (
                <>
                    <Typography className="comment-content">
                        {formatCommentText(comment.content)}
                    </Typography>
                    <Box className="comment-actions">
                        {depth < 3 && ( // Limit reply depth to 3 levels
                            <IconButton
                                onClick={() => {
                                    setReplyTo(comment.comment_id);
                                    setReplyingToUser({ id: comment.comment_id, username: comment.user.username });
                                    setNewComment(`@${comment.user.username} `);
                                }}
                                size="small"
                            >
                                <ReplyIcon fontSize="small" />
                            </IconButton>
                        )}
                        {canModifyComment(comment) && (
                            <>
                                <IconButton
                                    onClick={() => {
                                        setEditingId(comment.comment_id);
                                        setEditContent(comment.content);
                                    }}
                                    size="small"
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleDelete(comment.comment_id)}
                                    size="small"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </>
                        )}
                    </Box>
                </>
            )}

            {replyTo === comment.comment_id && (
                <Box className="reply-box">
                    <TextField
                        fullWidth
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={`Reply to @${replyingToUser?.username || ''}`}
                        multiline
                        size="small"
                        error={!newComment.trim()}
                        helperText={!newComment.trim() ? 'Reply cannot be empty' : ''}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                            onClick={handleComment}
                            disabled={!newComment.trim()}
                            variant="contained"
                            size="small"
                        >
                            Reply
                        </Button>
                        <Button
                            onClick={() => {
                                setReplyTo(null);
                                setReplyingToUser(null);
                                setNewComment('');
                            }}
                            size="small"
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Render nested replies recursively */}
            {comment.replies && comment.replies.length > 0 && (
                <Box className="replies-container">
                    {comment.replies.map(reply => renderComment(reply, depth + 1))}
                </Box>
            )}
        </Box>
    );

    return (
        <Container maxWidth="md">
            <Box className="comments-container">
                <Button
                    variant="outlined"
                    sx={{ mb: 2 }}
                    onClick={() => (window.location.href = '/home')}
                >
                    Back to Home
                </Button>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Comments
                </Typography>

                <Box className="new-comment-box" sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        multiline
                        disabled={loading}
                        error={!newComment.trim() && newComment !== ''}
                        helperText={
                            !newComment.trim() && newComment !== '' ? 'Comment cannot be empty' : ''
                        }
                    />
                    <Button
                        onClick={() => handleComment()}
                        variant="contained"
                        className="submit-button"
                        disabled={loading || !newComment.trim()}
                        sx={{ mt: 1 }}
                    >
                        {loading ? 'Posting...' : 'Comment'}
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>Loading comments...</Box>
                ) : comments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>No comments yet. Be the first to comment!</Box>
                ) : (
                    <Box className="comments-list">
                        {comments
                            .filter((c) => c.parent_id === null)
                            .map((comment) => {
                                const replies = getAllRepliesForComment(comments, comment.comment_id);
                                return (
                                    <Box key={comment.comment_id} sx={{ mb: 3 }}>
                                        {renderComment(comment, 0)}
                                        {replies.map((reply) => renderComment(reply, 1))}
                                    </Box>
                                );
                            })}
                    </Box>
                )}
            </Box>
        </Container>
    );
    }