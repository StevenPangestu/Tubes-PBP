import { useEffect, useState, ChangeEvent, SyntheticEvent } from 'react';
import './profile.css';
import { formatProfilePictureUrl } from '../utils/imageUtils';
import {
  Container,
  Typography,
  Avatar,
  Box,
  CircularProgress,
  Paper,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import axios from 'axios';
import { Post, User } from '../types';
import PostCard from '../components/postCard';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const Profile = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const storedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  const [currentUser, setCurrentUser] = useState<User | null>(
    storedUser ? JSON.parse(storedUser) : null
  );
  const [user, setUser] = useState<User | null>(null);
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
const [editUsername, setEditUsername] = useState<string>('');
const [editEmail, setEditEmail] = useState<string>('');
  const [preview, setPreview] = useState<string>('');
  const [removePicture, setRemovePicture] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [tabValue, setTabValue] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 3;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) return;
        
        const targetUsername = username || (currentUser?.username);
        if (!targetUsername) return;
        
        setLoading(true);
        const res = await axios.get<User>(
          username
            ? `http://localhost:3000/users/${username}`
            : `http://localhost:3000/users/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUser(res.data);
        setBio(res.data.bio || '');
        setEditUsername(res.data.username);
        setEditEmail(res.data.email);
        setFollowersCount(res.data.followersCount || 0);
        setFollowingCount(res.data.followingCount || 0);

        setIsFollowing(res.data.isFollowing || false);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setLoading(false);
      }
    };

    fetchUser();
  }, [username, token, currentUser?.username, currentUser?.user_id]);
  useEffect(() => {
    if (user) {
      if (posts.length === 0) {
        fetchPostsPage(0);
      }
    }
  }, [user]);
  const fetchPostsPage = async (pageToLoad: number) => {
    try {
      if (!user || !token) return;
      const res = await axios.get(
        `http://localhost:3000/users/${user.username}/posts?page=${pageToLoad}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;
      const newPosts: Post[] = data.posts;

      setHasMore(data.hasMore);

      if (pageToLoad === 0 && posts.length > 0) {
        const existingIds = new Set(posts.map(p => p.post_id));
        const hasChanges = newPosts.some(p => !existingIds.has(p.post_id)) || 
                          newPosts.length !== posts.length;
                          
        if (hasChanges) {
          setPosts(newPosts);
        }
      } else if (pageToLoad === 0) {
        setPosts(newPosts);
      } else {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.post_id));
          const uniqueNew = newPosts.filter(p => !existingIds.has(p.post_id));
          return [...prev, ...uniqueNew];
        });
      }

      setHasMore(newPosts.length >= limit);
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

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts(prev =>
      prev.map(p => (p.post_id === updatedPost.post_id ? updatedPost : p))
    );
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
  };    const confirmRemovePicture = async () => {
    const currentPosts = [...posts];
    
    setProfilePicture(null);
    setPreview('');
    setRemovePicture(true);
    setConfirmOpen(false);
    
    setTimeout(() => {
      setPosts(currentPosts);
    }, 100);

    if (isOwnProfile && user && token) {
      try {
        const formData = new FormData();
        formData.append('username', editUsername);
        formData.append('email', editEmail);
        formData.append('bio', bio);
        formData.append('remove_picture', 'true');

        
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
        
        setUser({
          ...updatedUser,
          posts: currentPosts
        });
        if (currentUser && currentUser.user_id === updatedUser.user_id) {
          const userForStorage = {
            ...updatedUser,
            posts: currentUser.posts || []
          };
          localStorage.setItem('user', JSON.stringify(userForStorage));
        }
        
        setRemovePicture(false);
        
        alert('Foto profil berhasil dihapus!');
      } catch (err) {
        console.error('Failed to update profile:', err);
        alert('Gagal menghapus foto profil.');
      }
    }
  };

  const handleSave = async () => {
  if (!user || !token) return;

  const bioChanged = bio !== (user.bio || '');
  const usernameChanged = editUsername !== user.username;
  const emailChanged = editEmail !== user.email;
  const hasPictureChange = !!profilePicture || removePicture;

  if (!bioChanged && !usernameChanged && !emailChanged && !hasPictureChange) {
    alert('Tidak ada perubahan data.');
    return;
  }

  if (bio.length > 500) {
    alert('Bio tidak boleh lebih dari 500 karakter.');
    return;
  }

  const formData = new FormData();
  formData.append('bio', bio);
  formData.append('username', editUsername);
  formData.append('email', editEmail);
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

    const updatedUser = res.data.user as User;

    setUser(prev => ({
      ...updatedUser,
      posts: posts
    }));

    if (currentUser && currentUser.user_id === updatedUser.user_id) {
      const userForStorage = {
        ...updatedUser,
        posts: currentUser.posts || []
      };
      localStorage.setItem('user', JSON.stringify(userForStorage));
      setCurrentUser(userForStorage);
    }

    setIsEditing(false);
    setRemovePicture(false);
    alert('Profile updated!');
  } catch (err: any) {
    console.error('Failed to update profile:', err);
    alert(err.response?.data?.message || 'Failed to update profile.');
  }
};

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    

    if (newValue === 1 && followers.length === 0) {
      fetchFollowers();
    } else if (newValue === 2 && following.length === 0) {
      fetchFollowing();
    }
  };

  const fetchFollowers = async () => {
    if (!user || !token) return;
    try {
      const res = await axios.get(`http://localhost:3000/follows/followers/${user.user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFollowers(res.data);
    } catch (err) {
      console.error('Error fetching followers:', err);
    }
  };

  const fetchFollowing = async () => {
    if (!user || !token) return;
    try {
      const res = await axios.get(`http://localhost:3000/follows/following/${user.user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFollowing(res.data);
    } catch (err) {
      console.error('Error fetching following:', err);
    }
  };

  const handleFollow = async () => {
    if (!user || !currentUser || !token || currentUser.user_id === user.user_id) return;
    
    setLoadingFollow(true);
    try {
      if (!isFollowing) {
        await axios.post(
          `http://localhost:3000/follows/${user.user_id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      } else {
        await axios.delete(`http://localhost:3000/follows/${user.user_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Follow/unfollow error:', err);
    } finally {
      setLoadingFollow(false);
    }
  };

  if (loading && !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Typography>User not found</Typography>;

  const isOwnProfile = currentUser?.user_id === user.user_id;

  return (
    <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
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
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={4} className="profile-header">
          <Box sx={{ position: 'relative', width: 120, height: 120 }}>            <Avatar
              src={
                preview || 
                (removePicture ? '/default-avatar.png' : formatProfilePictureUrl(user.profile_picture, '/default-avatar.png'))
              }
              sx={{ width: 120, height: 120, objectFit: 'cover' }}
              className="profile-avatar"
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
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h5" fontWeight="bold">
                {user.username}
              </Typography>
              
              {!isOwnProfile && currentUser && (
                <Tooltip title={isFollowing ? "Unfollow" : "Follow"}>
                  <IconButton 
                    color={isFollowing ? "primary" : "default"}
                    onClick={handleFollow}
                    disabled={loadingFollow}
                    sx={{ ml: 2 }}
                  >
                    {loadingFollow ? (
                      <CircularProgress size={24} />
                    ) : isFollowing ? (
                      <PersonRemoveIcon />
                    ) : (
                      <PersonAddIcon />
                    )}
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Box display="flex" mt={2} mb={2} gap={4} className="profile-stats">
              <Box className="profile-stat-item" onClick={() => setTabValue(0)} sx={{ cursor: 'pointer' }}>
                <Typography className="profile-stat-number">{posts.length}</Typography>
                <Typography className="profile-stat-label">posts</Typography>
              </Box>
              <Box className="profile-stat-item" onClick={() => setTabValue(1)} sx={{ cursor: 'pointer' }}>
                <Typography className="profile-stat-number">{followersCount}</Typography>
                <Typography className="profile-stat-label">followers</Typography>
              </Box>
              <Box className="profile-stat-item" onClick={() => setTabValue(2)} sx={{ cursor: 'pointer' }}>
                <Typography className="profile-stat-number">{followingCount}</Typography>
                <Typography className="profile-stat-label">following</Typography>
              </Box>
            </Box>

            {isEditing ? (
              <>
                  <TextField
                    label="Username"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    fullWidth
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    label="Email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    fullWidth
                    sx={{ mt: 2 }}
                  />
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
                  </Button>                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={() => {
                      setIsEditing(false);
                      setRemovePicture(false);
                      setPreview('');
                      setBio(user.bio || '');
                      setEditUsername(user.username);
                      setEditEmail(user.email);
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </>
            ) : (
              <>
                <Typography color="text.secondary">
                  {user.bio || 'No bio yet.'}
                </Typography>
                {isOwnProfile && (
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ width: '100%', mt: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs" centered>
            <Tab label="Posts" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
            <Tab label="Followers" id="profile-tab-1" aria-controls="profile-tabpanel-1" />
            <Tab label="Following" id="profile-tab-2" aria-controls="profile-tabpanel-2" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {posts.length > 0 ? (
            <>
              <Box className="profile-posts-grid" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                {posts.map((post) => (
                  <Box key={post.post_id} sx={{ height: '100%' }}>
                    <PostCard 
                      post={post}
                      onPostDeleted={(post_id) =>
                        setPosts((prev) => prev.filter((p) => p.post_id !== post_id))
                      }
                      onPostUpdate={handlePostUpdate}
                    />
                  </Box>
                ))}
              </Box>
              {hasMore && (
                <Box textAlign="center" mt={3}>
                  <Button variant="outlined" onClick={handleLoadMore}>
                    Load More
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>No posts yet.</Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {followers.length > 0 ? (
            <List>
              {followers.map((follower) => (
                <ListItem key={follower.user_id} divider className="profile-follower-item">
                  <ListItemAvatar>                    <Avatar 
                      src={formatProfilePictureUrl(follower.profile_picture)} 
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={follower.username}
                    secondary={follower.bio || ''}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/profile/${follower.username}`)}
                    >
                      View
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>No followers yet.</Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {following.length > 0 ? (
            <List>
              {following.map((followedUser) => (
                <ListItem key={followedUser.user_id} divider className="profile-follower-item">
                  <ListItemAvatar>                    <Avatar 
                      src={formatProfilePictureUrl(followedUser.profile_picture)} 
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={followedUser.username}
                    secondary={followedUser.bio || ''}
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                  <ListItemSecondaryAction>
                    <Button 
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/profile/${followedUser.username}`)}
                    >
                      View
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>Not following anyone yet.</Typography>
          )}
        </TabPanel>
      </Box>      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Hapus Foto Profil?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah kamu yakin ingin menghapus foto profil? Tindakan ini akan langsung diterapkan.
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
