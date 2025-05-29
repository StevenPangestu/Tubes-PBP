import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/createCollection.css';
import { API } from '../utils/api'; // Ganti import ini

export default function CreateCollection() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);
        setMessage('');
        
        if (!title.trim()) {
            setMessage('Please enter a collection title');
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
            console.log('Sending request with data:', { collection_name: title.trim() });
            
            const response = await API.post(
                '/collections',
                {
                    collection_name: title.trim()
                }
            );

            console.log('Server response:', response.data);

            if (response.status === 201 && response.data) {
                setMessage('Collection created successfully!');
                setError(false);
                setTimeout(() => {
                    navigate('/collections');
                }, 1500);
            }
        } catch (err: any) {
            console.error('Create collection error:', err.response?.data);
            setMessage(
                err.response?.data?.message ||
                'Failed to create collection'
            );
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
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    fullWidth
                    margin="normal"
                    error={error && !title.trim()}
                    helperText={error && !title.trim() ? 'Title is required' : ''}
                />
                
                <Button
                    type="submit"
                    variant="contained"
                    className="submit-button"
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={!title.trim()}
                >
                    Create Collection
                </Button>
                
                <Button
                    onClick={() => navigate('/collections')}
                    variant="outlined"
                    className="cancel-button"
                    fullWidth
                    sx={{ mt: 1 }}
                >
                    Cancel
                </Button>
                
                {message && (
                    <Alert 
                        severity={error ? 'error' : 'success'}
                        sx={{ mt: 2 }}
                    >
                        {message}
                    </Alert>
                )}
            </Box>
        </Container>
    );
}