import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './createCollection.css';

export default function CreateCollection() {
    const [collectionName, setCollectionName] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!collectionName.trim()) {
        setMessage('Please enter a collection name');
        setError(true);
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        setMessage('User not authenticated');
        setError(true);
        return;
    }

    try {
        await axios.post(
        'http://localhost:3000/collections',
        { collection_name: collectionName },
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        setMessage('Collection created successfully!');
        setError(false);
        setTimeout(() => {
        navigate('/save');
        }, 1500);
    } catch (err: any) {
        setMessage(err.response?.data?.message || 'Failed to create collection');
        setError(true);
    }
    };

    return (
    <Container maxWidth="sm">
        <Box
        component="form"
        onSubmit={handleCreate}
        className="create-collection-container"
        >
        <Typography variant="h4" className="create-collection-title">
            Create New Collection
        </Typography>
        
        <TextField
            label="Collection Name"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            required
            fullWidth
        />
        
        <Button
            type="submit"
            variant="contained"
            className="submit-button"
            fullWidth
            >
            Create Collection
        </Button>
        
        <Button
            onClick={() => navigate('/save')}
            variant="outlined"
            className="cancel-button"
            fullWidth
        >
            Cancel
        </Button>
        
        {message && <Alert severity={error ? 'error' : 'success'}>{message}</Alert>}
        </Box>
    </Container>
    );
}