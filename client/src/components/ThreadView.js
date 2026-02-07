import React from 'react';
import { Box, Typography, IconButton, Divider, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MessageInput from './MessageInput';
import { useAuth } from '../context/AuthContext';

// We can reuse the PostItem component
import { PostItem } from './PostFeed'; 

const ThreadView = ({ mainPost, posts, onSendReply, onClose, loading }) => {
  const { user } = useAuth();

  // Find all replies to the main post
  const replies = posts.filter(p => p.parentPost === mainPost._id);

 // THE CORRECT CODE
const handleSend = (content, parentPost, file) => { 
  onSendReply(content, mainPost._id, file);
};

  return (
    <Box
      sx={{
        width: 360,
        borderLeft: '1px solid #e0e0e0',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* 1. Thread Header */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Thread</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />

      {/* 2. Main Post */}
      <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
        <PostItem post={mainPost} onPostHidden={() => {}} /> 
        <Divider sx={{ my: 2 }}>
          <Typography variant="caption">{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</Typography>
        </Divider>

        {/* 3. Replies */}
        {loading ? <CircularProgress /> : (
          replies.map(reply => (
            <PostItem key={reply._id} post={reply} onPostHidden={() => {}} />
          ))
        )}
      </Box>

      {/* 4. Reply Input Box */}
      <MessageInput onSendPost={handleSend} loading={loading} />
    </Box>
  );
};

export default ThreadView;