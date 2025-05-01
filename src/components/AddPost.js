import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Grid,
  Switch,
  LinearProgress,
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import { AiOutlineFilePdf } from 'react-icons/ai'; // Import PDF icon
import { AiFillCloseCircle } from 'react-icons/ai';
import PostsService from '../services/posts-service';
import { useNotification } from '../context/NotificationContext';
import { uploadMultipleMedia, uploadMultiplePDFs } from '../utils/mediaUpload';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format as formatDate } from 'date-fns';

const AddPost = ({ open, handleClose }) => {
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState([]); // Add state for categories
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [shareOn, setShareOn] = useState({
    x: false,
    linkedin: false,
  });
  const [mediaFiles, setMediaFiles] = useState([]); // State for multiple media files (images and videos)
  const [pdfFiles, setPdfFiles] = useState([]); // State for multiple PDF files
  const [isPremium, setIsPremium] = useState(false); // State for premium option
  const [publishNowPost, setPublishNowPost] = useState(true); // State for scheduling
  const [schedulePost, setSchedulePost] = useState(false); // State for scheduling
  const [draft, setDraft] = useState(false); // State for draft option
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [mediaUrls, setMediaUrls] = useState({
    images: [],  // Change to array instead of string
    videos: [],  // Change to array instead of string
    others: []   // Change to array instead of string
  });
  const [pdfUrls, setPdfUrls] = useState([]);
  const [pdfUploadProgress, setPdfUploadProgress] = useState({ current: 0, total: 0 });

  // Add useEffect to fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/getPostCategories`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status && data.data.categories) {
          setCategories(data.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // showNotification({
        //   message: 'Failed to load categories',
        //   severity: 'error'
        // });
      }
    };

    fetchCategories();
  }, []);

  const handleShareChange = (event) => {
    const { name, checked } = event.target;
    setShareOn((prev) => ({ ...prev, [name]: checked }));
  };

  const handleMediaUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    const uploadParams = {
      category: 'user_post',
      type: 'UserPost',
      upid: '637e240560f1f',
    };

    try {
      const results = await uploadMultipleMedia(
        files,
        uploadParams,
        // Progress callback
        (progress) => {
          setUploadProgress({
            current: progress.currentFile,
            total: progress.totalFiles
          });
          
          if (progress.result.success) {
            showNotification({
              message: `Uploading ${progress.currentFile} of ${progress.totalFiles}: ${progress.fileName}`,
              severity: 'info'
            });
          } else {
            showNotification({
              message: `Failed to upload ${progress.fileName}: ${progress.result.error}`,
              severity: 'error'
            });
          }
        },
        // Complete callback
        (uploadResult) => {
          const successCount = uploadResult.allResults.filter(r => r.success).length;
          showNotification({
            message: `Successfully uploaded ${successCount} of ${files.length} files`,
            severity: 'success'
          });
          setUploadProgress({ current: 0, total: 0 });

          // Parse new URLs and add them to existing ones
          const newImageUrls = uploadResult.imageUrls ? uploadResult.imageUrls.split(', ').filter(url => url) : [];
          const newVideoUrls = uploadResult.videoUrls ? uploadResult.videoUrls.split(', ').filter(url => url) : [];
          const newOtherUrls = uploadResult.otherUrls ? uploadResult.otherUrls.split(', ').filter(url => url) : [];

          setMediaUrls(prevUrls => ({
            images: [...new Set([...prevUrls.images, ...newImageUrls])], // Use Set to remove duplicates
            videos: [...new Set([...prevUrls.videos, ...newVideoUrls])],
            others: [...new Set([...prevUrls.others, ...newOtherUrls])]
          }));
        }
      );

      // Update mediaFiles state for preview
      const successfulUploads = results.allResults.filter(result => result.success);
      setMediaFiles(prevFiles => [
        ...prevFiles,
        ...successfulUploads.map(result => ({
          src: result.fileURL,
          type: result.type,
          name: result.fileName,
          mediaPublicId: result.mediaPublicId,
          fileType: result.fileType
        }))
      ]);

    } catch (error) {
      console.error('Error in media upload:', error);
      showNotification({
        message: error.message || 'Failed to upload media files',
        severity: 'error'
      });
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handlePdfUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    try {
      const results = await uploadMultiplePDFs(
        files,
        '637e240560f1f', // This should come from your app's state/context
        // Progress callback
        (progress) => {
          setPdfUploadProgress({
            current: progress.currentFile,
            total: progress.totalFiles
          });
          
          if (progress.result.success) {
            showNotification({
              message: `Uploading PDF ${progress.currentFile} of ${progress.totalFiles}: ${progress.fileName}`,
              severity: 'info'
            });
          } else {
            showNotification({
              message: `Failed to upload PDF ${progress.fileName}: ${progress.result.error}`,
              severity: 'error'
            });
          }
        },
        // Complete callback
        (uploadResult) => {
          const successCount = uploadResult.allResults.filter(r => r.success).length;
          showNotification({
            message: `Successfully uploaded ${successCount} of ${files.length} PDFs`,
            severity: 'success'
          });
          setPdfUploadProgress({ current: 0, total: 0 });
        }
      );

      // Update PDF files state for preview
      const successfulUploads = results.allResults.filter(result => result.success);
      setPdfFiles(prevFiles => [
        ...prevFiles,
        ...successfulUploads.map(result => ({
          name: result.fileName,
          url: result.fileURL,
          mediaPublicId: result.mediaPublicId
        }))
      ]);

      // Update PDF URLs
      const newPdfUrls = successfulUploads.map(result => result.fileURL);
      setPdfUrls(prevUrls => [...new Set([...prevUrls, ...newPdfUrls])]);

    } catch (error) {
      console.error('Error in PDF upload:', error);
      showNotification({
        message: error.message || 'Failed to upload PDF files',
        severity: 'error'
      });
      setPdfUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleRemoveMedia = (index, fileType) => {
    setMediaFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    
    // Also remove from mediaUrls
    setMediaUrls(prevUrls => {
      const urlsArray = [...prevUrls[fileType]];
      urlsArray.splice(index, 1);
      return {
        ...prevUrls,
        [fileType]: urlsArray
      };
    });
  };

  const handleRemovePdf = (index) => {
    setPdfFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const removedFile = newFiles.splice(index, 1)[0];
      
      // Also remove from pdfUrls
      setPdfUrls(prevUrls => prevUrls.filter(url => url !== removedFile.url));
      
      return newFiles;
    });
  };

  const handleSubmit = async () => {
    try {
      const postData = {
        Post_Title: title,
        Post_Overview: content.substring(0, 200), // First 200 chars as overview
        Post_Text: content,
        Post_ImageURL: mediaUrls.images.join(', '), // Join array to create comma-separated string
        Post_VideoURL: mediaUrls.videos.join(', '), // Join array to create comma-separated string
        Post_PdfURL: pdfUrls.join(', '), // Join array to create comma-separated string
        Post_CompanyID: '', // Need to get from current context/user
        Post_CompanyCode: '', // Need to get from current context/user
        Post_CompanyName: '', // Need to get from current context/user
        Post_CompanyLogoURL: '', // Need to get from current context/user
        Post_Visibility: isPremium ? 'premium' : 'public',
        Post_Status: draft ? 'draft' : schedulePost ? '	schedule' : 'publish',
        Post_CompanyCollaborate: '', // If needed
        Post_Category: category,
        Post_AdvisorSecuritiesMentioned: '', // If needed
        Post_Language: 'en', // Default to English or get from user settings
        Post_Symbol: '', // If applicable
        Post_AllSymbol: '', // If applicable
        Post_Country: '', // Get from user/company settings
        Post_MarketType: '', // If applicable
        Post_ScheduledDate: schedulePost ? `${scheduleDate} ${scheduleTime}` : null
      };
      
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification({
          message: 'You must be logged in to create a post',
          severity: 'error'
        });
        return;
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/createPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });

      if (response.status === 401 || response.status === 403) {
        showNotification({
          message: 'Please log in to create a post',
          severity: 'error'
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.status === true) {
        // Reset all form inputs
        setTitle('');
        setContent('');
        setCategory('');
        setShareOn({
          x: false,
          linkedin: false,
        });
        setMediaFiles([]);
        setPdfFiles([]);
        setIsPremium(false);
        setSchedulePost(false);
        setDraft(false);
        setScheduleDate('');
        setScheduleTime('');
        
        showNotification({
          message: 'Your post has been created successfully!',
          severity: 'success'
        });

        // Close modal with true only after successful post creation
        handleClose(true);
      } else {
        const errorMessage = result?.message || 'Failed to create post';
        showNotification({
          message: errorMessage,
          severity: 'error'
        });
        // Close modal without refreshing posts if creation failed
        handleClose(false);
      }
    } catch (error) {
      console.error('Error in submit:', error);
      showNotification({
        message: error.message || 'An error occurred while submitting the post',
        severity: 'error'
      });
      // Close modal without refreshing posts if there was an error
      handleClose(false);
    }
  };

  // Add a separate function for modal close without post creation
  const onModalClose = () => {
    handleClose(false);
  };

  // Add upload progress indicator in the UI
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

  // Update the media preview section
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
            <AiFillCloseCircle 
              onClick={() => handleRemoveMedia(index, media.fileType === 'image' ? 'images' : 
                                                    media.fileType === 'video' ? 'videos' : 'others')} 
              size={24} 
              color="red" 
              style={{ backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', 
                      right: '-10px', top: '-10px', padding: '0px', margin: 0, cursor: 'pointer' }} />
          </Box>
        ))}
      </Box>
    );
  };

  // Add PDF upload progress indicator
  const renderPdfUploadProgress = () => {
    if (pdfUploadProgress.total === 0) return null;
    
    return (
      <Box mt={2} mb={2}>
        <Typography variant="body2" color="textSecondary">
          Uploading PDF {pdfUploadProgress.current} of {pdfUploadProgress.total}...
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={(pdfUploadProgress.current / pdfUploadProgress.total) * 100} 
        />
      </Box>
    );
  };

  return (
    <Modal open={open} onClose={onModalClose}>
      <Box
        sx={{
          maxWidth: 786,
          width: '100%',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom style={{ fontWeight: 'bold', fontSize: '20px', color: '#203A93', textAlign: 'center' }}>
          Create a Post
        </Typography>
        <TextField
          label="Title"
          variant="outlined"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Typography variant="body2" gutterBottom>
          Content
        </Typography>
        <ReactQuill
          value={content}
          onChange={setContent}
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
        />
        <FormControl fullWidth margin="normal">
          <InputLabel style={{ backgroundColor: '#fff' }}>Select Category</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ height: 44 }}
            sx={{
              '& .MuiSelect-select': {
                padding: '10px',
              },
            }}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
            />
          }
          label="Share Post As Premium"
        />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" gutterBottom>
              Upload Media (Images and Videos):
            </Typography>
            <Button 
              variant="outlined" 
              component="label" 
              style={{width: '100%', backgroundColor: '#f0f0f0', color: '#999',
                     border: '1px dashed #ccc', borderRadius: '4px', padding: '4px'}}
              disabled={uploadProgress.total > 0}
            >
              Upload Media
              <input type="file" hidden multiple onChange={handleMediaUpload} />
            </Button>
            {renderUploadProgress()}
            {renderMediaPreviews()}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" gutterBottom>
              Upload PDF:
            </Typography>
            <Button 
              variant="outlined" 
              component="label" 
              style={{
                width: '100%', 
                backgroundColor: '#f0f0f0', 
                color: '#999',
                border: '1px dashed #ccc', 
                borderRadius: '4px', 
                padding: '4px'
              }}
              disabled={pdfUploadProgress.total > 0}
            >
              Add PDF
              <input 
                type="file" 
                accept="application/pdf" 
                multiple 
                hidden 
                onChange={handlePdfUpload} 
              />
            </Button>
            {renderPdfUploadProgress()}
            {pdfFiles.length > 0 && (
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
                    <AiOutlineFilePdf size={24} color="red" />
                    <Typography 
                      variant="body2" 
                      style={{ 
                        marginLeft: '10px', 
                        fontSize: '12px', 
                        width: 'calc(100% - 38px)', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        paddingRight: '20px' 
                      }}
                    >
                      {pdfFile.name}
                    </Typography>
                    <AiFillCloseCircle 
                      onClick={() => handleRemovePdf(index)} 
                      size={20} 
                      color="red" 
                      style={{ 
                        position: 'absolute', 
                        right: '4px', 
                        cursor: 'pointer' 
                      }} 
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Scheduling Options */}
        <Typography variant="body2" gutterBottom mt={2}>
          Scheduling Options:
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button 
            variant={!schedulePost && !draft ? "contained" : "outlined"}
            onClick={() => {
              setSchedulePost(false);
              setDraft(false);
              setScheduleDate('');
              setScheduleTime('');
            }}
            style={{ 
              width: '30%',
              backgroundColor: !schedulePost && !draft ? '#203A93' : 'transparent',
              color: !schedulePost && !draft ? '#fff' : '#203A93',
              border: '1px solid #203A93'
            }}
          >
            Publish Now
          </Button>
          <Button 
            variant={schedulePost ? "contained" : "outlined"}
            onClick={() => {
              setSchedulePost(true);
              setDraft(false);
            }}
            style={{ 
              width: '30%',
              backgroundColor: schedulePost ? '#f1c40e' : 'transparent',
              color: schedulePost ? '#fff' : '#f1c40e',
              border: '1px solid #f1c40e'
            }}
          >
            Schedule
          </Button>
          <Button 
            variant={draft ? "contained" : "outlined"}
            onClick={() => {
              setDraft(true);
              setSchedulePost(false);
              setScheduleDate('');
              setScheduleTime('');
            }}
            style={{ 
              width: '30%',
              backgroundColor: draft ? '#7a93ea' : 'transparent',
              color: draft ? '#fff' : '#7a93ea',
              border: '1px solid #7a93ea'
            }}
          >
            Save as Draft
          </Button>
        </Box>

        {schedulePost && (
          <Box mt={2}>
            <Typography variant="body2">
              Schedule your post for the times when your audience is most active, or manually select a date and time in the future to publish your post.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }} gap={2}>
              <TextField
                type="date"
                fullWidth
                inputProps={{
                  min: new Date().toISOString().split('T')[0] // Set minimum date to today
                }}
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
              <TextField
                type="time"
                fullWidth
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </Box>
          </Box>
        )}

        {draft && (
          <Box mt={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0, alignItems: 'center' }} gap={2}>
              <Typography variant="body2">
                Collaborate with team members for review before posting.
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={draft}
                    onChange={(e) => setDraft(e.target.checked)}
                  />
                }
                label="Enable Draft Mode"
              />
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSubmit} style={{ backgroundColor: '#203A93', color: '#fff', width: '100%' }}>
            Post
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddPost; 