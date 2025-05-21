import { Bookmark, ChatBubble, Favorite, MoreHoriz } from '@mui/icons-material';
import { Alert, Box, Button, Dialog, Snackbar, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Collection, Post } from '../types';
import './postCard.css';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const [commentCount, setCommentCount] = useState(0);
  const navigate = useNavigate();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dialogMode, setDialogMode] = useState<'save' | 'unbookmarked'>('save');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [loadingBookmark, setLoadingBookmark] = useState(false);

  useEffect(() => {
    fetchCollections();
    checkIfPostBookmarked();
  }, [post.post_id]);

  const fetchCollections = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:3000/collections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCollections(response.data);
    } catch (err) {
      console.error('Error fetching collections:', err);
    }
  };

  const checkIfPostBookmarked = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `http://localhost:3000/collections/check-post/${post.post_id}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setIsBookmarked(response.data.isBookmarked);
    } catch (err) {
      console.error('Error checking bookmark status:', err);
    }
  };

  useEffect(() => {
    fetchCollections();
    checkIfPostBookmarked();
  }, [post.post_id]);

  const handleBookmarkClick = () => {
    if (isBookmarked) {
      setDialogMode('unbookmarked');
    } else {
      setDialogMode('save');
    }
    setSelectedCollectionId(null);
    setOpenDialog(true);
  };

  const handleUnbookmark = async () => {
    
    try {
      setLoadingBookmark(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      if (!selectedCollectionId) {
        setSnackbarMessage('Please select a collection to remove bookmark');
        setSnackbarOpen(true);
        return;
      }

      await axios.delete(
        `http://localhost:3000/collections/${selectedCollectionId}/posts/${post.post_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsBookmarked(false);
      setOpenDialog(false);
      setSnackbarMessage('Post removed from collection');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error unbookmarking post:', err);
      setSnackbarMessage('Failed to remove bookmark');
      setSnackbarOpen(true);
    } finally {
      setLoadingBookmark(false);
    }
  };


  const handleCollectionSelect = async (collectionId: string) => {
    try {
      setLoadingBookmark(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(
        `http://localhost:3000/collections/${collectionId}/posts`,
        { post_id: post.post_id },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      setIsBookmarked(true);
      setOpenDialog(false);
      setSnackbarMessage('Post saved to collection successfully!');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error saving to collection:', err);
      setSnackbarMessage('Failed to save post to collection');
      setSnackbarOpen(true);
    } finally {
      setLoadingBookmark(false);
    }
  };

  const fetchCommentCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(
          `http://localhost:3000/posts/${post.post_id}/comment-count`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Make sure we're accessing the correct property from the response
        if (response.data && (response.data.count !== undefined)) {
          setCommentCount(response.data.count);
        }
        
        // Add console.log for debugging
        console.log('Comment count response:', response.data);
      } catch (err) {
        console.error('Error fetching comment count:', err);
        // Add more detailed error logging
        if (axios.isAxiosError(err)) {
          console.error('Response data:', err.response?.data);
        }
      }
  };

  // Add a console.log to verify the post_id
  useEffect(() => {
      console.log('Fetching comments for post:', post.post_id);
      fetchCommentCount();
  }, [post.post_id]);

  useEffect(() => {
    fetchCommentCount();
  }, [post.post_id]);

  const handleCommentClick = () => {
    navigate(`/posts/${post.post_id}/comments`);
  };


  return (
    <div className="post-card">
      <div className="post-header">
        <div className="user-info">
          <img 
            src={post.user?.profile_picture || '/default-avatar.png'}
            alt={post.user?.username || 'user'} 
            className="user-avatar" 
          />
          <span className="username">{post.user?.username || 'unknown'}</span>
        </div>
        <button className="post-menu">
          <MoreHoriz />
        </button>
      </div>
      
      <div className="post-image-container">
        <img 
          src={`http://localhost:3000${post.image_url}`} 
          alt={post.caption}
          className="post-image"
        />
      </div>
      
      <div className="post-actions">
        <button className="action-btn">
          <Favorite /> {post.likes_count || 0}
        </button>
        <button className="action-btn" onClick={handleCommentClick}>
          <ChatBubble /> {commentCount !== undefined ? commentCount : '...'}
        </button>
        <div className="action-spacer"></div>
        <button
          className={`action-btn ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={handleBookmarkClick}
          disabled={loadingBookmark}
          title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <Bookmark />
        </button>
      </div>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        sx={{
          '& .MuiDialog-paper': {
            padding: 2,
            minWidth: '300px'
          }
        }}
      >
        {dialogMode === 'save' ? (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Save to Collection
            </Typography>

            {collections.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {collections.map((collection) => (
                  <Button
                    key={collection.collection_id}
                    variant="outlined"
                    fullWidth
                    onClick={() => handleCollectionSelect(collection.collection_id)}
                    disabled={loadingBookmark}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      textTransform: 'none'
                    }}
                  >
                    {collection.collection_name}
                  </Button>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">
                No collections found. Create one first!
              </Typography>
            )}
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Remove from Collection
            </Typography>

            {collections.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {collections.map((collection) => (
                  <Button
                    key={collection.collection_id}
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setSelectedCollectionId(collection.collection_id);
                      handleUnbookmark();
                    }}
                    disabled={loadingBookmark}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      textTransform: 'none'
                    }}
                  >
                    {collection.collection_name}
                  </Button>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">
                No collections found with this post.
              </Typography>
            )}
          </>
        )}
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarMessage.includes('Failed') ? 'error' : 'success'}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      <div className="post-caption">
        <span className="caption-user">@{post.user?.username || 'unknown'}</span>
        <span className="caption-text">{post.caption}</span>
      </div>
      
      {post.category && (
        <div className="post-category">
          #{post.category.category_name.toLowerCase()}
        </div>
      )}
    </div>
  );
};

export default PostCard;