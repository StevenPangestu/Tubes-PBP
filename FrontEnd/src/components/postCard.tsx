import './postCard.css';
import { Post } from '../types';
import { Favorite, ChatBubble, MoreHoriz, Bookmark } from '@mui/icons-material';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
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
        <button className="action-btn">
          <ChatBubble /> {post.comments_count || 0}
        </button>
        <div className="action-spacer"></div>
        <button className="action-btn">
          <Bookmark />
        </button>
      </div>
      
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