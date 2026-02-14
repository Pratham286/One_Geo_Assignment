import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiFile,
  FiMapPin,
  FiCalendar,
  FiDatabase,
  FiBarChart2,
  FiArrowDown,
  FiActivity,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import axios from "axios";

const WellDetails = () => {
  const { id } = useParams();
  const url = "http://localhost:3000";
  // console.log(id);
  const navigate = useNavigate();

  const [startDepth, setStartDepth] = useState("");
  const [endDepth, setEndDepth] = useState("");
  const [selectedCurves, setSelectedCurves] = useState([]);

  // Mock data - replace with your API call
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  useEffect(() => {
    const fetchFile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${url}/data/getfile/${id}`);
        if (response.data.success) {
          setFile(response.data.data);
        } else {
          console.error("Failed to fetch file details:", response.data.error);
        }
      } catch (error) {
        console.error("Error fetching file details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, []);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleVisualize = () => {
    // Navigate to visualization page
    navigate(`/visualize/${id}`);
  };

  const handleAnalyze = async () => {
    try {
        const analysisData = {
          startDepth: startDepth || file.wellInfo.startDepth,
          endDepth: endDepth || file.wellInfo.stopDepth,
          curves: selectedCurves,
        };
        console.log(analysisData)
        const response = await axios.post(`${url}/ai/generate/${id}`, analysisData);
        console.log(response)
        console.log('Analyzing file:', id, analysisData);
        if(response.data.success) {
            navigate(`/interpretation/${id}`, { state: { interpretation: response.data.data } });
        }
        
    } catch (error) {
        console.error("Error during analysis:", error);
    }
  
};
// Add this toggle handler for curve selection
const handleCurveToggle = (curveName) => {
  setSelectedCurves((prev) =>
    prev.includes(curveName)
      ? prev.filter((c) => c !== curveName)
      : [...prev, curveName]
  );
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <FiAlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              File Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The requested file could not be found.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back to Files
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                    <FiFile className="text-white" size={40} />
                  </div>
                  <div className="text-white">
                    <h1 className="text-3xl font-bold mb-1">
                      {file.wellInfo.wellName}
                    </h1>
                    <p className="text-blue-100 text-lg">{file.originalName}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span
                        className={`
                        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                        ${
                          file.status === "ready"
                            ? "bg-green-500 text-white"
                            : "bg-yellow-500 text-white"
                        }
                      `}
                      >
                        <FiCheckCircle className="mr-1" size={16} />
                        {file.status === "ready" ? "Ready" : "Processing"}
                      </span>
                      <span className="text-blue-100 text-sm">
                        {formatFileSize(file.fileSize)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - replace existing */}
            <div className="px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleVisualize}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <FiBarChart2 className="mr-2" size={20} />
                Visualize Curves
              </button>
              <button
                onClick={handleAnalyze}
                disabled={selectedCurves.length === 0}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiActivity className="mr-2" size={20} />
                AI Analysis{" "}
                {selectedCurves.length > 0 &&
                  `(${selectedCurves.length} curves)`}
              </button>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Well Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiMapPin className="mr-2 text-blue-600" size={24} />
                Well Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">Company:</span>
                  <span className="text-gray-800">{file.wellInfo.company}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">Field:</span>
                  <span className="text-gray-800">{file.wellInfo.field}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">Location:</span>
                  <span className="text-gray-800">
                    {file.wellInfo.location}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">Country:</span>
                  <span className="text-gray-800">{file.wellInfo.country}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">
                    Service Company:
                  </span>
                  <span className="text-gray-800">
                    {file.wellInfo.serviceCompany}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 font-medium">
                    Date Analyzed:
                  </span>
                  <span className="text-gray-800">
                    {file.wellInfo.dateAnalyzed}
                  </span>
                </div>
              </div>
            </div>

            {/* Depth Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiArrowDown className="mr-2 text-blue-600" size={24} />
                Depth Information
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">
                    Start Depth:
                  </span>
                  <span className="text-gray-800 font-semibold">
                    {file.wellInfo.startDepth.toLocaleString()}{" "}
                    {file.wellInfo.depthUnit}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">Stop Depth:</span>
                  <span className="text-gray-800 font-semibold">
                    {file.wellInfo.stopDepth.toLocaleString()}{" "}
                    {file.wellInfo.depthUnit}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">Step:</span>
                  <span className="text-gray-800">
                    {file.wellInfo.step} {file.wellInfo.depthUnit}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600 font-medium">
                    Total Range:
                  </span>
                  <span className="text-gray-800 font-semibold">
                    {(
                      file.wellInfo.stopDepth - file.wellInfo.startDepth
                    ).toLocaleString()}{" "}
                    {file.wellInfo.depthUnit}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 font-medium">Null Value:</span>
                  <span className="text-gray-800">
                    {file.wellInfo.nullValue}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FiTrendingUp className="mr-2 text-blue-600" size={24} />
              Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Curves</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {file.curves.length}
                    </p>
                  </div>
                  <FiBarChart2 className="text-blue-600" size={40} />
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Data Points</p>
                    <p className="text-3xl font-bold text-green-600">
                      {file.stats.totalDataPoints.toLocaleString()}
                    </p>
                  </div>
                  <FiDatabase className="text-green-600" size={40} />
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">LAS Version</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {file.versionInfo.version}
                    </p>
                  </div>
                  <FiFile className="text-purple-600" size={40} />
                </div>
              </div>
            </div>
          </div>

          {/* Available Curves - replace existing */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FiActivity className="mr-2 text-blue-600" size={24} />
              Available Curves ({file.curves.length})
            </h2>

            {/* Depth Inputs */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Start Depth ({file.wellInfo.depthUnit})
                </label>
                <input
                  type="number"
                  value={startDepth}
                  onChange={(e) => setStartDepth(e.target.value)}
                  placeholder={file.wellInfo.startDepth}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  End Depth ({file.wellInfo.depthUnit})
                </label>
                <input
                  type="number"
                  value={endDepth}
                  onChange={(e) => setEndDepth(e.target.value)}
                  placeholder={file.wellInfo.stopDepth}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Select/Deselect All */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">
                {selectedCurves.length} of {file.curves.length} curves selected
              </p>
              <button
                onClick={() =>
                  selectedCurves.length === file.curves.length
                    ? setSelectedCurves([])
                    : setSelectedCurves(file.curves.map((c) => c.name))
                }
                className="text-sm text-blue-600 hover:underline"
              >
                {selectedCurves.length === file.curves.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            {/* Curve Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {file.curves.map((curve, index) => (
                <div
                  key={index}
                  onClick={() => handleCurveToggle(curve.name)}
                  className={`cursor-pointer rounded-lg p-3 border transition-all ${
                    selectedCurves.includes(curve.name)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800">{curve.name}</p>
                    {selectedCurves.includes(curve.name) && (
                      <FiCheckCircle className="text-blue-500" size={16} />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{curve.unit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* File Metadata */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FiCalendar className="mr-2 text-blue-600" size={24} />
              File Metadata
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600 font-medium">File Name:</span>
                <span className="text-gray-800">{file.filename}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600 font-medium">Uploaded:</span>
                <span className="text-gray-800">
                  {formatDate(file.uploadDate)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600 font-medium">File Size:</span>
                <span className="text-gray-800">
                  {formatFileSize(file.fileSize)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600 font-medium">Status:</span>
                <span
                  className={`
                  font-semibold
                  ${file.status === "ready" ? "text-green-600" : "text-yellow-600"}
                `}
                >
                  {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 font-medium">S3 Key:</span>
                <span className="text-gray-800 text-sm truncate max-w-md">
                  {file.s3Key}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellDetails;
