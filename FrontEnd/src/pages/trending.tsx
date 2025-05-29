import { useEffect, useState } from 'react';
import axios from 'axios';
import PostCard from '../components/postCard';
import { Post } from '../types';
import { Box, Typography, ButtonGroup, Button, Stack } from '@mui/material';

const trendingPeriods = [
  { label: "Today", value: 24 },
  { label: "Week", value: 168 },
  { label: "Month", value: 720 },
  { label: "All", value: 99999 },
];

const Trending = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hours, setHours] = useState<number>(24);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    axios.get<Post[]>(`/posts/trending?hours=${hours}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => setPosts(res.data))
      .catch(() => setPosts([]))
      .then(() => setLoading(false));
  }, [hours]);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={2} color="primary">
        Trending Posts
      </Typography>
      <ButtonGroup sx={{ mb: 3 }}>
        {trendingPeriods.map(opt => (
          <Button
            key={opt.label}
            variant={hours === opt.value ? "contained" : "outlined"}
            onClick={() => setHours(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </ButtonGroup>
      {loading ? (
        <Typography align="center">Loading...</Typography>
      ) : posts.length === 0 ? (
        <Typography align="center" color="text.secondary">
          No trending posts for this period.
        </Typography>
      ) : (
        <Stack spacing={3} className="trending-post" alignItems="center">
          {posts.map(post => (
            <PostCard
              key={post.post_id}
              post={post}
              showTrendingInfo={true}
              trendingLikesLabel={`likes ${hours}h`}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default Trending;
