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
import './Comments.css';

    interface CommentType {
    comment_id: string;
    content: string;
    user: {
        username: string;
        profile_picture: string;
    };
    replies?: CommentType[];
    createdAt: string;
    }

    export default function Comments() {
    const { idPost } = useParams();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchComments();
    }, [idPost]);

    const fetchComments = async () => {
        try {
        const response = await axios.get(`http://localhost:3000/posts/${idPost}/comments`);
        setComments(response.data);
        } catch (err) {
        setError('Failed to load comments');
        }
    };

    const handleComment = async (parentId?: string) => {
        try {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please login to comment');
            return;
        }

        await axios.post(
            `http://localhost:3000/posts/${idPost}/comments`,
            {
            content: newComment,
            parent_id: parentId
            },
            {
            headers: { Authorization: `Bearer ${token}` }
            }
        );

        setNewComment('');
        setReplyTo(null);
        fetchComments();
        } catch (err) {
        setError('Failed to post comment');
        }
    };

    const handleEdit = async (idComment: string) => {
        try {
        const token = localStorage.getItem('token');
        await axios.put(
            `http://localhost:3000/comments/${idComment}`,
            { content: editContent },
            {
            headers: { Authorization: `Bearer ${token}` }
            }
        );

        setEditingId(null);
        fetchComments();
        } catch (err) {
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

        fetchComments();
        } catch (err) {
        setError('Failed to delete comment');
        }
    };

    const renderComment = (comment: CommentType, isReply = false) => (
        <Box key={comment.comment_id} className={`comment-box ${isReply ? 'reply' : ''}`}>
        <Box className="comment-header">
            <Avatar src={comment.user.profile_picture} />
            <Typography variant="subtitle2">{comment.user.username}</Typography>
        </Box>

        {editingId === comment.comment_id ? (
            <Box className="edit-box">
            <TextField
                fullWidth
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                multiline
            />
            <Button onClick={() => handleEdit(comment.comment_id)}>Save</Button>
            <Button onClick={() => setEditingId(null)}>Cancel</Button>
            </Box>
        ) : (
            <>
            <Typography className="comment-content">{comment.content}</Typography>
            <Box className="comment-actions">
                {!isReply && (
                <IconButton onClick={() => setReplyTo(comment.comment_id)}>
                    <ReplyIcon />
                </IconButton>
                )}
                <IconButton onClick={() => {
                setEditingId(comment.comment_id);
                setEditContent(comment.content);
                }}>
                <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(comment.comment_id)}>
                <DeleteIcon />
                </IconButton>
            </Box>
            </>
        )}

        {replyTo === comment.comment_id && (
            <Box className="reply-box">
            <TextField
                fullWidth
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a reply..."
                multiline
            />
            <Button onClick={() => handleComment(comment.comment_id)}>Reply</Button>
            <Button onClick={() => setReplyTo(null)}>Cancel</Button>
            </Box>
        )}

        {comment.replies?.map(reply => renderComment(reply, true))}
        </Box>
    );

    return (
        <Container maxWidth="md">
        <Box className="comments-container">
            <Typography variant="h5">Comments</Typography>
            
            <Box className="new-comment-box">
            <TextField
                fullWidth
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                multiline
            />
            <Button
                onClick={() => handleComment()}
                variant="contained"
                className="submit-button"
            >
                Comment
            </Button>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Box className="comments-list">
            {comments.map(comment => renderComment(comment))}
            </Box>
        </Box>
        </Container>
    );
    }