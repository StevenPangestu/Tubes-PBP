import { Add, Logout, Search } from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Button,
  IconButton,
  TextField,
  Toolbar,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/postCard';
import { Post, User } from '../types';
import './home.css';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 3;

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!storedUser || !token) return;

      const parsedUser = JSON.parse(storedUser);

      try {
        const res = await axios.get<User>(
          `http://localhost:3000/users/${parsedUser.username}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      } catch (err) {
        console.error('Failed to refresh user data:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    };

    loadUser();
  }, []);

  const fetchPosts = async (pageToLoad: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<Post[]>(
        `http://localhost:3000/posts?page=${pageToLoad}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newPosts = response.data;

      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.post_id));
        const uniqueNew = newPosts.filter(p => !existingIds.has(p.post_id));
        return [...prev, ...uniqueNew];
      });

      if (newPosts.length < limit) {
        setHasMore(false);
      }
    } catch (err: any) {
      console.error(err);
      setError('Login to see posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(0);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="home-container">
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar className="app-header">
          <h1 className="logo">HBGAG</h1>

          <div className="search-bar">
            <TextField
              placeholder="Search..."
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <Search fontSize="small" color="action" />,
              }}
            />
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                <IconButton onClick={() => navigate('/create')}>
                  <Add />
                </IconButton>
                <IconButton onClick={() => navigate(`/users/${user.username}`)}>
                  <Avatar
                    src={
                      user.profile_picture
                        ? `http://localhost:3000${user.profile_picture}`
                        : '/default-avatar.png'
                    }
                    alt={user.username}
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
                <IconButton onClick={handleLogout}>
                  <Logout fontSize="small" />
                </IconButton>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/login')} variant="outlined" size="small" sx={{ mr: 1 }}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')} variant="contained" size="small">
                  Register
                </Button>
              </>
            )}
          </div>
        </Toolbar>
      </AppBar>

      <main className="posts-container">
        {loading && posts.length === 0 ? (
          <div className="loading">Loading posts...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="posts-grid">
              {posts.map((post) => (
                <PostCard key={post.post_id} post={post} />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Button variant="outlined" onClick={handleLoadMore}>
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
