import { useEffect, useState } from 'react';
import '../styles/createPost.css';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
} from '@mui/material';
import { API } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface Category {
  category_id: string;
  category_name: string;
}

export default function CreatePost() {
  const [caption, setCaption] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get<Category[]>('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error(err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile || !caption || !categoryId) {
      setMessage('Please fill all fields');
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
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('caption', caption);
      formData.append('category_id', categoryId);

      await API.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Post created successfully!');
      setError(false);
      navigate('/home');
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Failed to create post');
      setError(true);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} className="create-post-container">
        <Typography variant="h4" className="create-post-title">Create Post</Typography>
        <TextField
          label="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          required
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="category-label">Category</InputLabel>
          <Select
            labelId="category-label"
            value={categoryId}
            label="Category"
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            {categories.map((cat) => (
              <MenuItem key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" component="label">
          Upload Image
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
        </Button>
        {imageFile && <Typography>{imageFile.name}</Typography>}
        {imageFile && (
          <div className="upload-preview">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Preview"
            />
          </div>
        )}
        <Button type="submit" variant="contained" fullWidth className="submit-button">
          Submit
        </Button>
        <Button onClick={() => navigate('/home')} variant="outlined" fullWidth className="cancel-button">
          Cancel
        </Button>
        {message && <Alert severity={error ? 'error' : 'success'}>{message}</Alert>}
      </Box>
    </Container>
  );
}
