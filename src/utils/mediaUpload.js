/**
 * Utility function to handle media file uploads
 * @param {File} file - The file to upload
 * @param {Object} params - Upload parameters
 * @param {string} params.category - Category of the upload (e.g., 'user_post', 'company_post')
 * @param {string} params.type - Type of the upload (e.g., 'UserPost', 'CompanyPost')
 * @param {string} params.upid - Unique identifier for the upload
 * @param {string} [params.announcement_code] - Optional announcement code
 * @param {string} [params.announcement_headlineid] - Optional announcement headline ID
 * @returns {Promise<Object>} Upload result containing file URL and metadata
 */
export const uploadMedia = async (file, params) => {
  const {
    category,
    type,
    upid,
    announcement_code = '',
    announcement_headlineid = ''
  } = params;

  const formData = new FormData();
  formData.append('file', file);

  const queryParams = new URLSearchParams({
    category,
    type,
    announcement_code,
    announcement_headlineid,
    upid
  }).toString();

  try {
    const response = await fetch(`https://files.loghic.com/ajaxdev.php?${queryParams}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.result === true) {
      return {
        success: true,
        fileURL: result.fileURL,
        fileName: result.fileName,
        mediaPublicId: result.Media_PublicID,
        type: file.type,
        fileType: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'other'
      };
    } else {
      throw new Error(result.MYSQL_ERROR || 'Failed to upload media');
    }
  } catch (error) {
    console.error('Error uploading media:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload media'
    };
  }
};

/**
 * Utility function to handle multiple media file uploads
 * @param {FileList} files - Array of files to upload
 * @param {Object} params - Upload parameters
 * @param {Function} onProgress - Callback function for upload progress
 * @param {Function} onComplete - Callback function for upload completion
 * @returns {Promise<Object>} Object containing arrays of URLs and complete results
 */
export const uploadMultipleMedia = async (files, params, onProgress, onComplete) => {
  const results = [];
  const totalFiles = files.length;
  
  const imageUrls = [];
  const videoUrls = [];
  const otherUrls = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadMedia(files[i], params);
    results.push(result);

    if (result.success) {
      // Categorize URLs based on file type
      if (result.fileType === 'image') {
        imageUrls.push(result.fileURL);
      } else if (result.fileType === 'video') {
        videoUrls.push(result.fileURL);
      } else {
        otherUrls.push(result.fileURL);
      }
    }

    // Call progress callback
    if (onProgress) {
      onProgress({
        currentFile: i + 1,
        totalFiles,
        fileName: files[i].name,
        result
      });
    }
  }

  const uploadResult = {
    allResults: results,
    imageUrls: imageUrls.join(', '),
    videoUrls: videoUrls.join(', '),
    otherUrls: otherUrls.join(', '),
    // Combined URLs for backward compatibility
    allUrls: [...imageUrls, ...videoUrls, ...otherUrls].join(', ')
  };

  // Call complete callback
  if (onComplete) {
    onComplete(uploadResult);
  }

  return uploadResult;
};

/**
 * Utility function to handle PDF file uploads
 * @param {File} file - The PDF file to upload
 * @param {string} upid - Unique identifier for the upload
 * @returns {Promise<Object>} Upload result containing file URL and metadata
 */
export const uploadPDF = async (file, upid) => {
  const formData = new FormData();
  formData.append('file', file);

  const queryParams = new URLSearchParams({
    category: 'user_post_PDF',
    type: 'UserPostPDF',
    announcement_code: '',
    announcement_headlineid: '',
    upid
  }).toString();

  try {
    const response = await fetch(`https://files.loghic.com/ajaxdev.php?${queryParams}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.result === true) {
      return {
        success: true,
        fileURL: result.fileURL,
        fileName: result.fileName,
        mediaPublicId: result.Media_PublicID
      };
    } else {
      throw new Error(result.MYSQL_ERROR || 'Failed to upload PDF');
    }
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload PDF'
    };
  }
};

/**
 * Utility function to handle multiple PDF file uploads
 * @param {FileList} files - Array of PDF files to upload
 * @param {string} upid - Unique identifier for the upload
 * @param {Function} onProgress - Callback function for upload progress
 * @param {Function} onComplete - Callback function for upload completion
 * @returns {Promise<Object>} Upload results containing URLs and metadata
 */
export const uploadMultiplePDFs = async (files, upid, onProgress, onComplete) => {
  const results = [];
  const totalFiles = files.length;
  const pdfUrls = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadPDF(files[i], upid);
    results.push(result);

    if (result.success) {
      pdfUrls.push(result.fileURL);
    }

    // Call progress callback
    if (onProgress) {
      onProgress({
        currentFile: i + 1,
        totalFiles,
        fileName: files[i].name,
        result
      });
    }
  }

  const uploadResult = {
    allResults: results,
    pdfUrls: pdfUrls.join(', ')
  };

  // Call complete callback
  if (onComplete) {
    onComplete(uploadResult);
  }

  return uploadResult;
}; 