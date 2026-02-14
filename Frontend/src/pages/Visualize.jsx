import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Plot from "react-plotly.js";
import axios from "axios";
import {
  FiArrowLeft,
  FiRefreshCw,
  FiZoomIn,
  FiZoomOut,
  FiMaximize,
  FiMinimize,
  FiActivity,
  FiLoader,
  FiAlertCircle,
  FiMove,
  FiHome,
  FiDownload,
} from "react-icons/fi";

const Visualize = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const plotRef = useRef(null);

  // State
  const [file, setFile] = useState(null);
  const [availableCurves, setAvailableCurves] = useState([]);
  const [selectedCurves, setSelectedCurves] = useState([]); // Changed to array (max 5)
  const [depthRange, setDepthRange] = useState({ min: 0, max: 0 });
  const [tempDepthRange, setTempDepthRange] = useState({ min: 0, max: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // New state for enhanced controls
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [plotRevision, setPlotRevision] = useState(0);
  const [zoomHistory, setZoomHistory] = useState([]);
  const [currentZoomIndex, setCurrentZoomIndex] = useState(-1);

  const url = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Show notification helper
  const showNotification = (message, type = "warning") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch file metadata on mount
  useEffect(() => {
    let isMounted = true;

    const fetchFileMetadata = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${url}/data/getfile/${id}`);
        const fileData = response.data.data;

        if (!isMounted) return;

        setFile(fileData);

        const curves = fileData.curves
          .filter(
            (c) =>
              c.name.toLowerCase() !== "depth" &&
              c.name.toLowerCase() !== "time",
          )
          .map((c) => c.name);

        setAvailableCurves(curves);

        const range = {
          min: fileData.wellInfo.startDepth,
          max: fileData.wellInfo.stopDepth,
        };
        setDepthRange(range);
        setTempDepthRange(range);

        // Auto-select first curve in array
        setSelectedCurves(curves[0] ? [curves[0]] : []);
      } catch (err) {
        console.error("Error fetching file:", err);
        if (isMounted) {
          setError("Failed to load file data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFileMetadata();

    return () => {
      isMounted = false;
    };
  }, [id, url]);

  // Fetch chart data when curves or depth changes
  useEffect(() => {
    let isMounted = true;

    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${url}/data/rangeinfo/${id}`, {
          params: {
            curves: selectedCurves.join(','), // Send as comma-separated string
            startDepth: depthRange.min,
            endDepth: depthRange.max,
          },
        });

        if (isMounted) {
          setChartData(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching chart data:", err);
        if (isMounted) {
          setError("Failed to load chart data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (selectedCurves.length > 0) {
      fetchChartData();
    } else {
      setChartData([]);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id, selectedCurves, depthRange, url, retryCount]);

  const handleCurveSelect = (curveName) => {
    setSelectedCurves((prev) => {
      if (prev.includes(curveName)) {
        // Remove curve if already selected
        return prev.filter((c) => c !== curveName);
      } else {
        // Add curve if not at max limit
        if (prev.length >= 5) {
          showNotification("Maximum 5 curves can be selected", "warning");
          return prev;
        }
        return [...prev, curveName];
      }
    });
    // Reset zoom history when changing curves
    setZoomHistory([]);
    setCurrentZoomIndex(-1);
  };

  // Validate depth range
  const isDepthRangeValid = useMemo(() => {
    if (!file) return false;

    const minValid = !isNaN(tempDepthRange.min);
    const maxValid = !isNaN(tempDepthRange.max);
    const orderValid = tempDepthRange.min < tempDepthRange.max;
    const rangeValid =
      tempDepthRange.min >= file.wellInfo.startDepth &&
      tempDepthRange.max <= file.wellInfo.stopDepth;

    return minValid && maxValid && orderValid && rangeValid;
  }, [tempDepthRange, file]);

  // Handle depth range change
  const handleApplyDepthRange = () => {
    if (isNaN(tempDepthRange.min) || isNaN(tempDepthRange.max)) {
      setError("Depth values must be valid numbers");
      showNotification("Please enter valid numbers for depth range", "error");
      return;
    }

    if (tempDepthRange.min >= tempDepthRange.max) {
      setError("Start depth must be less than end depth");
      showNotification("Start depth must be less than end depth", "error");
      return;
    }

    if (
      tempDepthRange.min < file.wellInfo.startDepth ||
      tempDepthRange.max > file.wellInfo.stopDepth
    ) {
      setError(
        `Depth range must be between ${file.wellInfo.startDepth} and ${file.wellInfo.stopDepth}`,
      );
      showNotification(
        `Depth must be within ${file.wellInfo.startDepth} - ${file.wellInfo.stopDepth}`,
        "error",
      );
      return;
    }

    setError(null);
    setDepthRange(tempDepthRange);
  };

  const handleResetDepthRange = () => {
    if (!file) return;

    const range = {
      min: file.wellInfo.startDepth,
      max: file.wellInfo.stopDepth,
    };
    setDepthRange(range);
    setTempDepthRange(range);
    setError(null);
    setPlotRevision((prev) => prev + 1);
  };

  // Enhanced zoom controls
  const handleZoomIn = () => {
    if (!plotRef.current) return;
    
    const layout = plotRef.current.layout;
    const xRange = layout.xaxis.range;
    const yRange = layout.yaxis.range;
    
    if (xRange && yRange) {
      const xCenter = (xRange[0] + xRange[1]) / 2;
      const yCenter = (yRange[0] + yRange[1]) / 2;
      const xDelta = (xRange[1] - xRange[0]) * 0.25;
      const yDelta = (yRange[1] - yRange[0]) * 0.25;
      
      window.Plotly.relayout(plotRef.current, {
        'xaxis.range': [xCenter - xDelta, xCenter + xDelta],
        'yaxis.range': [yCenter - yDelta, yCenter + yDelta]
      });
    }
  };

  const handleZoomOut = () => {
    if (!plotRef.current) return;
    
    const layout = plotRef.current.layout;
    const xRange = layout.xaxis.range;
    const yRange = layout.yaxis.range;
    
    if (xRange && yRange) {
      const xCenter = (xRange[0] + xRange[1]) / 2;
      const yCenter = (yRange[0] + yRange[1]) / 2;
      const xDelta = (xRange[1] - xRange[0]) * 0.75;
      const yDelta = (yRange[1] - yRange[0]) * 0.75;
      
      window.Plotly.relayout(plotRef.current, {
        'xaxis.range': [xCenter - xDelta, xCenter + xDelta],
        'yaxis.range': [yCenter - yDelta, yCenter + yDelta]
      });
    }
  };

  const handleResetZoom = () => {
    setPlotRevision((prev) => prev + 1);
    showNotification("Zoom reset to original view", "info");
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle escape key for fullscreen
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFullscreen]);
  const getColorForIndex = (index) => {
  const colors = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Orange
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#EC4899", // Pink
  ];
  return colors[index % colors.length];
};
  // Prepare Plotly data
  const preparePlotlyData = () => {
    if (!chartData || chartData.length === 0 || selectedCurves.length === 0) {
      return [];
    }

    // Create a trace for each selected curve
    return selectedCurves.map((curveName, index) => {
      const xValues = [];
      const yValues = [];

      chartData.forEach((point) => {
        const value = point.values[curveName];
        if (
          value !== undefined &&
          value !== null &&
          value !== file?.wellInfo?.nullValue
        ) {
          xValues.push(value);
          yValues.push(point.depth);
        }
      });

      return {
        x: xValues,
        y: yValues,
        type: "scatter",
        mode: "lines",
        name: curveName,
        line: {
          width: 2.5,
          color: getColorForIndex(index),
        },
        hovertemplate: `<b>${curveName}</b><br>Depth: %{y:.2f}<br>Value: %{x:.4f}<extra></extra>`,
      };
    });
  };

  // Prepare Plotly layout with enhanced features
  const preparePlotlyLayout = () => {
    if (selectedCurves.length === 0) return {};

    const curveTitle = selectedCurves.length === 1 
      ? selectedCurves[0] 
      : `${selectedCurves.length} Curves`;

    return {
      title: {
        text: `${file?.wellInfo?.wellName || "Well Log"} - ${curveTitle}`,
        font: { size: isFullscreen ? 24 : 20, weight: "bold" },
      },
      xaxis: {
        title: {
          text: selectedCurves.length === 1 ? selectedCurves[0] : "Value",
          font: { size: isFullscreen ? 16 : 14 }
        },
        side: "bottom",
        showgrid: true,
        gridcolor: "#E5E7EB",
        zeroline: true,
        zerolinecolor: "#9CA3AF",
        zerolinewidth: 2,
      },
      yaxis: {
        title: {
          text: `Depth (${file?.wellInfo?.depthUnit || "F"})`,
          font: { size: isFullscreen ? 16 : 14 }
        },
        autorange: "reversed",
        side: "left",
        showgrid: true,
        gridcolor: "#E5E7EB",
      },
      showlegend: selectedCurves.length > 1, // Show legend when multiple curves
      legend: {
        x: 1.02,
        y: 1,
        xanchor: "left",
        yanchor: "top",
        bgcolor: "rgba(255, 255, 255, 0.8)",
        bordercolor: "#E5E7EB",
        borderwidth: 1,
      },
      hovermode: "closest",
      height: isFullscreen ? window.innerHeight - 100 : 700,
      margin: { 
        t: isFullscreen ? 100 : 80, 
        b: isFullscreen ? 100 : 80, 
        l: isFullscreen ? 100 : 80, 
        r: isFullscreen ? (selectedCurves.length > 1 ? 140 : 60) : (selectedCurves.length > 1 ? 120 : 40)
      },
      plot_bgcolor: "#FFFFFF",
      paper_bgcolor: "#F9FAFB",
      dragmode: "pan", // Default to pan mode
    };
  };

  // Memoize plotly data for performance
  const plotlyData = useMemo(
    () => preparePlotlyData(),
    [chartData, selectedCurves, file]
  );

  const plotlyLayout = useMemo(
    () => preparePlotlyLayout(),
    [selectedCurves, file, isFullscreen, plotRevision]
  );

  // Filter curves based on search
  const filteredCurves = availableCurves.filter((curve) =>
    curve.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Handle retry
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  // Download chart as image
  const handleDownloadImage = () => {
    if (!plotRef.current) return;
    
    const curveNames = selectedCurves.length === 1 
      ? selectedCurves[0] 
      : `${selectedCurves.length}_curves`;
    
    window.Plotly.downloadImage(plotRef.current, {
      format: "png",
      filename: `${file?.wellInfo?.wellName}_${curveNames}_log`,
      height: 1200,
      width: 1600,
      scale: 2,
    });
    
    showNotification("Chart downloaded successfully", "info");
  };

  if (loading && !file) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiLoader
            className="animate-spin text-blue-600 mx-auto mb-4"
            size={48}
          />
          <p className="text-gray-600">Loading file data...</p>
        </div>
      </div>
    );
  }

  if (error && !file) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <FiAlertCircle className="text-red-600 mx-auto mb-4" size={64} />
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
              <Link
                to="/"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Notification Toast */}
        {notification && (
          <div
            className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
              notification.type === "error"
                ? "bg-red-500"
                : notification.type === "warning"
                  ? "bg-orange-500"
                  : "bg-blue-500"
            } text-white animate-slide-in`}
          >
            <FiAlertCircle size={20} />
            <span>{notification.message}</span>
          </div>
        )}

        {/* Fullscreen Modal */}
        {isFullscreen && (
          <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
            {/* Fullscreen Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {file?.wellInfo?.wellName} - {selectedCurves.length === 1 ? selectedCurves[0] : `${selectedCurves.length} Curves`}
                </h2>
                <p className="text-sm text-blue-100">
                  Depth: {depthRange.min.toLocaleString()} - {depthRange.max.toLocaleString()} {file?.wellInfo?.depthUnit}
                  {selectedCurves.length > 1 && ` • ${selectedCurves.join(', ')}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadImage}
                  className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                  title="Download Image"
                >
                  <FiDownload size={20} />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                  title="Exit Fullscreen (Esc)"
                >
                  <FiMinimize size={20} />
                </button>
              </div>
            </div>

            {/* Fullscreen Chart */}
            <div className="flex-1 bg-white p-4 overflow-hidden">
              {!loading && selectedCurves.length > 0 && chartData.length > 0 && (
                <Plot
                  ref={(el) => (plotRef.current = el)}
                  data={plotlyData}
                  layout={plotlyLayout}
                  config={{
                    responsive: true,
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToRemove: ["lasso2d", "select2d"],
                    scrollZoom: true,
                    toImageButtonOptions: {
                      format: "png",
                      filename: `${file?.wellInfo?.wellName}_${selectedCurves.length === 1 ? selectedCurves[0] : `${selectedCurves.length}_curves`}_log`,
                      height: 1200,
                      width: 1600,
                      scale: 2,
                    },
                  }}
                  style={{ width: "100%", height: "100%" }}
                  useResizeHandler={true}
                  revision={plotRevision}
                />
              )}
            </div>

            {/* Fullscreen Controls */}
            <div className="bg-gray-800 text-white p-4 flex items-center justify-center gap-4">
              <button
                onClick={handleZoomIn}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <FiZoomIn size={18} />
                Zoom In
              </button>
              <button
                onClick={handleZoomOut}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <FiZoomOut size={18} />
                Zoom Out
              </button>
              <button
                onClick={handleResetZoom}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <FiHome size={18} />
                Reset View
              </button>
              <div className="text-sm text-gray-400 ml-4">
                <span className="font-semibold">Tip:</span> Scroll to zoom, drag to pan, double-click to reset
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" size={20} />
          Back to Files
        </Link>

        {/* File Info Banner */}
        {file && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">
              {file.wellInfo.wellName}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm">
              <span>{file.wellInfo.company}</span>
              <span>•</span>
              <span>{file.wellInfo.field}</span>
              <span>•</span>
              <span>
                Depth: {file.wellInfo.startDepth.toLocaleString()} -{" "}
                {file.wellInfo.stopDepth.toLocaleString()}{" "}
                {file.wellInfo.depthUnit}
              </span>
              <span>•</span>
              <span>{availableCurves.length} Curves Available</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Curve Selector */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Select Curves ({selectedCurves.length}/5 of {availableCurves.length})
              </h3>

              {/* Search */}
              <input
                type="text"
                placeholder="Search curves..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              {/* Curve List - CHECKBOXES */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredCurves.map((curve, index) => {
                  const isSelected = selectedCurves.includes(curve);
                  const curveIndex = selectedCurves.indexOf(curve);
                  return (
                    <label
                      key={curve}
                      className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50 border border-blue-300"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCurveSelect(curve)}
                        disabled={!isSelected && selectedCurves.length >= 5}
                        className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      {isSelected && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getColorForIndex(curveIndex) }}
                        ></div>
                      )}
                      <span
                        className={`text-sm flex-1 ${
                          isSelected
                            ? "text-blue-700 font-semibold"
                            : selectedCurves.length >= 5
                              ? "text-gray-400"
                              : "text-gray-700"
                        }`}
                      >
                        {curve}
                      </span>
                    </label>
                  );
                })}
              </div>

              {filteredCurves.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No curves found
                </p>
              )}

              {/* Show selected curves info */}
              {selectedCurves.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 font-semibold mb-2">
                    Selected Curves ({selectedCurves.length}/5):
                  </p>
                  <div className="space-y-1">
                    {selectedCurves.map((curve, index) => (
                      <div key={curve} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getColorForIndex(index) }}
                        ></div>
                        <span className="text-xs text-blue-600">{curve}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCurves.length === 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 text-center">
                    No curves selected
                  </p>
                </div>
              )}
            </div>

            {/* Depth Range */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Depth Range
              </h3>

              {file && (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Available: {file.wellInfo.startDepth.toLocaleString()} -{" "}
                    {file.wellInfo.stopDepth.toLocaleString()}{" "}
                    {file.wellInfo.depthUnit}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From ({file.wellInfo.depthUnit})
                      </label>
                      <input
                        type="number"
                        value={tempDepthRange.min}
                        onChange={(e) =>
                          setTempDepthRange({
                            ...tempDepthRange,
                            min: parseFloat(e.target.value) || 0,
                          })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          !isDepthRangeValid &&
                          tempDepthRange.min !== file.wellInfo.startDepth
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To ({file.wellInfo.depthUnit})
                      </label>
                      <input
                        type="number"
                        value={tempDepthRange.max}
                        onChange={(e) =>
                          setTempDepthRange({
                            ...tempDepthRange,
                            max: parseFloat(e.target.value) || 0,
                          })
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          !isDepthRangeValid &&
                          tempDepthRange.max !== file.wellInfo.stopDepth
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>

                    <button
                      onClick={handleApplyDepthRange}
                      disabled={!isDepthRangeValid}
                      className={`w-full px-4 py-2 font-medium rounded-lg transition-colors ${
                        isDepthRangeValid
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Apply Range
                    </button>

                    <button
                      onClick={handleResetDepthRange}
                      className="w-full px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <FiRefreshCw className="inline mr-2" size={16} />
                      Reset to Full
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Chart Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Enhanced Chart Controls */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleZoomIn}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Zoom In"
                  >
                    <FiZoomIn size={20} />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Zoom Out"
                  >
                    <FiZoomOut size={20} />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Reset Zoom"
                  >
                    <FiHome size={20} />
                  </button>
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    title="Fullscreen Mode"
                  >
                    <FiMaximize size={20} />
                  </button>
                  <button
                    onClick={handleDownloadImage}
                    className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                    title="Download as PNG"
                  >
                    <FiDownload size={20} />
                  </button>
                </div>
                
                <div className="text-sm text-gray-500">
                  <span className="font-semibold">Quick Tips:</span> Scroll to zoom • Drag to pan • Double-click to reset
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <FiLoader
                      className="animate-spin text-blue-600 mx-auto mb-4"
                      size={48}
                    />
                    <p className="text-gray-600">Loading chart data...</p>
                  </div>
                </div>
              )}

              {!loading && selectedCurves.length === 0 && (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                  <FiActivity size={64} className="mb-4" />
                  <p className="text-lg font-medium">No curves selected</p>
                  <p className="text-sm">
                    Select up to 5 curves from the sidebar to visualize
                  </p>
                </div>
              )}

              {!loading && selectedCurves.length > 0 && chartData.length === 0 && (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                  <FiAlertCircle size={64} className="mb-4" />
                  <p className="text-lg font-medium">No data available</p>
                  <p className="text-sm text-center px-4">
                    The selected curves may not have values in this depth range.
                  </p>
                  <p className="text-sm text-center px-4">
                    Try adjusting the depth range or selecting different curves
                  </p>
                </div>
              )}

              {!loading && selectedCurves.length > 0 && chartData.length > 0 && (
                <Plot
                  ref={(el) => (plotRef.current = el)}
                  data={plotlyData}
                  layout={plotlyLayout}
                  config={{
                    responsive: true,
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToRemove: ["lasso2d", "select2d"],
                    scrollZoom: true, // Enable scroll to zoom
                    doubleClick: "reset", // Double-click to reset
                    toImageButtonOptions: {
                      format: "png",
                      filename: `${file?.wellInfo?.wellName}_${selectedCurves.length === 1 ? selectedCurves[0] : `${selectedCurves.length}_curves`}_log`,
                      height: 1200,
                      width: 1600,
                      scale: 2,
                    },
                  }}
                  style={{ width: "100%", height: "100%" }}
                  useResizeHandler={true}
                  revision={plotRevision}
                />
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-800">
                      <FiAlertCircle size={20} />
                      <span>{error}</span>
                    </div>
                    <button
                      onClick={handleRetry}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Visualize;