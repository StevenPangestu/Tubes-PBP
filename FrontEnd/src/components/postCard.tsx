// PostCard.tsx
import './postCard.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Favorite, FavoriteBorder, ChatBubble, MoreHoriz, Bookmark
} from '@mui/icons-material';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogTitle, Menu, MenuItem, Snackbar, TextField, Select, MenuItem as MuiMenuItem, Typography
} from '@mui/material';
import axios from 'axios';
import defaultAvatar from '../assets/default-avatar.png';
import { Post, Category, Collection } from '../types';
import { formatProfilePictureUrl, formatPostImageUrl } from '../utils/imageUtils';

interface PostCardProps {
  post: Post;
  onPostDeleted?: (post_id: string) => void;
  onPostUpdate?: (updatedPost: Post) => void;
  showTrendingInfo?: boolean;
  trendingLikesLabel?: string;
}

const PostCard = ({
  post,
  onPostDeleted,
  onPostUpdate,
  showTrendingInfo,
  trendingLikesLabel
}: PostCardProps) => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const isOwner = currentUser.user_id === post.user_id;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption);
  const [editCategoryId, setEditCategoryId] = useState(post.category_id);
  const [categories, setCategories] = useState<Category[]>([]);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentCount] = useState(Number(post.comments_count || 0));
  const [isBookmarked, setIsBookmarked] = useState(Boolean(post.is_bookmarked));
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsWithPost, setCollectionsWithPost] = useState<Collection[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'save' | 'unbookmarked'>('save');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [loadingBookmark, setLoadingBookmark] = useState(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    setLiked(post.is_liked ?? false);
    setLikesCount(Number(post.likes_count) || 0);
  }, [post.post_id]);

  useEffect(() => {
    setIsBookmarked(post.is_bookmarked ?? false);
  }, [post.post_id, post.is_bookmarked]);

  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3000/categories", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  if (editing) {
    fetchCategories();
  }
}, [editing]);

  const handleLikeToggle = async () => {
    if (!token) return;
    const updatedPost = { ...post };
    try {
      if (liked) {
        await axios.delete(`http://localhost:3000/posts/${post.post_id}/like`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLiked(false);
        setLikesCount(prev => prev - 1);
        updatedPost.is_liked = false;
        updatedPost.likes_count = (Number(updatedPost.likes_count || 1) - 1);
      } else {
        await axios.post(`http://localhost:3000/posts/${post.post_id}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLiked(true);
        setLikesCount(prev => prev + 1);
        updatedPost.is_liked = true;
        updatedPost.likes_count = (Number(updatedPost.likes_count || 0) + 1);
      }
      onPostUpdate?.(updatedPost);
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/posts/${post.post_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Post deleted!', severity: 'success' });
      onPostDeleted?.(post.post_id);
    } catch (err) {
      console.error('Delete failed:', err);
      setSnackbar({ open: true, message: 'Delete failed.', severity: 'error' });
    }
    setDeleteDialogOpen(false);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:3000/posts/${post.post_id}`, {
        caption: editCaption,
        category_id: editCategoryId
      }, { headers: { Authorization: `Bearer ${token}` } });

      const updatedPost = {
        ...post,
        caption: editCaption,
        category_id: editCategoryId,
        category: categories.find(cat => cat.category_id === editCategoryId) || post.category
      };

      setEditing(false);
      setSnackbar({ open: true, message: 'Post updated successfully!', severity: 'success' });
      onPostUpdate?.(updatedPost);
    } catch (err) {
      console.error('Edit failed:', err);
      setSnackbar({ open: true, message: 'Update failed.', severity: 'error' });
    }
  };

  const handleBookmarkClick = () => {
    setDialogMode(isBookmarked ? 'unbookmarked' : 'save');
    isBookmarked ? fetchCollectionsWithPost() : fetchCollections();
    setSelectedCollectionId(null);
    setOpenDialog(true);
  };

  const fetchCollections = async () => {
    if (!token) return;
    const res = await axios.get('http://localhost:3000/collections', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCollections(res.data);
  };

  const fetchCollectionsWithPost = async () => {
    if (!token) return;
    const res = await axios.get(`http://localhost:3000/collections/with-posts/${post.post_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCollectionsWithPost(res.data);
  };

  const handleCollectionSelect = async (collectionId: string) => {
    if (!token) return;
    try {
      setLoadingBookmark(true);
      await axios.post(`http://localhost:3000/collections/${collectionId}/posts`, {
        post_id: post.post_id
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSnackbar({ open: true, message: 'Post saved!', severity: 'success' });
      setIsBookmarked(true);
    } catch {
      setSnackbar({ open: true, message: 'Failed to save post.', severity: 'error' });
    } finally {
      setOpenDialog(false);
      setLoadingBookmark(false);
    }
  };

  const handleUnbookmark = async (collectionId?: string) => {
    if (!token) return;
    try {
      setLoadingBookmark(true);
      const id = collectionId || selectedCollectionId;
      if (!id) return;

      await axios.delete(`http://localhost:3000/collections/${id}/posts/${post.post_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsBookmarked(false);
      setSnackbar({ open: true, message: 'Removed from collection', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to remove bookmark.', severity: 'error' });
    } finally {
      setOpenDialog(false);
      setLoadingBookmark(false);
    }
  };

  const handleCommentClick = () => {
    navigate(`/posts/${post.post_id}/comments`);
  };

  return (
    <div className="post-card">      <div className="post-header">        <div 
          className="user-info" 
          onClick={() => navigate(`/profile/${post.user?.username}`)}
          style={{ cursor: 'pointer' }}
        >
          <img 
            src={formatProfilePictureUrl(post.user?.profile_picture, defaultAvatar)}
            alt="user" 
            className="user-avatar" 
          />
          <span className="username">{post.user?.username || 'unknown'}</span>
        </div>
        {isOwner && (
          <>
            <button className="post-menu" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreHoriz />
            </button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem onClick={() => { setEditing(true); setAnchorEl(null); }}>Edit Post</MenuItem>
              <MenuItem onClick={() => { setDeleteDialogOpen(true); setAnchorEl(null); }}>Delete Post</MenuItem>
            </Menu>
          </>
        )}
      </div>

      {showTrendingInfo && typeof post.recent_likes !== 'undefined' && (
        <div className="trending-badge">🔥 {post.recent_likes} {trendingLikesLabel || 'likes'}</div>
      )}      <div className="post-image-container">
        <img src={formatPostImageUrl(post.image_url)} alt={post.caption} className="post-image" />
      </div>

      <div className="post-actions">
        <button className="action-btn" onClick={handleLikeToggle}>
          {liked ? <Favorite style={{ color: '#ff5700' }} /> : <FavoriteBorder />} {likesCount}
        </button>
        <button className="action-btn" onClick={handleCommentClick}>
          <ChatBubble /> {commentCount}
        </button>
        <div className="action-spacer" />
        <button className="action-btn" onClick={handleBookmarkClick} disabled={loadingBookmark}>
          {isBookmarked
            ? <Bookmark style={{ color: '#ff5700' }} />
            : <Bookmark />}
        </button>
      </div>

      {editing ? (
        <Box padding={2}>
          <TextField value={editCaption} onChange={e => setEditCaption(e.target.value)} fullWidth label="Caption" size="small" />
          <Select value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)} fullWidth size="small" displayEmpty>
            {categories.map(cat => (
              <MuiMenuItem key={cat.category_id} value={cat.category_id}>{cat.category_name}</MuiMenuItem>
            ))}
          </Select>
          <Box display="flex" gap={1} marginTop={1}>
            <Button variant="contained" size="small" onClick={handleSaveEdit}>Save</Button>
            <Button variant="outlined" size="small" onClick={() => setEditing(false)}>Cancel</Button>
          </Box>
        </Box>
      ) : (
        <>          <div className="post-caption">
            <span 
              className="caption-user" 
              onClick={() => navigate(`/profile/${post.user?.username}`)}
              style={{ cursor: 'pointer' }}
            >
              @{post.user?.username}
            </span> <span className="caption-text">{post.caption}</span>
          </div>
          {post.category && (
            <div className="post-category">#{post.category.category_name.toLowerCase()}</div>
          )}
        </>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Are you sure you want to delete this post?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            {dialogMode === 'save' ? 'Save to Collection' : 'Remove from Collection'}
          </Typography>
          {(dialogMode === 'save' ? collections : collectionsWithPost).map(collection => (
            <Button
              key={collection.collection_id}
              variant="outlined"
              fullWidth
              onClick={() => dialogMode === 'save'
                ? handleCollectionSelect(collection.collection_id)
                : handleUnbookmark(collection.collection_id)}
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              disabled={loadingBookmark}
            >
              {collection.collection_name}
            </Button>
          ))}
        </Box>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PostCard;
