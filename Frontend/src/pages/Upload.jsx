import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUpload,
  FiFile,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import axios from "axios";
import { ApiContext } from "../context/ApiContext";

const Upload = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);

  const {url} = useContext(ApiContext);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!file.name.toLowerCase().endsWith(".las")) {
      setError("Please select a .las file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50MB");
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(`${url}/data/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploading(false);
      setUploadSuccess(true);
      navigate(`/well/${response.data.data.fileId}`);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (uploading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
        <AiOutlineLoading3Quarters
          className="animate-spin text-blue-600 mb-4"
          size={64}
        />
        <p className="text-gray-600 text-lg font-medium">Uploading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" size={20} />
          Back to Files
        </button>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-500 px-6 py-8 text-white">
              <div className="flex items-center space-x-3">
                <FiUpload size={32} />
                <div>
                  <h1 className="px-2 text-3xl font-bold">Upload LAS File</h1>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200
                  ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 bg-gray-50"
                  }
                  ${selectedFile ? "border-green-500 bg-green-50" : ""}
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
                    <FiUpload
                      className="mx-auto text-gray-400 mb-4"
                      size={48}
                    />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Drop your file here
                    </h3>
                    <p className="text-gray-500 mb-4">or</p>
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

              {uploadSuccess && (
                <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                  <FiCheck size={20} />
                  <span className="font-medium">
                    File uploaded successfully! Redirecting to visualization...
                  </span>
                </div>
              )}

              {error && (
                <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  <FiAlertCircle size={20} />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading || uploadSuccess}
                className={`
                  w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200
                  ${
                    selectedFile && !uploading && !uploadSuccess
                      ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }
                `}
              >
                {uploadSuccess ? "Upload Complete!" : "Upload File"}
              </button>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Accepted format:</span> .las
                  files only
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
