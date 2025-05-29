import {
    Alert,
    Box,
    Button,
    Container,
    FormControl,
    MenuItem,
    Select,
    Typography
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './save.css';

interface Collection {
    collection_id: string;
    collection_name: string;
    posts_count?: number;
}

export default function SavePost() {
    const { postId } = useParams();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<string>('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
    const fetchCollections = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
            setError(true);
            setMessage('Please login to save posts');
            return;
            }

            const response = await axios.get('http://localhost:3000/collections', {
            headers: {
                Authorization: `Bearer ${token}`
            }
            });
            setCollections(response.data);
        } catch (err) {
            setError(true);
            setMessage('Failed to load collections');
        }
        };

        fetchCollections();
    }, []);

    const handleSave = async () => {
        if (!selectedCollection) {
        setError(true);
        setMessage('Please select a collection');
        return;
        }

        try {
        const token = localStorage.getItem('token');
        if (!token) {
            setError(true);
            setMessage('Please login to save posts');
            return;
        }

        await axios.post(
            `http://localhost:3000/collections/${selectedCollection}/posts`,
            { post_id: postId },
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
            }
        );

        setError(false);
        setMessage('Post saved to collection successfully!');
        setTimeout(() => {
            navigate(-1);
        }, 1500);
        } catch (err: any) {
        setError(true);
        setMessage(err.response?.data?.message || 'Failed to save post');
        }
    };

    return (
        <Container maxWidth="sm">
        <Box className="save-post-container">
            <Typography variant="h4" className="save-post-title">
            Save Post to Collection
            </Typography>

            <FormControl fullWidth>
            <Select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                displayEmpty
            >
                <MenuItem value="" disabled>
                Select a Collection
                </MenuItem>
                {collections.map((collection) => (
                <MenuItem 
                    key={collection.collection_id} 
                    value={collection.collection_id}
                >
                    {collection.collection_name} 
                    ({collection.posts_count || 0} posts)
                </MenuItem>
                ))}
            </Select>
            </FormControl>

            <Button
            onClick={handleSave}
            variant="contained"
            className="submit-button"
            fullWidth
            >
            Save Post
            </Button>

            <Button
            onClick={() => navigate(-1)}
            variant="outlined"
            className="cancel-button"
            fullWidth
            >
            Cancel
            </Button>

            {message && (
            <Alert severity={error ? 'error' : 'success'}>
                {message}
            </Alert>
            )}
        </Box>
        </Container>
    );
}