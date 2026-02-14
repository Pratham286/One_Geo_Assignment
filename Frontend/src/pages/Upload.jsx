import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUpload, 
  FiFile, 
  FiX, 
  FiCheck, 
  FiAlertCircle,
  FiArrowLeft 
} from 'react-icons/fi';

const Upload = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.las')) {
      setError('Please select a .las file');
      return;
    }
    
    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
  };

  // Handle upload - You'll implement this
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    // Your upload logic here
    console.log('Uploading file:', selectedFile);
    
    // Example upload simulation
    setUploading(true);
    setError(null);
    
    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadSuccess(true);
          // Navigate to visualization after 2 seconds
          setTimeout(() => {
            navigate('/visualize/123'); // Replace with actual file ID
          }, 2000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" size={20} />
          Back to Files
        </Link>

        {/* Main Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
              <div className="flex items-center space-x-3">
                <FiUpload size={32} />
                <div>
                  <h1 className="text-3xl font-bold">Upload LAS File</h1>
                  <p className="text-blue-100 mt-1">
                    Upload your well-log data for analysis
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              
              {/* Drag and Drop Area */}
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200
                  ${dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 bg-gray-50'
                  }
                  ${selectedFile ? 'border-green-500 bg-green-50' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".las"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {!selectedFile ? (
                  <>
                    <FiUpload className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Drop your file here
                    </h3>
                    <p className="text-gray-500 mb-4">
                      or
                    </p>
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      <FiFile className="mr-2" />
                      Browse Files
                    </label>
                  </>
                ) : (
                  <div className="space-y-4">
                    <FiCheck className="mx-auto text-green-600" size={48} />
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FiFile className="text-blue-600" size={32} />
                          <div className="text-left">
                            <p className="font-semibold text-gray-800">
                              {selectedFile.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(selectedFile.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveFile}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          disabled={uploading}
                        >
                          <FiX size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {uploadSuccess && (
                <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  <FiCheck size={20} />
                  <span className="font-medium">
                    File uploaded successfully! Redirecting to visualization...
                  </span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <FiAlertCircle size={20} />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading || uploadSuccess}
                className={`
                  w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200
                  ${selectedFile && !uploading && !uploadSuccess
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {uploading ? 'Uploading...' : uploadSuccess ? 'Upload Complete!' : 'Upload File'}
              </button>

              {/* Instructions */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Instructions
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-center mr-2 flex-shrink-0">
                      1
                    </span>
                    <span>Select a valid LAS (Log ASCII Standard) file from your computer</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-center mr-2 flex-shrink-0">
                      2
                    </span>
                    <span>File size must be less than 50MB</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-center mr-2 flex-shrink-0">
                      3
                    </span>
                    <span>File will be automatically parsed and stored securely</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-center mr-2 flex-shrink-0">
                      4
                    </span>
                    <span>You'll be redirected to the visualization page once upload completes</span>
                  </li>
                </ul>
              </div>

              {/* Accepted Formats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Accepted format:</span> .las files only
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Maximum size:</span> 50MB
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;