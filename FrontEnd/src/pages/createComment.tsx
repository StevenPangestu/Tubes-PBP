import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
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
import { useNavigate, useParams } from 'react-router-dom';
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
    const navigate = useNavigate();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyingToUser, setReplyingToUser] = useState<{ id: String, username: string} | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [canComment, setCanComment] = useState(false);
    const [postOwner, setPostOwner] = useState<{ user_id: string, username: string } | null>(null);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

    const toggleReplies = (commentId: string) => {
        setExpandedComments(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }));
    }

    const updatePostCommentCount = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:3000/posts/${idPost}/update-comment-count`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error('Error updating comment count:', err);
        }
    };

    const fetchComments = async () => {
        try {
            if (!token || !idPost) return;
            
            console.log("Fetching comments for post:", idPost);
            
            const response = await axios.get(
                `http://localhost:3000/comments/${idPost}/comments`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log("Comments response:", response.data);
            
            // Check if the response format is different than expected
            if (Array.isArray(response.data)) {
                setComments(response.data);
            } else if (response.data.comments && Array.isArray(response.data.comments)) {
                setComments(response.data.comments);
                
                // If post data is included in the response, use it to determine permissions
                if (response.data.post) {
                    const postData = response.data.post;
                    setPostOwner({
                        user_id: String(postData.user_id || postData.user?.user_id || ""),
                        username: postData.user?.username || postData.username || "Unknown"
                    });
                    
                    const isPostOwner = String(currentUser.user_id) === String(postData.user_id || postData.user?.user_id || "");
                    if (isPostOwner) {
                        setCanComment(true);
                    }
                }
            } else {
                setComments([]);
            }
        } catch (err: any) {
            console.error('Error fetching comments:', err);
            if (err.response?.status === 403) {
                setError('You can only view comments when there is mutual following with the post owner');
            } else {
                setError('Failed to load comments');
            }
        } finally {
            setLoading(false);
        }
    };

    const getPostDetailsWithFallback = async () => {
        try {
            console.log("Attempting to get post details with multiple fallbacks");
            
            try {
                const response = await axios.get(
                    `http://localhost:3000/posts/detail/${idPost}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log("Got post details from primary endpoint");
                return response.data;
            } catch (err) {
                console.log("Primary post details endpoint failed, trying fallback");
            }
            
            try {
                const response = await axios.get(
                    `http://localhost:3000/comments/${idPost}/comments`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.data && response.data.post) {
                    console.log("Got post details from comments endpoint");
                    return response.data.post;
                }
            } catch (err) {
                console.log("Comments endpoint fallback failed");
            }
            
            try {
                const response = await axios.get(
                    `http://localhost:3000/posts/detail/${idPost}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log("Got post details from detail endpoint");
                return response.data;
            } catch (err) {
                console.log("Detail endpoint fallback failed");
            }
            
            console.error("All post detail endpoints failed");
            return null;
        } catch (err) {
            console.error("Error in getPostDetailsWithFallback:", err);
            return null;
        }
    };

    const checkCommentPermissions = async () => {
    try {
        if (!token || !idPost) return;
        
        console.log("Checking comment permissions directly");
        
        // Get post details through comments endpoint
        const commentsResponse = await axios.get(
        `http://localhost:3000/comments/${idPost}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Extract post and owner info from the response
        const postData = commentsResponse.data.post; // Assuming this is included in the response
        
        if (!postData) {
        console.error("Post data not found in comments response");
        return;
        }
        
        // Extract post owner ID
        let postOwnerId = null;
        if (postData.user_id) {
        postOwnerId = postData.user_id;
        } else if (postData.user && postData.user.user_id) {
        postOwnerId = postData.user.user_id;
        }
        
        if (!postOwnerId) {
        console.error("Could not determine post owner ID");
        return;
        }
        
        console.log("Found post owner ID:", postOwnerId);
        console.log("Current user ID:", currentUser.user_id);
        
        // Set post owner info
        setPostOwner({
        user_id: String(postOwnerId),
        username: postData.user?.username || postData.username || "Unknown"
        });
        
        // Check if current user is post owner
        if (String(currentUser.user_id) === String(postOwnerId)) {
        console.log("User is post owner - enabling comments");
        setCanComment(true);
        return;
        }
        
        // Check mutual following
        try {
        const mutualCheckResponse = await axios.get(
            `http://localhost:3000/follows/mutual/${postOwnerId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const hasMutual = mutualCheckResponse.data.mutualFollowing;
        console.log("Mutual following status:", hasMutual);
        setCanComment(hasMutual);
        } catch (followError) {
        console.error("Error checking mutual follow status:", followError);
        }
        
    } catch (error) {
        console.error("Error checking comment permissions:", error);
    }
    };

    // Update useEffect to call this function
    useEffect(() => {
    const initData = async () => {
        if (!token || !idPost) {
        navigate('/login');
        return;
        }

        try {
        setLoading(true);
        await checkCommentPermissions();
        await fetchComments();
        } catch (err) {
        console.error("Error during initialization:", err);
        setError("Failed to load data. Please try again.");
        } finally {
        setLoading(false);
        }
    };
    
    initData();
    }, [idPost]);
    
    useEffect(() => {
        if (replyTo && replyingToUser) {
            setNewComment(`@${replyingToUser.username} `);
        }
    }, [replyTo, replyingToUser]);
    

    // Update fungsi handleComment:

    // Update the handleComment function to properly handle post owner permissions

    const handleComment = async () => {
        try {
            setLoading(true);
            setError('');
            
            if (!token) {
                setError('Please login to comment');
                return;
            }
            
            if(!newComment.trim()) {
                setError('Comment cannot be empty');
                return;
            }

            console.log("Attempting to post comment");
            console.log("Current user ID:", String(currentUser.user_id));
            console.log("Post owner ID:", String(postOwner?.user_id));
            
            // Convert both to string for reliable comparison
            const isPostOwner = String(currentUser.user_id) === String(postOwner?.user_id);
            console.log("Is post owner:", isPostOwner);
            
            // Allow comment if user is post owner OR if mutual following was detected
            if (!canComment && !isPostOwner) {
                setError('You can only comment if there is mutual following with the post owner');
                return;
            }

            const response = await axios.post(
                `http://localhost:3000/comments/${idPost}/comments`,
                {
                    content: newComment,
                    parent_id: replyTo || null
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            console.log("Comment posted successfully:", response.data);
            
            setNewComment('');
            setReplyTo(null);
            setReplyingToUser(null);
            await fetchComments();
        } catch (err: any) {
            console.error('Error posting comment:', err);
            
            if (err.response?.status === 403) {
                setError('You can only comment if there is mutual following with the post owner');
            } else {
                setError('Failed to post comment: ' + (err.response?.data?.message || err.message));
            }
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
                href={`/profile/${username}`}
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

    const renderComment = (comment: CommentType) => (
        <Box key={comment.comment_id} className="comment-box" sx={{ mb: 2 }}>
            <Box className="comment-header" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar
                src={comment.user.profile_picture || '/default-avatar.png'}
                sx={{ width: 32, height: 32, mr: 1 }}
                onClick={() => navigate(`/profile/${comment.user.username}`)}
                style={{ cursor: 'pointer' }}
            />
            <Typography
                variant="subtitle2"
                onClick={() => navigate(`/profile/${comment.user.username}`)}
                style={{ cursor: 'pointer', fontWeight: 'bold' }}
            >
                {comment.user.username}
            </Typography>
            <Typography variant="body2" sx={{ ml: 1, flexGrow: 1 }}>
                {formatCommentText(comment.content)}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
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
            </Box>

            {editingId === comment.comment_id ? (
            <Box className="edit-box" sx={{ ml: 5 }}>
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
            <Box sx={{ ml: 5, display: 'flex', flexDirection: 'column' }}>
                <Box className="comment-actions" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                    {new Date(comment.createdAt).toLocaleDateString()}
                </Typography>
                
                {canComment && (
                    <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => {
                        setReplyTo(comment.comment_id);
                        setReplyingToUser({ id: comment.comment_id, username: comment.user.username });
                        setNewComment(`@${comment.user.username} `);
                    }}
                    >
                    Reply
                    </Typography>
                )}
                </Box>
            </Box>
            )}

            {replyTo === comment.comment_id && (
            <Box className="reply-box" sx={{ ml: 5, mt: 2 }}>
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

            {/* Show replies toggle button if there are replies */}
            {comment.replies && comment.replies.length > 0 && (
                <Box sx={{ ml: 5, mt: 1, pl: 2 }}>
                    <Typography 
                    variant="caption" 
                    className="view-replies-button"
                    onClick={() => toggleReplies(comment.comment_id)}
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: 'gray',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                    >
                    {expandedComments[comment.comment_id] 
                        ? `Hide replies` 
                        : `View replies (${comment.replies.length})`}
                    </Typography>
                </Box>
            )}

            {/* Render nested replies in a simplified manner */}
            {comment.replies && comment.replies.length > 0 && expandedComments[comment.comment_id] && (
                <Box className="replies-container" sx={{ ml: 5, pl: 2 }}>
                    {comment.replies.map(reply => renderReply(reply))}
                </Box>
            )}
        </Box>
    );

    const renderReply = (reply: CommentType) => (
        <Box key={reply.comment_id} className="reply-comment" sx={{ mt: 1, display: 'flex' }}>
            <Avatar
            src={reply.user.profile_picture || '/default-avatar.png'}
            sx={{ width: 24, height: 24, mr: 1 }}
            onClick={() => navigate(`/profile/${reply.user.username}`)}
            style={{ cursor: 'pointer' }}
            />
            <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Typography
                variant="subtitle2"
                onClick={() => navigate(`/profile/${reply.user.username}`)}
                style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                >
                {reply.user.username}
                </Typography>
                <Typography variant="body2" sx={{ ml: 1, fontSize: '0.85rem' }}>
                {formatCommentText(reply.content)}
                </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 0.5, alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                {new Date(reply.createdAt).toLocaleDateString()}
                </Typography>
                
                {canComment && (
                <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => {
                    setReplyTo(reply.parent_id); // Reply to the parent comment, not to the reply
                    setReplyingToUser({ id: reply.comment_id, username: reply.user.username });
                    setNewComment(`@${reply.user.username} `);
                    }}
                >
                    Reply
                </Typography>
                )}
                
                {canModifyComment(reply) && (
                <>
                    <IconButton
                    onClick={() => {
                        setEditingId(reply.comment_id);
                        setEditContent(reply.content);
                    }}
                    size="small"
                    sx={{ p: 0 }}
                    >
                    <EditIcon sx={{ fontSize: '0.85rem' }} />
                    </IconButton>
                    <IconButton
                    onClick={() => handleDelete(reply.comment_id)}
                    size="small"
                    sx={{ p: 0 }}
                    >
                    <DeleteIcon sx={{ fontSize: '0.85rem' }} />
                    </IconButton>
                </>
                )}
            </Box>
            
            {editingId === reply.comment_id && (
                <Box className="edit-box" sx={{ mt: 1 }}>
                <TextField
                    fullWidth
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    multiline
                    size="small"
                    error={!editContent.trim()}
                    helperText={!editContent.trim() ? 'Reply cannot be empty' : ''}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                    onClick={() => handleEdit(reply.comment_id)}
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
            )}
            </Box>
        </Box>
    );

    return (
        <Container maxWidth="md">
            <Box className="comments-container">
                <Button
                    variant="outlined"
                    sx={{ mb: 2 }}
                    onClick={() => navigate('/home')}
                >
                    Back to Home
                </Button>
                

                <Typography variant="h5" sx={{ mb: 2 }}>
                    Comments
                </Typography>

                {(canComment || (postOwner && String(currentUser.user_id) === String(postOwner.user_id))) && (
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
                )}

                {postOwner && !canComment && currentUser.user_id !== postOwner.user_id && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        You can only comment when there is mutual following with @{postOwner.username} (you both follow each other).
                    </Alert>
                )}

                {error && (
                    <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>Loading comments...</Box>
                    ) : comments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>No comments yet. {canComment ? 'Be the first to comment!' : ''}</Box>
                    ) : (
                    <Box className="comments-list" sx={{ mt: 3 }}>
                        {comments.map((comment) => renderComment(comment))}
                    </Box>
                )}
            </Box>
        </Container>
    );
}