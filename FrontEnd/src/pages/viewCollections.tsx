import { Add, ArrowBack } from '@mui/icons-material';
import {
    Alert,
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    IconButton,
    Toolbar,
    Typography
} from '@mui/material';
import { API } from '../utils/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Collection } from '../types';
import '../styles/viewCollections.css';

export default function ViewCollections() {
    const navigate = useNavigate();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await API.get('/collections');     

                setCollections(response.data);
            } catch (err) {
                console.error('Error fetching collections:', err);
                setError('Failed to load collections');
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, [navigate]);

    return (
        <Container maxWidth="sm">
            <Box className="collections-container">
                <AppBar position="static" color="inherit" elevation={1}>
                    <Toolbar>
                        <IconButton edge="start" onClick={() => navigate('/home')}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            My Collections
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => navigate('/collections/create')}
                            className="create-button"
                        >
                            New Collection
                        </Button>
                    </Toolbar>
                </AppBar>

                <Box className="collections-list">
                    {loading ? (
                        <Typography align="center" sx={{ mt: 2 }}>
                            Loading collections...
                        </Typography>
                    ) : error ? (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    ) : collections.length === 0 ? (
                        <Box className="empty-state">
                            <Typography align="center" sx={{ mt: 2 }}>
                                No collections found
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => navigate('/collections/create')}
                                className="create-button"
                                sx={{ mt: 2 }}
                            >
                                Create Your First Collection
                            </Button>
                        </Box>
                    ) : (
                        collections.map((collection) => (
                            <Card
                                key={collection.collection_id}
                                className="collection-card"
                                onClick={() => navigate(`/collections/${collection.collection_id}`)}
                            >
                                <CardContent>
                                <Typography variant="h6">
                                    {collection.collection_name}
                                </Typography>
                                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                    {collection.posts_count || 0} posts
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Created: {new Date(collection.createdAt || '').toLocaleDateString()}
                                </Typography>
                            </CardContent>
                            </Card>
                        ))
                    )}
                </Box>
            </Box>
        </Container>
    );
}