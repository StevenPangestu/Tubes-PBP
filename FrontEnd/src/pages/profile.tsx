import { useEffect, useState, ChangeEvent } from 'react';
import {
  Container,
  Typography,
  Avatar,
  Box,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Button,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import axios from 'axios';
import { Post, User } from '../types';
import PostCard from '../components/postCard';
import { useNavigate } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';

const Profile = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  const [user, setUser] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  );
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [removePicture, setRemovePicture] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 3;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user || !token) return;
        const res = await axios.get<User>(
          `http://localhost:3000/users/${user.username}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data);
        setBio(res.data.bio || '');
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    fetchPostsPage(0);
  }, []);

  const fetchPostsPage = async (pageToLoad: number) => {
    try {
      if (!user || !token) return;

      const res = await axios.get<Post[]>(
        `http://localhost:3000/users/${user.username}/posts?page=${pageToLoad}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newPosts = res.data;

      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.post_id));
        const uniqueNew = newPosts.filter(p => !existingIds.has(p.post_id));
        return [...prev, ...uniqueNew];
      });

      if (newPosts.length < limit) setHasMore(false);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPostsPage(nextPage);
  };

  const handlePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
      setRemovePicture(false);
    }
  };

  const handleRemovePicture = () => {
    setConfirmOpen(true);
  };

  const confirmRemovePicture = () => {
    setProfilePicture(null);
    setPreview('');
    setRemovePicture(true);
    setConfirmOpen(false);
  };

  const handleSave = async () => {
    if (!user || !token) return;

    const bioChanged = bio !== (user.bio || '');
    const hasPictureChange = !!profilePicture || removePicture;

    if (!bioChanged && !hasPictureChange) {
      alert('Tidak ada perubahan data.');
      return;
    }

    const formData = new FormData();
    formData.append('bio', bio);
    if (profilePicture) {
      formData.append('profile_picture', profilePicture);
    } else if (removePicture) {
      formData.append('remove_picture', 'true');
    }

    try {
      const res = await axios.put(
        `http://localhost:3000/users/${user.user_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const updatedUser = res.data as User;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      setRemovePicture(false);
      alert('Profile updated!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile.');
    }
  };

  if (loading && posts.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Typography>User not found</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="flex-start" mb={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/home')}
          sx={{ textTransform: 'none' }}
        >
          Back to Home
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" gap={4}>
          <Box sx={{ position: 'relative', width: 120, height: 120 }}>
            <Avatar
              src={
                preview ||
                (user.profile_picture && `http://localhost:3000${user.profile_picture}`) ||
                '/default-avatar.png'
              }
              sx={{ width: 120, height: 120, objectFit: 'cover' }}
            />
            {isEditing && (preview || user.profile_picture) && (
              <Box
                onClick={handleRemovePicture}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  opacity: 0,
                  '&:hover': { opacity: 1 },
                  transition: 'opacity 0.3s',
                }}
              >
                <DeleteIcon sx={{ fontSize: 32, color: '#fff' }} />
              </Box>
            )}
          </Box>

          <Box flex={1}>
            <Typography variant="h5" fontWeight="bold">
              {user.username}
            </Typography>

            {isEditing ? (
              <>
                <TextField
                  label="Bio"
                  multiline
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  fullWidth
                  sx={{ mt: 2, mb: 2 }}
                />
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button variant="outlined" component="label">
                    Upload Picture
                    <input hidden type="file" accept="image/*" onChange={handlePictureChange} />
                  </Button>
                  <Button variant="contained" onClick={handleSave}>
                    Save Changes
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  {user.bio || 'No bio yet.'}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" gutterBottom>
        Posts
      </Typography>
      {posts.length > 0 ? (
        <>
          <Grid container spacing={2} alignItems="stretch">
            {posts.map((post) => (
              <Box key={post.post_id} sx={{ width: { xs: '100%', sm: '50%', md: '33.33%' }, p: 1 }}>
                <PostCard post={post} />
              </Box>
            ))}
          </Grid>
          {hasMore && (
            <Box textAlign="center" mt={2}>
              <Button variant="outlined" onClick={handleLoadMore}>
                Load More
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Typography color="text.secondary">No posts yet.</Typography>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Hapus Foto Profil?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah kamu yakin ingin menghapus foto profil?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="primary">
            Batal
          </Button>
          <Button onClick={confirmRemovePicture} color="error">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
