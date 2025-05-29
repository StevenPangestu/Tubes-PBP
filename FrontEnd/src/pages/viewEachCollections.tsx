import { ArrowBack } from '@mui/icons-material';
import {
    Alert,
    AppBar,
    Box,
    Container,
    IconButton,
    Paper,
    Toolbar,
    Typography
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Collection, Post } from '../types';

interface CollectionWithPosts extends Collection {
    posts?: Post[];
}

export default function ViewEachCollections() {
    const navigate = useNavigate();
    const { collectionId } = useParams();
    const [collection, setCollection] = useState<CollectionWithPosts | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`http://localhost:3000/collections/${collectionId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setCollection(response.data);
            } catch (err) {
                console.error('Error fetching collection:', err);
                setError('Failed to load collection');
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, [collectionId, navigate]);

    return (
        <Container maxWidth="md">
            <Box>
                <AppBar position="static" color="inherit" elevation={1}>
                    <Toolbar>
                        <IconButton edge="start" onClick={() => navigate('/collections')}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            {collection?.collection_name || 'Loading...'}
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Box sx={{ mt: 2 }}>
                    {loading ? (
                        <Typography align="center">Loading collection...</Typography>
                    ) : error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : collection ? (
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                {collection.collection_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {collection.posts?.length || 0} posts saved
                            </Typography>
                            
                            <Box sx={{ 
                                mt: 2, 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)', // Change to grid layout with 2 columns
                                gap: 2,
                                maxWidth: '100%',
                                margin: '0 auto',
                                padding: '16px'
                            }}>
                                {collection.posts && collection.posts.length > 0 ? (
                                    collection.posts.map((post) => (
                                        <Paper
                                            key={post.post_id}
                                            elevation={3}
                                            sx={{
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                backgroundColor: '#ffffff',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    transition: 'transform 0.2s ease-in-out',
                                                    boxShadow: 3
                                                }
                                            }}
                                        >
                                            <img
                                                src={`http://localhost:3000${post.image_url}`}
                                                alt={post.caption}
                                                style={{
                                                    width: '100%',
                                                    height: '200px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px 4px 0 0'
                                                }}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/default-post-image.png';
                                                }}
                                            />
                                            <Box sx={{ p: 2 }}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        mb: 1,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {post.caption}
                                                </Typography>
                                                <Typography 
                                                    variant="caption" 
                                                    color="text.secondary"
                                                    sx={{ display: 'block', mt: 1 }}
                                                >
                                                    Posted by {post.user?.username} on {new Date(post.createdAt || '').toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    ))
                                ) : (
                                    <Alert severity="info" sx={{ gridColumn: '1 / -1' }}> {/* Span alert across both columns */}
                                        No posts in this collection yet
                                    </Alert>
                                )}
                            </Box>
                        </Box>
                    ) : (
                        <Alert severity="error">Collection not found</Alert>
                    )}
                </Box>
            </Box>
        </Container>
    );
}