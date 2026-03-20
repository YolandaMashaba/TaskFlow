import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const FileShare = () => {
  const { files, uploadFile, fetchFiles } = useApp();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadFile(file);
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
    setUploading(false);
  };

  const downloadFile = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="file-share">
      <div className="upload-section">
        <input
          type="file"
          onChange={handleUpload}
          disabled={uploading}
          className="file-input"
        />
        <button onClick={fetchFiles} className="refresh-btn">Refresh</button>
      </div>
      <div className="files-list">
        {files.length === 0 ? (
          <p className="empty-msg">No shared files yet.</p>
        ) : (
          <ul>
            {files.map((file, index) => (
              <li key={index} className="file-item">
                <span className="file-name">{file.name}</span>
                <button onClick={() => downloadFile(file.url)} className="download-btn">
                  Download
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FileShare;