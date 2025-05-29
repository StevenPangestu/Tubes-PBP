import {
  Add, Logout, Search
} from '@mui/icons-material';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import {
  AppBar, Avatar, Button, ButtonGroup, IconButton,
  Stack,
  TextField, Toolbar
} from '@mui/material';
import { API } from '../utils/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/postCard';
import { Post, User } from '../types';
import { formatProfilePictureUrl } from '../utils/imageUtils';
import '../styles/home.css';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const limit = 3;

  const [activeTab, setActiveTab] = useState<'home' | 'trending'>('home');
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingError, setTrendingError] = useState('');
  const [trendingHours, setTrendingHours] = useState(24);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (!storedUser || !token) return;

      const parsedUser = JSON.parse(storedUser);

      try {
        const res = await API.get<User>(`/users/${parsedUser.username}`);
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

const fetchPosts = async (pageToLoad: number, searchTerm?: string) => {
  try {
    let url: string;

    if (searchTerm && searchTerm.trim()) {
      url = `/search/posts?q=${encodeURIComponent(searchTerm.trim())}&page=${pageToLoad}&limit=${limit}`;
    } else {
      url = `/posts?page=${pageToLoad}&limit=${limit}`;
    }

    const response = await API.get(url);

    const data = response.data;
    const newPosts: Post[] = data.posts ?? data; // fallback jika backend kirim langsung array
    const hasMoreFromResponse = data.hasMore ?? false;

    setPosts(prev => {
      const existingIds = new Set(prev.map(p => p.post_id));
      const uniqueNew = newPosts.filter(p => !existingIds.has(p.post_id));
      return pageToLoad === 0 ? newPosts : [...prev, ...uniqueNew];
    });

    setHasMore(hasMoreFromResponse);
  } catch (err: any) {
    console.error(err);
    setError('Login to see posts');
  } finally {
    setLoading(false);
  }
};

  const fetchTrending = async (hours: number, searchTerm?: string) => {
    setTrendingLoading(true);
    setTrendingError('');
    try {
      let url = '';
      
      if (searchTerm && searchTerm.trim()) {
        url = `/search/posts?q=${encodeURIComponent(searchTerm.trim())}&page=0&limit=10`;
      } else {
        url = `/posts/trending?hours=${hours}`;
      }

      const response = await API.get(url);

      let newPosts: Post[];
      if (searchTerm && searchTerm.trim()) {
        newPosts = response.data.posts;
      } else {
        newPosts = response.data;
      }

      setTrendingPosts(newPosts);
    } catch (err) {
      setTrendingError('Login to see trending posts');
    } finally {
      setTrendingLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'home') {
      setLoading(true);
      fetchPosts(0, search);
      setPage(0);
    }
  }, [activeTab, search]);

  useEffect(() => {
    if (activeTab === 'trending') {
      fetchTrending(trendingHours, search);
    }
  }, [activeTab, trendingHours, search]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, search);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handlePostDeleted = (post_id: string) => {
    setPosts(prev => prev.filter(post => post.post_id !== post_id));
  };

  const handleTrendingPostDeleted = (post_id: string) => {
    setTrendingPosts(prev => prev.filter(post => post.post_id !== post_id));
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
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search fontSize="small" color="action" />,
              }}
            />
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                <IconButton onClick={() => navigate('/collections')}>
                  <CollectionsBookmarkIcon />
                </IconButton>
                <IconButton 
                  onClick={() => navigate('/create')}
                  sx={{ color: '#ff5700' }}
                >
                  <Add />
                </IconButton>                <IconButton onClick={() => navigate(`/profile`)}>
                  <Avatar
                    src={formatProfilePictureUrl(user.profile_picture, '/default-avatar.png')}
                    alt={user.username}
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
                <IconButton onClick={handleLogout} sx={{ color: '#666' }}>
                  <Logout fontSize="small" />
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/login')}
                  variant="outlined"
                  size="small"
                  sx={{
                    mr: 1,
                    borderColor: '#ff5700',
                    color: '#ff5700',
                    '&:hover': {
                      backgroundColor: 'rgba(255,87,0,0.1)',
                    }
                  }}
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: '#ff5700',
                    '&:hover': {
                      backgroundColor: '#ff4400'
                    }
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </Toolbar>
      </AppBar>

      <div className="tab-switcher" style={{ display: 'flex', gap: 8, margin: '18px 0', justifyContent: 'center' }}>
        <Button
          variant={activeTab === 'home' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('home')}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          For You
        </Button>
        <Button
          variant={activeTab === 'trending' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('trending')}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          🔥 Trending
        </Button>
        {activeTab === 'trending' && (
          <ButtonGroup sx={{ ml: 2 }}>
            {[24, 168, 720].map(h => (
              <Button
                key={h}
                variant={trendingHours === h ? 'contained' : 'outlined'}
                onClick={() => setTrendingHours(h)}
              >
                {h === 24 ? 'Today' : h === 168 ? 'Week' : 'Month'}
              </Button>
            ))}
          </ButtonGroup>
        )}
      </div>

      <main className="posts-container">
        {activeTab === 'home' ? (
          loading && posts.length === 0 ? (
            <div className="loading">Loading posts...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <>
              <div className="posts-grid">
                {posts.map(post => (
                  <PostCard
                    key={post.post_id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                    onPostUpdate={(updated) =>
                      setPosts(prev => prev.map(p => p.post_id === updated.post_id ? updated : p))
                    }
                  />
                ))}
              </div>
              {hasMore && (
                <div className="load-more-container">
                  <Button variant="outlined" onClick={handleLoadMore}>
                    Load More
                  </Button>
                </div>
              )}
            </>
          )
        ) : (
          trendingLoading ? (
            <div className="loading">Loading trending posts...</div>
          ) : trendingError ? (
            <div className="error">{trendingError}</div>
          ) : trendingPosts.length === 0 ? (
            <div className="error">No trending posts for this period.</div>
          ) : (
            <Stack spacing={3} alignItems="center">
              {trendingPosts.map(post => (
                <PostCard
                  key={post.post_id}
                  post={post}
                  showTrendingInfo={true}
                  trendingLikesLabel={`likes ${trendingHours}h`}
                  onPostDeleted={handleTrendingPostDeleted}
                  onPostUpdate={(updated) =>
                    setTrendingPosts(prev =>
                      prev.map(p => p.post_id === updated.post_id ? updated : p)
                    )
                  }
                />
              ))}
            </Stack>
          )
        )}
      </main>
    </div>
  );
};

export default Home;
