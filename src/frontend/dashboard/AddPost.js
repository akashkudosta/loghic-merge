import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Divider,
  ButtonGroup,
  IconButton,
  Avatar,
  Paper,
  LinearProgress,
  Switch
} from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import FrontendLayout from "layouts/frontend";
import axios from 'axios';
import DashboardSidebar from './DashboardSidebar';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AiOutlineFilePdf, AiFillCloseCircle } from 'react-icons/ai';

const AddPost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.isEditing || false;
  const existingPostData = location.state?.postData;

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postData, setPostData] = useState({
    title: '',
    description: '',
    category: '',
    shareOnX: false,
    shareOnLinkedin: false,
    shareAsPremium: false
  });
  
  // Additional state from imported code
  const [categories, setCategories] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [publishNowPost, setPublishNowPost] = useState(true);
  const [schedulePost, setSchedulePost] = useState(false);
  const [draft, setDraft] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [mediaUrls, setMediaUrls] = useState({
    images: [],
    videos: [],
    others: []
  });
  const [pdfUrls, setPdfUrls] = useState([]);
  const [pdfUploadProgress, setPdfUploadProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserInfo(response.data.data.userInfo);
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
    
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/posts/getPostCategories`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status && data.data.categories) {
          setCategories(data.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Initialize state based on edit mode
  useEffect(() => {
    if (isEditing && existingPostData) {
      setPostData({
        title: existingPostData.title || '',
        description: existingPostData.description || '',
        category: existingPostData.category || '',
        shareOnX: existingPostData.shareOnX || false,
        shareOnLinkedin: existingPostData.shareOnLinkedin || false,
        shareAsPremium: existingPostData.shareAsPremium || false
      });

      // Set scheduling options based on status
      if (existingPostData.status === 'Draft') {
        setDraft(true);
        setPublishNowPost(false);
        setSchedulePost(false);
      } else if (existingPostData.scheduledDate) {
        setSchedulePost(true);
        setPublishNowPost(false);
        setDraft(false);
        setScheduleDate(existingPostData.scheduledDate);
        setScheduleTime(existingPostData.scheduledTime);
      }

      // Set media files if any
      if (existingPostData.mediaFiles) {
        setMediaFiles(existingPostData.mediaFiles);
      }

      // Set PDF files if any
      if (existingPostData.pdfFiles) {
        setPdfFiles(existingPostData.pdfFiles);
      }
    }
  }, [isEditing, existingPostData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData({
      ...postData,
      [name]: value
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setPostData({
      ...postData,
      [name]: checked
    });
  };
  
  const handleContentChange = (content) => {
    setPostData({
      ...postData,
      description: content
    });
  };

  const handleMediaUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    // For demo purposes - in a real implementation, use the upload logic from the original code
    setMediaFiles(prevFiles => [
      ...prevFiles,
      ...files.map(file => ({
        src: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        fileType: file.type.startsWith('image') ? 'image' : 'video'
      }))
    ]);
  };

  const handlePdfUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    // For demo purposes - in a real implementation, use the upload logic from the original code
    setPdfFiles(prevFiles => [
      ...prevFiles,
      ...files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file)
      }))
    ]);
  };

  const handleRemoveMedia = (index, fileType) => {
    setMediaFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleRemovePdf = (index) => {
    setPdfFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleScheduleOption = (option) => {
    if (option === 'publish') {
      setPublishNowPost(true);
      setSchedulePost(false);
      setDraft(false);
    } else if (option === 'schedule') {
      setPublishNowPost(false);
      setSchedulePost(true);
      setDraft(false);
    } else if (option === 'draft') {
      setPublishNowPost(false);
      setSchedulePost(false);
      setDraft(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({
      ...postData,
      mediaFiles,
      pdfFiles,
      scheduleDate: schedulePost ? scheduleDate : null,
      scheduleTime: schedulePost ? scheduleTime : null,
      isDraft: draft
    });
  };

  // Helper rendering functions
  const renderUploadProgress = () => {
    if (uploadProgress.total === 0) return null;
    
    return (
      <Box mt={2} mb={2}>
        <Typography variant="body2" color="textSecondary">
          Uploading {uploadProgress.current} of {uploadProgress.total} files...
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={(uploadProgress.current / uploadProgress.total) * 100} 
        />
      </Box>
    );
  };

  const renderMediaPreviews = () => {
    if (mediaFiles.length === 0) return null;

    return (
      <Box mt={2} mb={2} display="flex" flexWrap="wrap" gap={2}>
        {mediaFiles.map((media, index) => (
          <Box key={index} display="flex" alignItems="center" mb={0} 
               style={{ position: 'relative', border: '1px dashed #ccc', borderRadius: '4px', 
                        padding: '0px', width: '75px', backgroundColor: '#000', 
                        height: '55px', objectFit: 'cover' }}>
            {media.type.startsWith('image/') ? (
              <img src={media.src} alt={`Preview ${index}`} 
                   style={{ maxWidth: '100%', maxHeight: '85px', marginRight: 'auto', 
                           marginLeft: 'auto', borderRadius: '5px', aspectRatio: '2.5/2' }} />
            ) : media.type.startsWith('video/') ? (
              <video width="75" height="55" controls 
                     style={{ borderRadius: '5px', backgroundColor: '#f0f0f0', 
                             border: '1px dashed #ccc' }}>
                <source src={media.src} type={media.type} />
                Your browser does not support the video tag.
              </video>
            ) : null}
            <Box 
              onClick={() => handleRemoveMedia(index, media.fileType === 'image' ? 'images' : 'videos')}
              style={{ backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', 
                      right: '-10px', top: '-10px', cursor: 'pointer', width: '24px', height: '24px' }}>
              <AiFillCloseCircle size={24} color="red" />
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  const renderPdfPreviews = () => {
    if (pdfFiles.length === 0) return null;
    
    return (
      <Box mt={2}>
        {pdfFiles.map((pdfFile, index) => (
          <Box 
            key={index} 
            display="flex" 
            alignItems="center" 
            mb={1} 
            style={{ 
              position: 'relative', 
              border: '1px dashed #ccc', 
              borderRadius: '4px', 
              padding: '4px' 
            }}
          >
            <PictureAsPdfIcon color="error" />
            <Typography 
              variant="body2" 
              style={{ 
                marginLeft: '10px', 
                width: 'calc(100% - 38px)', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                paddingRight: '20px' 
              }}
            >
              {pdfFile.name}
            </Typography>
            <Box
              onClick={() => handleRemovePdf(index)} 
              style={{ 
                position: 'absolute', 
                right: '4px', 
                cursor: 'pointer' 
              }}
            >
              <AiFillCloseCircle size={20} color="red" />
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  if (loading) {
    return (
      <FrontendLayout>
        <MDBox>
          <Typography>Loading...</Typography>
        </MDBox>
      </FrontendLayout>
    );
  }

  return (
    <FrontendLayout>
      <MDBox>
        <Grid container spacing={3}>
          {/* Left Sidebar */}
          <Grid item xs={12} md={3}>
            <DashboardSidebar userInfo={userInfo} />
          </Grid>

          {/* Main Content Area */}
          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 2 }}>
              <Button 
                component={Link} 
                to="/dashboard/my-posts" 
                startIcon={<KeyboardBackspaceIcon />}
                sx={{ color: '#213a93' }}
              >
                Back to All Posts
              </Button>
            </Box>
            
            <Card sx={{ p: 3, backgroundColor: 'white' }}>
              <Grid container spacing={3}>
                {/* Left Column - Post Form */}
                <Grid item xs={12} md={7}>
                  <MDTypography variant="h6" mb={3}>
                    {isEditing ? 'Edit Post' : 'Post details'}
                  </MDTypography>
                  
                  <Box component="form" onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom fontSize={16}>
                        Title
                      </Typography>
                      <TextField
                        fullWidth
                        name="title"
                        value={postData.title}
                        onChange={handleInputChange}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 8 }}>
                      <Typography variant="subtitle1" gutterBottom fontSize={16}>
                        Description
                      </Typography>
                      <ReactQuill
                        value={postData.description}
                        onChange={handleContentChange}
                        placeholder="Write your content here..."
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, false] }],
                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                            ['link'],
                            ['clean']
                          ],
                        }}
                        formats={[
                          'header',
                          'bold', 'italic', 'underline', 'strike', 'blockquote',
                          'list', 'bullet', 'indent',
                          'link'
                        ]}
                        style={{ height: '120px', marginBottom: '20px' }}
                      />
                    </Box>
                    
                    <Box sx={{ mt: 3 }}>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" gutterBottom fontSize={14}>
                            Upload Media (Images and Videos):
                          </Typography>
                          <Button 
                            variant="outlined" 
                            component="label"
                            fullWidth
                            sx={{ 
                              border: '1px solid #ccc',
                              borderStyle: 'dashed',
                              color: '#666',
                              py: 1.5,
                              textTransform: 'uppercase',
                              borderRadius: 0.5,
                              justifyContent: 'center',
                              fontWeight: 'normal',
                              backgroundColor: '#f9f9f9'
                            }}
                          >
                            UPLOAD MEDIA
                            <input type="file" hidden multiple onChange={handleMediaUpload} />
                          </Button>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" gutterBottom fontSize={14}>
                            Upload PDF:
                          </Typography>
                          <Button 
                            variant="outlined" 
                            component="label"
                            fullWidth
                            sx={{ 
                              border: '1px solid #ccc',
                              borderStyle: 'dashed',
                              color: '#666',
                              py: 1.5,
                              textTransform: 'uppercase',
                              borderRadius: 0.5,
                              justifyContent: 'center',
                              fontWeight: 'normal',
                              backgroundColor: '#f9f9f9'
                            }}
                          >
                            ADD PDF
                            <input type="file" accept="application/pdf" hidden onChange={handlePdfUpload} />
                          </Button>
                        </Grid>
                      </Grid>
                      
                      {renderUploadProgress()}
                      {renderMediaPreviews()}
                      {renderPdfPreviews()}
                    </Box>
                    
                    <Box sx={{ mb: 3 , mt: 3}}>
                      <FormControl fullWidth size="small">
                        <Typography variant="subtitle1" gutterBottom fontSize={16}>
                          Select Category
                        </Typography>
                        <Select
                          name="category"
                          value={postData.category}
                          onChange={handleInputChange}
                          displayEmpty
                          
                          sx={{ 
                            "& .MuiSelect-select": { display: 'flex', alignItems: 'center', padding: '10px' }
                          }}
                          endAdornment={<Box sx={{ fontSize: '1.2rem', m: 1.5, color: '#ccc' }}>▼</Box>}
                          IconComponent={() => null}
                        >
                          <MenuItem value="">Select a category</MenuItem>
                          {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                          {/* Fallback items if categories is empty */}
                          {categories.length === 0 && (
                            <>
                              <MenuItem value="Finance">Finance</MenuItem>
                              <MenuItem value="Technology">Technology</MenuItem>
                              <MenuItem value="Business">Business</MenuItem>
                            </>
                          )}
                        </Select>
                      </FormControl>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom fontSize={16}>
                        Would you like to share this on :
                      </Typography>
                      <FormControlLabel
                        
                        control={
                          <Checkbox 
                            checked={postData.shareOnX}
                            onChange={handleCheckboxChange}
                            name="shareOnX" 
                            
                          />
                        }
                        label="X"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={postData.shareOnLinkedin}
                            onChange={handleCheckboxChange}
                            name="shareOnLinkedin" 
                          />
                        }
                        label="LinkedIn"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={postData.shareAsPremium}
                            onChange={handleCheckboxChange}
                            name="shareAsPremium" 
                          />
                        }
                        label="Share Post As Premium"
                      />
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom fontSize={16}>
                        Scheduling Options
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'space-between' }}>
                        <Button 
                          variant={publishNowPost ? "contained" : "outlined"}
                          onClick={() => handleScheduleOption('publish')}
                          sx={{ 
                            bgcolor: publishNowPost ? '#213a93' : 'transparent',
                            color: publishNowPost ? '#fff' : '#213a93',
                            border: '1px solid #213a93',
                            '&:hover': { bgcolor: publishNowPost ? '#19307a' : 'rgba(33, 58, 147, 0.1)' }
                          }}
                        >
                          Publish now
                        </Button>
                        <Button 
                          variant={schedulePost ? "contained" : "outlined"}
                          onClick={() => handleScheduleOption('schedule')}
                          sx={{ 
                            bgcolor: schedulePost ? '#ffc107' : 'transparent',
                            color: schedulePost ? '#fff' : '#ffc107',
                            border: '1px solid #ffc107',
                            '&:hover': { bgcolor: schedulePost ? '#ffb300' : 'rgba(255, 193, 7, 0.1)' }
                          }}
                        >
                          Schedule
                        </Button>
                        <Button 
                          variant={draft ? "contained" : "outlined"}
                          onClick={() => handleScheduleOption('draft')}
                          sx={{ 
                            bgcolor: draft ? '#e0e0e0' : 'transparent',
                            color: draft ? '#757575' : '#757575',
                            border: '1px solid #e0e0e0',
                            '&:hover': { bgcolor: draft ? '#d5d5d5' : 'rgba(224, 224, 224, 0.3)' }
                          }}
                        >
                          Save as draft
                        </Button>
                      </Box>
                      
                      {schedulePost && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          <TextField
                            type="date"
                            fullWidth
                            label="Schedule Date"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{
                              min: new Date().toISOString().split('T')[0]
                            }}
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                          />
                          <TextField
                            type="time"
                            fullWidth
                            label="Schedule Time"
                            InputLabelProps={{ shrink: true }}
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                          />
                        </Box>
                      )}
                      
                      {draft && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center' }}>
                          <Typography variant="body2" fontSize={14}>
                            Collaborate with team members for review before posting.
                          </Typography>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={draft}
                                onChange={(e) => setDraft(e.target.checked)}
                              />
                            }
                          />
                        </Box>
                      )}
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Button 
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ 
                          bgcolor: '#213a93', 
                          color: '#fff',
                          '&:hover': { bgcolor: '#19307a' },
                          py: 1
                        }}
                      >
                        {isEditing ? 'Update Post' : 'Post'}
                      </Button>
                    </Box>
                  </Box>
                </Grid>
                
                {/* Right Column - Preview */}
                <Grid item xs={12} md={5}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      borderRadius: 1,
                      position: 'relative',
                    }}
                  >
                    
                    
                    <Typography variant="h6" sx={{ mb: 2, px: 2, pt: 2 }}>
                      Preview
                    </Typography>
                    
                    <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Avatar 
                          src={userInfo?.profilePicture || "/static/images/avatar/1.jpg"} 
                          alt={userInfo?.name || "User"}
                        />
                        <Typography variant="subtitle1" fontWeight="medium">
                          {userInfo?.name || "Mahaveer Kudosta"}
                        </Typography>
                      </Box>
                      
                      <Typography variant="h6" color="#213a93" gutterBottom>
                        {postData.title || "Post Heading Lorem ipsum"}
                      </Typography>
                      
                      {mediaFiles.length > 0 && mediaFiles[0].type.startsWith('image/') ? (
                        <Box 
                          sx={{ 
                            height: 200, 
                            borderRadius: 1, 
                            mb: 2,
                            overflow: 'hidden'
                          }}
                        >
                          <img 
                            src={mediaFiles[0].src} 
                            alt="Post media"
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover'
                            }} 
                          />
                        </Box>
                      ) : (
                        <Box 
                          sx={{ 
                            height: 200, 
                            bgcolor: '#213a93', 
                            borderRadius: 1, 
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 2
                          }}
                        >
                          <img 
                            src="/static/logo-white.png" 
                            alt="Loghic" 
                            style={{ height: '80px' }} 
                          />
                        </Box>
                      )}
                      
                      <Box 
                        sx={{ 
                          maxHeight: '250px', 
                          overflow: 'scroll', 
                          position: 'relative' 
                        }}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: postData.description || "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ...</p>"
                          }}
                        />
                        {postData.description && postData.description.length > 150 && (
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              bottom: 0, 
                              left: 0, 
                              right: 0, 
                              height: '50px', 
                              background: 'linear-gradient(transparent, #f9f9f9)' 
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </FrontendLayout>
  );
};

export default AddPost;