// client/src/components/FileUploadSection.jsx
import React, { useState } from 'react';
import { uploadJobFile } from '../services/apiRoutes';

const FileUploadSection = ({ jobId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await uploadJobFile(jobId, formData);
      alert('Upload successful');
      setSelectedFile(null);
      if (onUploadSuccess) onUploadSuccess(); // trigger refresh
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  return (
    <div className="upload-section">
      <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default FileUploadSection;
