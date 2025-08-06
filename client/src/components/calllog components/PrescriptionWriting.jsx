import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  IoIosArrowBack,
  IoIosAdd,
  IoMdTrash,
  IoIosSave,
  IoMdCalendar,
} from "react-icons/io";
import {
  FaSpinner,
  FaExclamationTriangle,
  FaClock,
  FaEdit,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import config from "../../config";
import { duration } from "@mui/material";
import { Plus } from "lucide-react";
import LabelDropdown from "./LabelDropdown";
import MedicineConsumptionSelector from "./MedicineConsumptionSelector";
// Auth helper to check token
const checkAuth = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// Create axios instance with auth headers
const createAuthAxios = () => {
  const accessToken = localStorage.getItem("token");
  return axios.create({
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

// Frequency Configuration Modal Component
const FrequencyModal = ({
  isOpen,
  onClose,
  onSave,
  selectedDurationDays = [], // Days selected in duration modal
  currentFrequencies = [],
  frequencyType = "standard", // Pre-selected frequency type
}) => {
  const [dayRanges, setDayRanges] = useState([]);
  const [selectedRange, setSelectedRange] = useState(null);
  const [rangeConfigurations, setRangeConfigurations] = useState({});
  const [clickStart, setClickStart] = useState(null);
  const calendarRef = useRef(null);

  // Use selected duration days or fall back to all days
  const availableDays =
    selectedDurationDays.length > 0 ? selectedDurationDays : [];
  const totalDays = availableDays.length;

  // Time validation ranges
  const timeRanges = {
    morning: { start: "04:00", end: "11:59" },
    afternoon: { start: "12:00", end: "16:59" },
    evening: { start: "17:00", end: "20:59" },
    night: { start: "21:00", end: "03:59" },
  };

  useEffect(() => {
    if (currentFrequencies.length > 0) {
      console.log("Loading existing frequencies:", currentFrequencies);

      // Group existing frequencies by day ranges
      const ranges = [];
      const configs = {};
      const dayToRangeMap = new Map();

      currentFrequencies.forEach((freq) => {
        if (availableDays.includes(freq.day)) {
          const key = freq.duration || `Day ${freq.day}`;

          if (!dayToRangeMap.has(key)) {
            dayToRangeMap.set(key, []);
          }
          dayToRangeMap.get(key).push(freq.day);
        }
      });

      // Convert map to ranges and configurations
      dayToRangeMap.forEach((days, key) => {
        const sortedDays = [...new Set(days)].sort((a, b) => a - b);
        ranges.push(sortedDays);

        const rangeKey = `${Math.min(...sortedDays)}-${Math.max(
          ...sortedDays
        )}`;
        const firstFreq = currentFrequencies.find((f) =>
          sortedDays.includes(f.day)
        );

        if (firstFreq) {
          configs[rangeKey] = {
            days: sortedDays,
            frequencyType: firstFreq.frequencyType || frequencyType,
            standardFrequency: firstFreq.standardFrequency || {},
            frequentFrequency: firstFreq.frequentFrequency || {},
          };
        }
      });

      setDayRanges(ranges);
      setRangeConfigurations(configs);
    }
  }, [currentFrequencies, availableDays, frequencyType]);

  const validateTime = (time, period) => {
    if (!time) return true;

    const timeMinutes = timeToMinutes(time);
    const range = timeRanges[period];
    const startMinutes = timeToMinutes(range.start);
    const endMinutes = timeToMinutes(range.end);

    // Handle overnight periods (night time)
    if (period === "night") {
      return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
    }

    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  };

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const getTimeRangeLabel = (period) => {
    const range = timeRanges[period];
    return `${range.start} - ${range.end}`;
  };

  const handleDayClick = (day) => {
    if (clickStart === null) {
      // First click - set start
      setClickStart(day);
    } else {
      // Second click - create range
      const sortedDays = availableDays.sort((a, b) => a - b);
      const startIndex = sortedDays.indexOf(clickStart);
      const endIndex = sortedDays.indexOf(day);

      const minIndex = Math.min(startIndex, endIndex);
      const maxIndex = Math.max(startIndex, endIndex);

      const newRange = [];
      for (let i = minIndex; i <= maxIndex; i++) {
        newRange.push(sortedDays[i]);
      }

      // Check if this range overlaps with existing ranges
      const overlapping = dayRanges.some((range) =>
        range.some((d) => newRange.includes(d))
      );

      if (!overlapping) {
        const updatedRanges = [...dayRanges, newRange];
        setDayRanges(updatedRanges);
        setSelectedRange(updatedRanges.length - 1); // Select the new range

        // Initialize configuration for new range
        const rangeKey = `${Math.min(...newRange)}-${Math.max(...newRange)}`;
        setRangeConfigurations((prev) => ({
          ...prev,
          [rangeKey]: {
            days: newRange,
            frequencyType: frequencyType,
            standardFrequency: {},
            frequentFrequency: {},
          },
        }));
      } else {
        alert(
          "This range overlaps with an existing range. Please select non-overlapping days."
        );
      }

      setClickStart(null);
    }
  };

  const handleRangeSelect = (rangeIndex) => {
    setSelectedRange(rangeIndex);
  };

  const handleRangeDelete = (rangeIndex) => {
    const newRanges = dayRanges.filter((_, index) => index !== rangeIndex);
    const rangeToDelete = dayRanges[rangeIndex];
    const rangeKey = `${Math.min(...rangeToDelete)}-${Math.max(
      ...rangeToDelete
    )}`;

    const newConfigs = { ...rangeConfigurations };
    delete newConfigs[rangeKey];

    setDayRanges(newRanges);
    setRangeConfigurations(newConfigs);
    setSelectedRange(null);
  };

  const handleFrequencyChange = (field, value) => {
    if (selectedRange === null) return;

    const currentRange = dayRanges[selectedRange];
    const rangeKey = `${Math.min(...currentRange)}-${Math.max(
      ...currentRange
    )}`;
    const fieldParts = field.split(".");

    // Validate time if it's a time field
    if (fieldParts[1] === "from" || fieldParts[1] === "to") {
      const period = fieldParts[0];
      // if (!validateTime(value, period)) {
      //   alert(`Invalid time for ${period}. Please select time between ${getTimeRangeLabel(period)}`);
      //   return;
      // }
    }

    setRangeConfigurations((prev) => {
      const frequencyKey =
        frequencyType === "standard"
          ? "standardFrequency"
          : "frequentFrequency";

      return {
        ...prev,
        [rangeKey]: {
          ...prev[rangeKey],
          days: currentRange,
          frequencyType: frequencyType,
          [frequencyKey]: {
            ...prev[rangeKey]?.[frequencyKey],
            [fieldParts[0]]: {
              ...prev[rangeKey]?.[frequencyKey]?.[fieldParts[0]],
              [fieldParts[1]]: value,
            },
          },
        },
      };
    });
  };
  const handleFrequentChange = (field, value) => {
    if (selectedRange === null) return;

    const currentRange = dayRanges[selectedRange];
    const rangeKey = `${Math.min(...currentRange)}-${Math.max(
      ...currentRange
    )}`;

    setRangeConfigurations((prev) => ({
      ...prev,
      [rangeKey]: {
        ...prev[rangeKey],
        days: currentRange,
        frequencyType: "frequent",
        frequentFrequency: {
          ...prev[rangeKey]?.frequentFrequency,
          [field]: value,
        },
      },
    }));
  };

  const clearSelection = () => {
    setDayRanges([]);
    setRangeConfigurations({});
    setSelectedRange(null);
    setClickStart(null);
  };

  const handleSave = () => {
    const freqArray = [];

    console.log("Saving frequency configuration:", {
      dayRanges,
      rangeConfigurations,
    });

    // Process each range separately
    dayRanges.forEach((range) => {
      const rangeKey = `${Math.min(...range)}-${Math.max(...range)}`;
      const config = rangeConfigurations[rangeKey];

      if (config) {
        // Create frequency objects for each day in the range
        range.forEach((day) => {
          const baseFreqObj = {
            day: day,
            duration: `Day ${Math.min(...range)}-${Math.max(...range)}`,
            frequencyType: config.frequencyType,
          };

          if (config.frequencyType === "standard") {
            // Create standardFrequency object from configuration
            const standardFrequency = {};
            ["morning", "afternoon", "evening", "night"].forEach((period) => {
              const periodConfig = config.standardFrequency?.[period] || {};
              standardFrequency[period] = {
                foodType: periodConfig.foodType || "",
                from: periodConfig.from || "",
                to: periodConfig.to || "",
              };
            });

            freqArray.push({
              ...baseFreqObj,
              standardFrequency: standardFrequency,
              // Also create timing structure for backend compatibility
              timing: {
                morning: {
                  food: standardFrequency.morning.foodType,
                  time: standardFrequency.morning.from,
                },
                afternoon: {
                  food: standardFrequency.afternoon.foodType,
                  time: standardFrequency.afternoon.from,
                },
                evening: {
                  food: standardFrequency.evening.foodType,
                  time: standardFrequency.evening.from,
                },
                night: {
                  food: standardFrequency.night.foodType,
                  time: standardFrequency.night.from,
                },
              },
            });
          } else {
            // Frequent frequency
            const frequentFrequency = config.frequentFrequency || {};
            freqArray.push({
              ...baseFreqObj,
              frequentFrequency: frequentFrequency,
              // For backend compatibility
              frequency: `${frequentFrequency.hours || 0}hr ${
                frequentFrequency.minutes || 0
              }mins`,
            });
          }
        });
      }
    });

    console.log("Final frequency array to save:", freqArray);
    onSave(freqArray);
    onClose();
  };

  const getDayRangeForDay = (day) => {
    return dayRanges.findIndex((range) => range.includes(day));
  };

  const renderCalendar = () => {
    if (availableDays.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>No duration days selected.</p>
          <p className="text-sm">Please set duration first.</p>
        </div>
      );
    }

    const weeks = [];
    let currentWeek = [];

    // Group available days into weeks of 7
    availableDays.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === availableDays.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return weeks.map((week, weekIndex) => (
      <div key={weekIndex} className="flex gap-1 mb-1">
        {week.map((day) => {
          const rangeIndex = getDayRangeForDay(day);
          const isInRange = rangeIndex !== -1;
          const isClickStart = clickStart === day;
          const isSelectedRange = selectedRange === rangeIndex;

          // Show preview range when clickStart is set
          const showPreviewRange = clickStart !== null && day !== clickStart;
          const sortedDays = availableDays.sort((a, b) => a - b);
          const startIndex = sortedDays.indexOf(clickStart);
          const currentIndex = sortedDays.indexOf(day);
          const isInPreviewRange =
            showPreviewRange &&
            currentIndex >= Math.min(startIndex, currentIndex) &&
            currentIndex <= Math.max(startIndex, currentIndex);

          // Color coding for different ranges
          const rangeColors = [
            "bg-blue-500 border-blue-500",
            "bg-green-500 border-green-500",
            "bg-purple-500 border-purple-500",
            "bg-orange-500 border-orange-500",
            "bg-pink-500 border-pink-500",
            "bg-indigo-500 border-indigo-500",
          ];

          const selectedRangeColors = [
            "bg-blue-600 border-blue-600",
            "bg-green-600 border-green-600",
            "bg-purple-600 border-purple-600",
            "bg-orange-600 border-orange-600",
            "bg-pink-600 border-pink-600",
            "bg-indigo-600 border-indigo-600",
          ];

          return (
            <div
              key={day}
              className={`
                w-12 h-12 flex items-center justify-center text-sm font-medium cursor-pointer
                border-2 rounded-lg transition-all duration-200 hover:shadow-md
                ${
                  isClickStart
                    ? "border-blue-500 bg-blue-100 text-blue-800"
                    : ""
                }
                ${
                  isInRange && !isClickStart
                    ? `${
                        isSelectedRange
                          ? selectedRangeColors[
                              rangeIndex % selectedRangeColors.length
                            ]
                          : rangeColors[rangeIndex % rangeColors.length]
                      } text-white`
                    : ""
                }
                ${
                  !isInRange && !isClickStart
                    ? "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    : ""
                }
                ${
                  isInPreviewRange && !isInRange
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : ""
                }
              `}
              onClick={() => handleDayClick(day)}
              title={`Day ${day}${
                isInRange ? ` (Range ${rangeIndex + 1})` : ""
              }`}
            >
              {day}
            </div>
          );
        })}
        {/* Fill remaining slots in week */}
        {week.length < 7 &&
          Array.from({ length: 7 - week.length }, (_, index) => (
            <div key={`empty-${index}`} className="w-12 h-12"></div>
          ))}
      </div>
    ));
  };

  const renderRangeSummary = () => {
    if (dayRanges.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No day ranges selected</p>
          <p className="text-xs">Click on calendar to select day ranges</p>
        </div>
      );
    }

    const rangeColors = [
      "bg-blue-100 border-blue-300 text-blue-800",
      "bg-green-100 border-green-300 text-green-800",
      "bg-purple-100 border-purple-300 text-purple-800",
      "bg-orange-100 border-orange-300 text-orange-800",
      "bg-pink-100 border-pink-300 text-pink-800",
      "bg-indigo-100 border-indigo-300 text-indigo-800",
    ];

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 mb-3">Day Ranges Summary</h4>
        {dayRanges.map((range, index) => {
          const rangeKey = `${Math.min(...range)}-${Math.max(...range)}`;
          const config = rangeConfigurations[rangeKey];
          const isSelected = selectedRange === index;

          return (
            <div
              key={index}
              className={`
                p-3 border-2 rounded-lg cursor-pointer transition-all
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : rangeColors[index % rangeColors.length]
                }
                hover:shadow-md
              `}
              onClick={() => handleRangeSelect(index)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    Days {Math.min(...range)} - {Math.max(...range)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {range.length} day{range.length > 1 ? "s" : ""} selected
                  </div>
                  {config && (
                    <div className="text-xs text-gray-500 mt-1">
                      {config.frequencyType === "standard"
                        ? "Standard (4x/day)"
                        : "Custom Interval"}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRangeDelete(index);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFrequencyControls = () => {
    if (selectedRange === null) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Select a day range to configure frequency</p>
          <p className="text-sm mt-2">Choose from the day ranges on the left</p>
        </div>
      );
    }

    const currentRange = dayRanges[selectedRange];
    const rangeKey = `${Math.min(...currentRange)}-${Math.max(
      ...currentRange
    )}`;
    const config = rangeConfigurations[rangeKey] || {};
    const rangeText = `Days ${Math.min(...currentRange)} - ${Math.max(
      ...currentRange
    )}`;

    if (frequencyType === "standard") {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800">
              Standard Frequency for {rangeText}
            </h4>
            <p className="text-sm text-blue-600">4 times per day</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {["morning", "afternoon", "evening", "night"].map((period) => {
              const periodConfig = config.standardFrequency?.[period] || {};
              return (
                <div
                  key={period}
                  className="bg-white p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700 capitalize">
                      {period}
                    </label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {getTimeRangeLabel(period)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={periodConfig.from || ""}
                          onChange={(e) =>
                            handleFrequencyChange(
                              `${period}.from`,
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={periodConfig.to || ""}
                          onChange={(e) =>
                            handleFrequencyChange(
                              `${period}.to`,
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Food Type */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Food Type
                      </label>
                      <select
                        value={periodConfig.foodType || ""}
                        onChange={(e) =>
                          handleFrequencyChange(
                            `${period}.foodType`,
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="E/S">E/S (Empty Stomach)</option>
                        <option value="L/S">L/S (Light Stomach)</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    } else {
      const frequentConfig = config.frequentFrequency || {};
      return (
        <div className="space-y-4">
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800">
              Custom Interval for {rangeText}
            </h4>
            <p className="text-sm text-purple-600">
              Set custom timing interval
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={frequentConfig.hours || ""}
                  onChange={(e) =>
                    handleFrequentChange("hours", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={frequentConfig.minutes || ""}
                  onChange={(e) =>
                    handleFrequentChange(
                      "minutes",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Doses
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={frequentConfig.doses || ""}
                  onChange={(e) =>
                    handleFrequentChange(
                      "doses",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Type
              </label>
              <select
                value={frequentConfig.foodType || ""}
                onChange={(e) =>
                  handleFrequentChange("foodType", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select</option>
                <option value="E/S">E/S (Empty Stomach)</option>
                <option value="L/S">L/S (Light Stomach)</option>
              </select>
            </div> */}
          </div>
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Left Panel - Calendar & Ranges */}
          <div className="w-full lg:w-1/3 bg-gray-50 p-6 border-r overflow-y-auto max-h-[calc(95vh-3rem)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Select Day Ranges
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Info Panel */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-1">
                Frequency Type:{" "}
                {frequencyType === "standard"
                  ? "Standard (4 times/day)"
                  : "Custom Interval"}
              </div>
              <div className="text-xs text-blue-600">
                Available Days: {availableDays.join(", ") || "None selected"}
              </div>
            </div>

            {/* Calendar Controls */}
            <div className="mb-4 space-y-2">
              <button
                onClick={clearSelection}
                className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                Clear All Ranges
              </button>
              <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                Click two days to select range. Ranges cannot overlap.
              </div>
            </div>

            {/* Calendar */}
            <div className="space-y-2 mb-6" ref={calendarRef}>
              {renderCalendar()}
            </div>

            {/* Range Summary */}
            {renderRangeSummary()}
          </div>

          {/* Right Panel - Frequency Configuration */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(95vh-3rem)]">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Configure Frequency
            </h3>

            {renderFrequencyControls()}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={dayRanges.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Duration Configuration Modal Component
const DurationModal = ({
  isOpen,
  onClose,
  onSave,
  days,
  prescriptionItems,
  rawMaterials,
  consumptionType,
  currentDuration = [],
  currentRowIndex,
  allDurationRanges = [],
  allGapRanges = [],
  onUpdateMedicineCourse,
}) => {
  const [durationRanges, setDurationRanges] = useState([]);
  const [currentGapRanges, setCurrentGapRanges] = useState([]);
  const [clickStart, setClickStart] = useState(null);
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [showGapDialog, setShowGapDialog] = useState(false);
  const [gapInfo, setGapInfo] = useState(null);
  const calendarRef = useRef(null);
  const [gapDuration, setGapDuration] = useState(1);
  const [currentMedicineCourse, setCurrentMedicineCourse] = useState(days);

  // Color palette for different medicines
  const medicineColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-teal-500",
  ];

  useEffect(() => {
    if (currentDuration.length > 0) {
      setDurationRanges(currentDuration);
    } else {
      setDurationRanges([]);
    }
    
    // Initialize current gaps for this medicine
    if (allGapRanges && allGapRanges[currentRowIndex]) {
      setCurrentGapRanges(allGapRanges[currentRowIndex] || []);
    } else {
      setCurrentGapRanges([]);
    }
    
    // Calculate current medicine course including gaps
    setCurrentMedicineCourse(calculateTotalCourseDaysForDisplay());
  }, [currentDuration, currentRowIndex, allDurationRanges, allGapRanges, days]);

  // UPDATED: Calculate total course days for display - this is the key fix
  const calculateTotalCourseDaysForDisplay = () => {
    let maxDay = days; // Start with original course days
    let totalGapDaysAdded = 0;
    
    // Calculate gaps from all medicines including current one
    const allGaps = [];
    
    // Add gaps from other medicines
    if (allGapRanges && allGapRanges.length > 0) {
      allGapRanges.forEach((gaps, medicineIndex) => {
        if (gaps && gaps.length > 0) {
          gaps.forEach((gap) => {
            allGaps.push({ ...gap, medicineIndex });
          });
        }
      });
    }

    // Add current medicine's gaps
    currentGapRanges.forEach((gap) => {
      allGaps.push({ ...gap, medicineIndex: currentRowIndex });
    });

    // Count unique gap days to extend the course
    const uniqueGapDays = new Set();
    allGaps.forEach((gap) => {
      for (let day = gap.startDay; day <= gap.endDay; day++) {
        uniqueGapDays.add(day);
      }
    });

    // For Sequential modes, gaps extend the total course
    if (consumptionType === "Sequential + Gap") {
      totalGapDaysAdded = uniqueGapDays.size;
      maxDay = days + totalGapDaysAdded;
    } else if (consumptionType === "Parallel + Gap") {
      // For parallel mode, we still need to show all days including gaps
      // Find the maximum day that has any assignment or gap
      let maxAssignedDay = days;
      
      // Check all duration ranges
      allDurationRanges.forEach((ranges, medicineIndex) => {
        if (ranges && ranges.length > 0) {
          ranges.forEach((range) => {
            maxAssignedDay = Math.max(maxAssignedDay, range.endDay);
          });
        }
      });

      // Check current duration ranges
      durationRanges.forEach((range) => {
        maxAssignedDay = Math.max(maxAssignedDay, range.endDay);
      });

      // Check all gaps
      allGaps.forEach((gap) => {
        maxAssignedDay = Math.max(maxAssignedDay, gap.endDay);
      });

      maxDay = Math.max(days, maxAssignedDay);
    }

    return maxDay;
  };

  // UPDATED: Get gap assignments function
  const getGapAssignments = (day) => {
    const gaps = [];
    
    // Check gaps from all other medicines
    if (allGapRanges && allGapRanges.length > 0) {
      allGapRanges.forEach((gapRanges, medicineIndex) => {
        if (gapRanges && gapRanges.length > 0) {
          gapRanges.forEach((gap) => {
            if (day >= gap.startDay && day <= gap.endDay) {
              gaps.push({
                ...gap,
                medicineIndex,
                medicineName: prescriptionItems[medicineIndex]?.medicineName ||
                             prescriptionItems[medicineIndex]?.rawMaterial?.name ||
                             `Medicine ${medicineIndex + 1}`,
              });
            }
          });
        }
      });
    }

    // Check gaps from current medicine
    currentGapRanges.forEach((gap) => {
      if (day >= gap.startDay && day <= gap.endDay) {
        gaps.push({
          ...gap,
          medicineIndex: currentRowIndex,
          medicineName: getCurrentMedicineName(),
        });
      }
    });

    return gaps;
  };

  // UPDATED: Handle gap dialog resolve - this is crucial for proper gap handling
  const handleGapDialogResolve = (addGap) => {
    if (gapInfo) {
      const newRange = { ...gapInfo.newRange, hasGapAfter: addGap };
      applyRange(newRange);

      if (addGap) {
        // Create gap range immediately after the medicine range
        const gapStartDay = newRange.endDay + 1;
        const gapEndDay = gapStartDay + gapDuration - 1;
        
        const newGapRange = {
          startDay: gapStartDay,
          endDay: gapEndDay,
          medicineIndex: currentRowIndex,
          isGap: true,
        };

        // Add gap to current gaps
        setCurrentGapRanges(prev => [...prev, newGapRange]);

        // IMPORTANT: Calculate new course days INCLUDING the gap extension
        const newCourseDays = calculateNewCourseDaysWithGap(gapEndDay);
        setCurrentMedicineCourse(newCourseDays);
        
        // Notify parent component to update medicine course globally
        if (onUpdateMedicineCourse) {
          onUpdateMedicineCourse(newCourseDays);
        }
      }
    }
    setShowGapDialog(false);
    setGapInfo(null);
  };

  // NEW: Calculate new course days when gap is added
  const calculateNewCourseDaysWithGap = (gapEndDay) => {
    // For Sequential + Gap: extend the course by the gap days
    if (consumptionType === "Sequential + Gap") {
      return Math.max(days, gapEndDay);
    }
    
    // For Parallel + Gap: ensure we accommodate the gap
    if (consumptionType === "Parallel + Gap") {
      return Math.max(days, gapEndDay);
    }
    
    return days;
  };

  // UPDATED: Get next available day logic
  const getNextAvailableDay = () => {
    if (consumptionType === "Parallel" || consumptionType === "Parallel + Gap") {
      return 1; // In parallel mode, can start from day 1
    }

    // For sequential modes, find the next available day after all other medicines AND gaps
    let maxEndDay = 0;

    allDurationRanges.forEach((ranges, medicineIndex) => {
      if (medicineIndex !== currentRowIndex && ranges && ranges.length > 0) {
        ranges.forEach((range) => {
          maxEndDay = Math.max(maxEndDay, range.endDay);
        });
      }
    });

    // IMPORTANT: Also consider gaps from all medicines
    if (allGapRanges && allGapRanges.length > 0) {
      allGapRanges.forEach((gaps, medicineIndex) => {
        if (gaps && gaps.length > 0) {
          gaps.forEach((gap) => {
            maxEndDay = Math.max(maxEndDay, gap.endDay);
          });
        }
      });
    }

    return maxEndDay + 1;
  };

  // UPDATED: Handle day click with improved gap logic
  const handleDayClick = (day) => {
    // Check if this day has read-only assignments
    const dayAssignments = getDayAssignments(day);
    const gapAssignments = getGapAssignments(day);
    const hasReadOnlyAssignment = dayAssignments.some(
      (assignment) => assignment.isReadOnly
    );

    // In Sequential + Gap mode, can't select gap days
    if (gapAssignments.length > 0 && consumptionType === "Sequential + Gap") {
      alert(`Day ${day} is a gap day and cannot be selected for medicine.`);
      return;
    }

    // In Parallel + Gap mode, can't select gap days either
    if (gapAssignments.length > 0 && consumptionType === "Parallel + Gap") {
      alert(`Day ${day} is a gap day and cannot be selected for medicine.`);
      return;
    }

    if (hasReadOnlyAssignment && consumptionType !== "Parallel" && consumptionType !== "Parallel + Gap") {
      alert(
        `Day ${day} is already assigned to another medicine and cannot be modified.`
      );
      return;
    }

    if (clickStart === null) {
      // First click - set start
      setClickStart(day);
      setSelectedDays(new Set([day]));
    } else {
      // Second click - create range and apply
      const start = Math.min(clickStart, day);
      const end = Math.max(clickStart, day);

      // Check if any day in the range has conflicts
      let hasConflictInRange = false;
      for (let d = start; d <= end; d++) {
        const assignments = getDayAssignments(d);
        const gaps = getGapAssignments(d);
        
        if (gaps.length > 0 && (consumptionType === "Sequential + Gap" || consumptionType === "Parallel + Gap")) {
          hasConflictInRange = true;
          break;
        }
        
        if (
          assignments.some((assignment) => assignment.isReadOnly) &&
          consumptionType !== "Parallel" && consumptionType !== "Parallel + Gap"
        ) {
          hasConflictInRange = true;
          break;
        }
      }

      if (hasConflictInRange) {
        alert(
          `Some days in the selected range are already assigned or are gap days.`
        );
        setClickStart(null);
        setSelectedDays(new Set());
        return;
      }

      const newRange = {
        startDay: start,
        endDay: end,
        medicineIndex: currentRowIndex,
        hasGapAfter: false,
      };

      const conflicts = checkForConflicts(newRange);
      const isValidSequential = validateSequentialOrder(newRange);

      if (conflicts.length > 0) {
        setConflictInfo({ newRange, conflicts });
        setShowConflictDialog(true);
      } else if (!isValidSequential && consumptionType === "Sequential") {
        alert(
          "In Sequential mode, medicines must be scheduled without gaps between them."
        );
      } else {
        // For gap modes, show gap options after successful range selection
        if (consumptionType === "Sequential + Gap" || consumptionType === "Parallel + Gap") {
          setGapInfo({ newRange });
          setShowGapDialog(true);
        } else {
          applyRange(newRange);
        }
      }

      // Reset selection
      setClickStart(null);
      setSelectedDays(new Set());
    }
  };

  // UPDATED: Handle save with proper gap handling
  const handleSave = () => {
    const summary = getDurationSummary();
    
    // Combine current gaps with any existing gaps for this medicine
    const allGapsForMedicine = [...currentGapRanges];
    
    // Add gaps from ranges that have hasGapAfter flag
    durationRanges.forEach((range) => {
      if (range.hasGapAfter) {
        const gapStartDay = range.endDay + 1;
        const gapEndDay = gapStartDay + gapDuration - 1;
        allGapsForMedicine.push({
          startDay: gapStartDay,
          endDay: gapEndDay,
          medicineIndex: currentRowIndex,
          isGap: true,
        });
      }
    });

    // Calculate final course days
    const finalCourseDays = calculateFinalCourseDays(allGapsForMedicine);

    onSave(durationRanges, summary, allGapsForMedicine, finalCourseDays);
    onClose();
  };

  // NEW: Calculate final course days for saving
  const calculateFinalCourseDays = (gapsForMedicine) => {
    let maxDay = days;
    
    // Include all medicine ranges
    allDurationRanges.forEach((ranges, medicineIndex) => {
      if (ranges && ranges.length > 0) {
        ranges.forEach((range) => {
          maxDay = Math.max(maxDay, range.endDay);
        });
      }
    });

    // Include current medicine ranges
    durationRanges.forEach((range) => {
      maxDay = Math.max(maxDay, range.endDay);
    });

    // Include all gaps
    if (allGapRanges && allGapRanges.length > 0) {
      allGapRanges.forEach((gaps, medicineIndex) => {
        if (gaps && gaps.length > 0) {
          gaps.forEach((gap) => {
            maxDay = Math.max(maxDay, gap.endDay);
          });
        }
      });
    }

    // Include current medicine gaps
    gapsForMedicine.forEach((gap) => {
      maxDay = Math.max(maxDay, gap.endDay);
    });

    return maxDay;
  };

  // Keep all other functions the same...
  const getCurrentMedicineName = () => {
    if (currentRowIndex !== null && prescriptionItems[currentRowIndex]) {
      const item = prescriptionItems[currentRowIndex];
      if (item.rawMaterial) {
        return item.rawMaterial.name;
      }
      if (item.medicineName) {
        return item.medicineName;
      }
      return `Medicine ${currentRowIndex + 1}`;
    }
    return "Unknown Medicine";
  };

  const getMedicineColor = (medicineIndex) => {
    return medicineColors[medicineIndex % medicineColors.length];
  };

  const getDayAssignments = (day) => {
    const assignments = [];

    // Add read-only assignments from other medicines
    allDurationRanges.forEach((ranges, medicineIndex) => {
      if (medicineIndex !== currentRowIndex && ranges && ranges.length > 0) {
        ranges.forEach((range) => {
          if (day >= range.startDay && day <= range.endDay) {
            assignments.push({
              ...range,
              medicineIndex,
              isReadOnly: true,
              medicineName:
                prescriptionItems[medicineIndex]?.medicineName ||
                prescriptionItems[medicineIndex]?.rawMaterial?.name ||
                `Medicine ${medicineIndex + 1}`,
            });
          }
        });
      }
    });

    // Add current medicine's assignments (editable)
    durationRanges.forEach((range) => {
      if (day >= range.startDay && day <= range.endDay) {
        assignments.push({
          ...range,
          medicineIndex: currentRowIndex,
          isReadOnly: false,
          medicineName: getCurrentMedicineName(),
        });
      }
    });

    return assignments;
  };

  const checkForConflicts = (newRange) => {
    const conflicts = [];

    // In parallel mode, check if gap days are being selected for medicine
    if (consumptionType === "Parallel" || consumptionType === "Parallel + Gap") {
      for (let day = newRange.startDay; day <= newRange.endDay; day++) {
        const gapAssignments = getGapAssignments(day);
        if (gapAssignments.length > 0) {
          // In Parallel + Gap, you can't place medicine on gap days
          if (consumptionType === "Parallel + Gap") {
            conflicts.push({ 
              day, 
              existing: gapAssignments,
              type: 'gap_conflict'
            });
          }
        }
      }
      return conflicts;
    }

    // In sequential modes, overlaps are not allowed
    if (consumptionType === "Sequential" || consumptionType === "Sequential + Gap") {
      for (let day = newRange.startDay; day <= newRange.endDay; day++) {
        const existing = getDayAssignments(day).filter(
          (assignment) =>
            assignment.medicineIndex !== currentRowIndex && assignment.isReadOnly
        );
        const gapAssignments = getGapAssignments(day);
        
        if (existing.length > 0) {
          conflicts.push({ day, existing, type: 'medicine_conflict' });
        }
        if (gapAssignments.length > 0) {
          conflicts.push({ day, existing: gapAssignments, type: 'gap_conflict' });
        }
      }
    }

    return conflicts;
  };

  const validateSequentialOrder = (newRange) => {
    if (consumptionType !== "Sequential") return true;

    // Get all ranges from all medicines
    const allRanges = [];

    // Add ranges from other medicines
    allDurationRanges.forEach((ranges, medicineIndex) => {
      if (medicineIndex !== currentRowIndex && ranges && ranges.length > 0) {
        ranges.forEach((range) => {
          allRanges.push({ ...range, medicineIndex });
        });
      }
    });

    // Add current medicine's new range
    allRanges.push({ ...newRange, medicineIndex: currentRowIndex });

    // Sort by start day
    allRanges.sort((a, b) => a.startDay - b.startDay);

    // Check for gaps
    for (let i = 1; i < allRanges.length; i++) {
      const prevRange = allRanges[i - 1];
      const currentRange = allRanges[i];

      if (currentRange.startDay > prevRange.endDay + 1) {
        return false;
      }
    }

    return true;
  };

  const applyRange = (newRange) => {
    setDurationRanges((prev) => {
      // Remove any existing range for the current medicine that overlaps
      const updated = prev.filter(
        (range) =>
          !(
            newRange.startDay <= range.endDay &&
            newRange.endDay >= range.startDay
          )
      );

      // Add new range
      updated.push(newRange);
      return updated;
    });
  };

  const handleConflictResolve = (replace) => {
    if (conflictInfo) {
      if (replace) {
        if (consumptionType === "Sequential + Gap" || consumptionType === "Parallel + Gap") {
          setGapInfo({ newRange: conflictInfo.newRange });
          setShowGapDialog(true);
        } else {
          applyRange(conflictInfo.newRange);
        }
      }
    }
    setShowConflictDialog(false);
    setConflictInfo(null);
  };

  const clearDay = (day) => {
    // Only allow clearing if it's not read-only
    const dayAssignments = getDayAssignments(day);
    const hasReadOnlyAssignment = dayAssignments.some(
      (assignment) => assignment.isReadOnly
    );

    if (
      hasReadOnlyAssignment &&
      dayAssignments.every((assignment) => assignment.isReadOnly)
    ) {
      alert("This day is assigned to another medicine and cannot be cleared.");
      return;
    }

    setDurationRanges((prev) =>
      prev.filter((range) => !(day >= range.startDay && day <= range.endDay))
    );
  };

  const clearAllDays = () => {
    setDurationRanges([]);
    setClickStart(null);
    setSelectedDays(new Set());
  };

  const selectAllDays = () => {
    // Find available days (not assigned to other medicines or gaps)
    const availableDays = [];
    for (let day = 1; day <= currentMedicineCourse; day++) {
      const assignments = getDayAssignments(day);
      const gapAssignments = getGapAssignments(day);
      const hasReadOnlyAssignment = assignments.some(
        (assignment) => assignment.isReadOnly
      );

      if (!hasReadOnlyAssignment && gapAssignments.length === 0) {
        availableDays.push(day);
      }
    }

    if (availableDays.length === 0) {
      alert("No available days to assign.");
      return;
    }

    const newRange = {
      startDay: Math.min(...availableDays),
      endDay: Math.max(...availableDays),
      medicineIndex: currentRowIndex,
      hasGapAfter: false,
    };

    const conflicts = checkForConflicts(newRange);

    if (conflicts.length > 0 && consumptionType !== "Parallel" && consumptionType !== "Parallel + Gap") {
      setConflictInfo({ newRange, conflicts });
      setShowConflictDialog(true);
    } else {
      if (consumptionType === "Sequential + Gap" || consumptionType === "Parallel + Gap") {
        setGapInfo({ newRange });
        setShowGapDialog(true);
      } else {
        applyRange(newRange);
      }
    }
  };

  const getDurationSummary = () => {
    if (durationRanges.length === 0) return "No duration set";

    const totalDays = durationRanges.reduce(
      (sum, range) => sum + (range.endDay - range.startDay + 1),
      0
    );

    return `${totalDays} days (${getCurrentMedicineName()})`;
  };

  const getConsumptionTypeDescription = () => {
    switch (consumptionType) {
      case "Sequential":
        return "Medicines must be taken one after another without any gaps between them.";
      case "Sequential + Gap":
        return "Medicines are taken one after another, with optional gaps between medicines. Gaps extend the total treatment duration.";
      case "Parallel":
        return "All medicines can be taken simultaneously with overlapping schedules.";
      case "Parallel + Gap":
        return "Medicines can overlap, but gap periods block all medicine scheduling during those days.";
      default:
        return "";
    }
  };

  const getTotalAssignedDays = () => {
    let total = 0;

    // Count from other medicines
    allDurationRanges.forEach((ranges, medicineIndex) => {
      if (medicineIndex !== currentRowIndex && ranges && ranges.length > 0) {
        ranges.forEach((range) => {
          total += range.endDay - range.startDay + 1;
        });
      }
    });

    // Count from current medicine
    durationRanges.forEach((range) => {
      total += range.endDay - range.startDay + 1;
    });

    return total;
  };

  const renderCalendar = () => {
    const weeks = [];
    let currentWeek = [];
    const totalDays = currentMedicineCourse;

    for (let day = 1; day <= totalDays; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7 || day === totalDays) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }

    return weeks.map((week, weekIndex) => (
      <div key={weekIndex} className="flex">
        {week.map((day) => {
          const assignments = getDayAssignments(day);
          const gapAssignments = getGapAssignments(day);
          const isSelected = selectedDays.has(day);
          const isClickStart = clickStart === day;
          const hasAssignment = assignments.length > 0;
          const hasReadOnlyAssignment = assignments.some(
            (assignment) => assignment.isReadOnly
          );
          const hasEditableAssignment = assignments.some(
            (assignment) => !assignment.isReadOnly
          );
          const isGapDay = gapAssignments.length > 0;
          const isOriginalCoursePeriod = day <= days;

          // Show preview range when clickStart is set
          const showPreviewRange = clickStart !== null && day !== clickStart;
          const isInPreviewRange =
            showPreviewRange &&
            day >= Math.min(clickStart, day) &&
            day <= Math.max(clickStart, day);

          return (
            <div
              key={day}
              className={`
                w-16 h-16 border border-gray-200 cursor-pointer relative overflow-hidden
                transition-all duration-200 hover:shadow-md
                ${isClickStart ? "ring-2 ring-blue-500 bg-blue-100" : ""}
                ${isSelected ? "ring-2 ring-blue-400 ring-opacity-75" : ""}
                ${hasAssignment ? "bg-opacity-90" : "bg-white hover:bg-gray-50"}
                ${isInPreviewRange ? "bg-blue-50 border-blue-300" : ""}
                ${isGapDay ? "bg-gray-100 border-gray-300 border-dashed" : ""}
                ${!isOriginalCoursePeriod ? "bg-yellow-50 border-yellow-300" : ""}
                ${
                  hasReadOnlyAssignment && !hasEditableAssignment
                    ? "opacity-60"
                    : ""
                }
              `}
              onClick={() => handleDayClick(day)}
              onContextMenu={(e) => {
                e.preventDefault();
                clearDay(day);
              }}
              title={
                isGapDay 
                  ? `Gap Day (Medicine ${gapAssignments[0].medicineIndex + 1})` 
                  : !isOriginalCoursePeriod 
                    ? "Extended day due to gaps" 
                    : ""
              }
            >
              {/* Day number */}
              <div className="absolute top-1 left-1 text-xs font-medium text-gray-700 z-10">
                {day}
                {!isOriginalCoursePeriod && (
                  <span className="block text-[8px] text-yellow-600">EXT</span>
                )}
              </div>

              {/* Gap indicator */}
              {isGapDay && !hasAssignment && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-xs text-gray-500 font-medium">GAP</div>
                </div>
              )}

              {/* Medicine assignments */}
              <div className="flex flex-col h-full pt-4">
                {assignments.map((assignment, idx) => (
                  <div
                    key={idx}
                    className={`
                      flex-1 ${getMedicineColor(assignment.medicineIndex)} 
                      ${
                        assignments.length === 1
                          ? "bg-opacity-40"
                          : "bg-opacity-60"
                      }
                      ${
                        assignment.isReadOnly
                          ? "bg-opacity-30 border-2 border-dashed border-gray-400"
                          : ""
                      }
                      flex items-center justify-center
                      ${
                        (consumptionType === "Parallel" || consumptionType === "Parallel + Gap") && assignments.length > 1
                          ? "border-t border-white border-opacity-30"
                          : ""
                      }
                    `}
                    title={`${assignment.medicineName}${
                      assignment.isReadOnly ? " (Read-only)" : ""
                    }`}
                  >
                    <span
                      className={`text-xs font-medium truncate px-1 ${
                        assignment.isReadOnly ? "text-gray-600" : "text-white"
                      }`}
                    >
                      {assignment.medicineName.substring(0, 6)}
                      {assignment.isReadOnly && (
                        <span className="block text-[8px]">R/O</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {/* Fill empty cells for incomplete weeks */}
        {week.length < 7 &&
          Array.from({ length: 7 - week.length }, (_, index) => (
            <div
              key={`empty-${index}`}
              className="w-16 h-16 border border-gray-200 bg-gray-50"
            ></div>
          ))}
      </div>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="max-h-96 overflow-y-auto border rounded p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
          <div className="flex h-full">
            {/* Left Panel - Medicine Info & Controls */}
            <div className="w-1/3 bg-gray-50 p-6 border-r overflow-y-auto max-h-[calc(95vh-3rem)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Duration Setup
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Consumption Type Info */}
              <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-1">
                  Mode: {consumptionType}
                </div>
                <div className="text-xs text-blue-600">
                  {getConsumptionTypeDescription()}
                </div>
              </div>

              {/* Treatment Period Info */}
              <div className="mb-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-sm font-medium text-amber-800 mb-1">
                  Original Course: {days} days
                </div>
                {currentMedicineCourse > days && (
                  <div className="text-sm font-medium text-amber-800 mb-1">
                    Extended Course: {currentMedicineCourse} days
                  </div>
                )}
                <div className="text-xs text-amber-600">
                  Assigned: {getTotalAssignedDays()} days
                  {(consumptionType === "Sequential + Gap" || consumptionType === "Parallel + Gap") && (
                    <span> • Extended due to gaps</span>
                  )}
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        (getTotalAssignedDays() / currentMedicineCourse) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Current Medicine Info */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">
                  Setting Duration For:
                </h4>
                <div className="p-3 rounded-lg bg-blue-50 border-2 border-blue-500">
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded ${
                        medicineColors[currentRowIndex % medicineColors.length]
                      } mr-3`}
                    ></div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">
                        {getCurrentMedicineName()}
                      </span>
                      <div className="text-xs text-gray-500">
                        Row #{currentRowIndex + 1}
                      </div>
                      <div className="text-xs text-blue-600">
                        Next available: Day {getNextAvailableDay()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6 p-4 bg-white rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-2">How to Use</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• Click first day, then click end day</div>
                  <div>• All days between will be selected</div>
                  <div>• Right-click any day to clear it</div>
                  <div>• Dashed boxes are other medicines (read-only)</div>
                  <div>• Gray dashed boxes are gap days</div>
                  <div>• Yellow background = extended days from gaps</div>
                  {(consumptionType === "Parallel" || consumptionType === "Parallel + Gap") && (
                    <div className="text-blue-600">
                      • Medicines can overlap {consumptionType === "Parallel + Gap" ? "except gap days" : ""}
                    </div>
                  )}
                  {consumptionType === "Sequential" && (
                    <div className="text-orange-600">
                      • No gaps allowed between medicines
                    </div>
                  )}
                  {(consumptionType === "Sequential + Gap" || consumptionType === "Parallel + Gap") && (
                    <div className="text-purple-600">
                      • Gaps extend total treatment duration
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={selectAllDays}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Select All Available Days
                  </button>
                  <button
                    onClick={clearAllDays}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Clear All Days
                  </button>
                </div>
              </div>

              {/* Current Selection Summary */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Current Selection</h4>
                <div className="p-3 bg-white rounded-lg border">
                  <div className="text-sm text-gray-600 mb-2">
                    {getDurationSummary()}
                  </div>
                  {durationRanges.length > 0 && (
                    <div className="space-y-1">
                      {durationRanges.map((range, index) => (
                        <div key={index} className="text-xs text-gray-500">
                          Days {range.startDay}-{range.endDay}
                          {range.hasGapAfter && (
                            <span className="text-purple-600 ml-2">
                              + {gapDuration} day gap
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Gap Settings for Gap Modes */}
              {(consumptionType === "Sequential + Gap" || consumptionType === "Parallel + Gap") && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">Gap Settings</h4>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <label className="block text-sm font-medium text-purple-800 mb-2">
                      Gap Duration (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={gapDuration}
                      onChange={(e) => setGapDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <div className="text-xs text-purple-600 mt-1">
                      This gap will be added after each selected medicine range
                    </div>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-3">Legend</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 bg-opacity-40 rounded mr-2"></div>
                    <span>Current Medicine (Editable)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 bg-opacity-30 border-2 border-dashed border-gray-400 rounded mr-2"></div>
                    <span>Other Medicine (Read-only)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-100 border border-gray-300 border-dashed rounded mr-2"></div>
                    <span>Gap Day</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-50 border border-yellow-300 rounded mr-2"></div>
                    <span>Extended Day</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 ring-2 ring-blue-500 bg-blue-100 rounded mr-2"></div>
                    <span>Selection Start</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Save Duration
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Right Panel - Calendar */}
            <div className="flex-1 p-6 overflow-y-auto max-h-[calc(95vh-3rem)]">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Treatment Calendar
                </h3>
                <div className="text-sm text-gray-600">
                  {clickStart !== null
                    ? `Select end day (started from day ${clickStart})`
                    : "Click to select start day"}
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="border rounded-lg overflow-hidden bg-white" ref={calendarRef}>
                {/* Week Headers */}
                <div className="flex bg-gray-100 border-b">
                  {["Day", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                    <div key={day} className="w-16 h-8 flex items-center justify-center text-xs font-medium text-gray-600 border-r">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="bg-white">
                  {renderCalendar()}
                </div>
              </div>

              {/* Status Messages */}
              {clickStart !== null && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-800">
                    Selection started from day {clickStart}. Click another day to complete the range.
                  </div>
                </div>
              )}

              {/* Treatment Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Treatment Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Original Course:</span>
                    <span className="font-medium ml-2">{days} days</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Extended Course:</span>
                    <span className="font-medium ml-2">{currentMedicineCourse} days</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Assigned:</span>
                    <span className="font-medium ml-2">{getTotalAssignedDays()} days</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mode:</span>
                    <span className="font-medium ml-2">{consumptionType}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conflict Resolution Dialog */}
        {showConflictDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Conflict Detected</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  The selected range conflicts with existing assignments:
                </p>
                <div className="space-y-1">
                  {conflictInfo?.conflicts.map((conflict, index) => (
                    <div key={index} className="text-xs text-red-600">
                      Day {conflict.day}: {conflict.type === 'gap_conflict' ? 'Gap day' : 'Medicine conflict'} - {conflict.existing.map(e => e.medicineName || 'Gap').join(', ')}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleConflictResolve(true)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Replace Existing
                </button>
                <button
                  onClick={() => handleConflictResolve(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gap Dialog */}
        {showGapDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-purple-600 mb-4">Add Gap After Medicine?</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Do you want to add a {gapDuration}-day gap after this medicine range?
                </p>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-800">
                    Medicine: Days {gapInfo?.newRange.startDay}-{gapInfo?.newRange.endDay}
                  </div>
                  <div className="text-sm text-purple-600">
                    Gap: Days {gapInfo?.newRange.endDay + 1}-{gapInfo?.newRange.endDay + gapDuration}
                  </div>
                  <div className="text-xs text-purple-500 mt-1">
                    This will extend the treatment course to {Math.max(currentMedicineCourse, gapInfo?.newRange.endDay + gapDuration)} days
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleGapDialogResolve(true)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Yes, Add Gap
                </button>
                <button
                  onClick={() => handleGapDialogResolve(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  No Gap
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )};

const PrescriptionWriting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientData } = location.state || {};
  const API_URL = config.API_URL;

  // State for all form data
  const [medicines, setMedicines] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchRawTerm, setSearchRawTerm] = useState("");
  const [existingPrescriptions, setExistingPrescriptions] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  const [showPrescriptionTable, setShowPrescriptionTable] = useState(true);
  const [frequencyType, setFrequencyType] = useState("standard");

  // Modal states
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [currentItemForModal, setCurrentItemForModal] = useState(null);
  const [currentRowIndex, setCurrentRowIndex] = useState(null);

  const [allDurationRanges, setAllDurationRanges] = useState([]);
  const [currentMedicineIndex, setCurrentMedicineIndex] = useState(null);
  const [isDurationModalOpen, setIsDurationModalOpen] = useState(false);

  const [allGapRanges, setAllGapRanges] = useState([]); // Track gap ranges for all medicines
  const [originalMedicineCourse, setOriginalMedicineCourse] = useState(10); // Store original course days

  // Prescription details
const [prescriptionData, setPrescriptionData] = useState(() => {
  // Initialize with default structure
  const defaultData = {
    patientId: "",
    consultingType: "",
    consultingFor: "",
    medicineCourse: 10,
    action: {
      status: "In Progress",
      closeComment: "",
    },
    prescriptionItems: [
      {
        id: 1,
        prescriptionType: "Only Prescription",
        consumptionType: "Sequential",
        medicineName: "",
        form: "Tablets",
        dispenseQuantity: 0,
        rawMaterials: [],
        preparationQuantity: [],
        duration: "",
        uom: "Pieces",
        frequencyType: "standard",
        frequencies: [],
        standardSchedule: [],
        frequentSchedule: [],
        durationRanges: [],
        gapRanges: [], // Add gap ranges support
        price: 0,
        medicineConsumption: "",
        customConsumption: "",
        label: "A",
        additionalComments: "",
      },
    ],
    followUpDays: 10,
    medicineCharges: 0,
    shippingCharges: 0,
    notes: "",
    parentPrescriptionId: null,
  };

  // Try to load saved data with gap support
  try {
    const saved = localStorage.getItem("draftPrescription");
    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        parsed &&
        typeof parsed === "object" &&
        parsed.prescriptionItems &&
        Array.isArray(parsed.prescriptionItems)
      ) {
        return {
          ...defaultData,
          ...parsed,
          prescriptionItems: parsed.prescriptionItems.map((item) => ({
            ...defaultData.prescriptionItems[0],
            ...item,
            id: item.id || Date.now() + Math.random(),
            gapRanges: item.gapRanges || [], // Ensure gap ranges exist
          })),
        };
      }
    }
  } catch (error) {
    console.error("Failed to parse saved prescription:", error);
    localStorage.removeItem("draftPrescription");
  }

  return defaultData;
});

  useEffect(() => {
    if (patientData?._id && prescriptionData.patientId !== patientData._id) {
      setPrescriptionData((prev) => ({
        ...prev,
        patientId: patientData._id,
      }));
    }
  }, [patientData?._id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        // Add timestamp for cleanup purposes
        const dataToSave = {
          ...prescriptionData,
          _savedAt: new Date().toISOString(),
          _version: "1.0", // Add version for future migrations
        };

        localStorage.setItem("draftPrescription", JSON.stringify(dataToSave));
        console.log("Prescription draft saved successfully");
      } catch (error) {
        console.error("Failed to save prescription draft:", error);
        // Handle storage quota exceeded
        if (error.name === "QuotaExceededError") {
          alert("Storage limit exceeded. Please submit or clear your draft.");
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [prescriptionData]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem("draftPrescription");
    console.log("Draft cleared");
  }, []);

  const resetPrescriptionData = useCallback(() => {
  localStorage.removeItem("draftPrescription");

  setPrescriptionData({
    patientId: "",
    consultingType: "",
    consultingFor: "",
    medicineCourse: 10,
    action: {
      status: "In Progress",
      closeComment: "",
    },
    prescriptionItems: [
      {
        id: Date.now() + Math.random(),
        prescriptionType: "Only Prescription",
        consumptionType: "Sequential",
        medicineName: "",
        form: "Tablets",
        dispenseQuantity: 0,
        rawMaterials: [],
        preparationQuantity: [],
        duration: "",
        uom: "Pieces",
        frequencyType: "standard",
        frequencies: [],
        standardSchedule: [],
        frequentSchedule: [],
        durationRanges: [],
        price: 0,
        medicineConsumption: "",
        customConsumption: "",
        label: "A",
        additionalComments: "",
      },
    ],
    followUpDays: 10,
    medicineCharges: 0,
    shippingCharges: 0,
    notes: "",
    parentPrescriptionId: null,
  });

  console.log("Prescription reset and draft cleared.");
}, []);

  const hasDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem("draftPrescription");
      return saved !== null && saved !== "null";
    } catch {
      return false;
    }
  }, []);

  // Auto-cleanup old drafts (call this on app startup)
  const cleanupOldDrafts = useCallback(() => {
    try {
      const saved = localStorage.getItem("draftPrescription");
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedAt = new Date(parsed._savedAt);
        const now = new Date();
        const daysDiff = (now - savedAt) / (1000 * 60 * 60 * 24);

        // Remove drafts older than 7 days
        if (daysDiff > 7) {
          localStorage.removeItem("draftPrescription");
          console.log("Old draft cleaned up");
        }
      }
    } catch (error) {
      console.error("Error cleaning up old drafts:", error);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only show warning if there's unsaved data and it's been modified
      const hasUnsavedData =
        hasDraft() &&
        (prescriptionData.prescriptionItems.some(
          (item) =>
            item.medicineName ||
            item.additionalComments ||
            item.rawMaterials.length > 0
        ) ||
          prescriptionData.notes);

      if (hasUnsavedData) {
        e.preventDefault();
        e.returnValue = ""; // Modern browsers require this
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [prescriptionData, hasDraft]);

  useEffect(() => {
    cleanupOldDrafts();
  }, [cleanupOldDrafts]);

  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [fieldVisibility, setFieldVisibility] = useState({
    rawMaterial: true,
    preparationQuantity: true,
  });

  // Helper function to convert drops to ml (1ml = 20 drops standard)
  const dropsToMl = (drops) => {
    return parseFloat(drops) / 20;
  };

  // Helper function to convert ml to drops
  const mlToDrops = (ml) => {
    return parseFloat(ml) * 20;
  };

  const calculateDistilledWaterQuantity = (itemId) => {
    setPrescriptionData((prev) => {
      const updatedItems = prev.prescriptionItems.map((item) => {
        if (
          item.id !== itemId ||
          item.form !== "Liquid form" ||
          !item.dispenseQuantity
        ) {
          return item;
        }

        // Extract numeric value from dispense quantity (e.g., "15ml" -> 15)
        const dispenseQuantityValue = parseFloat(
          item.dispenseQuantity.replace(/[^0-9.]/g, "")
        );

        if (isNaN(dispenseQuantityValue) || dispenseQuantityValue <= 0) {
          return item;
        }

        // Calculate total drops used by other materials (excluding distilled water)
        let totalDropsUsed = 0;
        const otherMaterials = item.preparationQuantity.filter(
          (prep) => !prep.name.toLowerCase().includes("distilled water")
        );

        otherMaterials.forEach((prep) => {
          const quantity = parseFloat(prep.quantity || 0);
          if (!isNaN(quantity)) {
            // FIXED: In your structure, ML unit quantities are already in drops
            // So we don't need to convert ML to drops - they're already drops
            totalDropsUsed += quantity;
          }
        });

        // Convert total drops used to ml
        const totalMlUsed = dropsToMl(totalDropsUsed);

        // Calculate remaining ml needed
        const remainingMl = dispenseQuantityValue - totalMlUsed;

        // Convert remaining ml to drops for distilled water
        const distilledWaterDrops = Math.max(0, mlToDrops(remainingMl));

        // Update distilled water quantity in preparation
        const updatedPreparationQuantity = item.preparationQuantity.map(
          (prep) => {
            if (prep.name.toLowerCase().includes("distilled water")) {
              const parsedQuantity = parseFloat(distilledWaterDrops.toFixed(1));
              const totalPrice = parsedQuantity * prep.pricePerUnit;
              return {
                ...prep,
                quantity: parsedQuantity,
                totalPrice: totalPrice,
              };
            }
            return prep;
          }
        );

        // Recalculate total price
        const totalPrice = updatedPreparationQuantity.reduce(
          (sum, rm) => sum + rm.totalPrice,
          0
        );

        return {
          ...item,
          preparationQuantity: updatedPreparationQuantity,
          price: totalPrice,
        };
      });

      const totalMedicineCharges = updatedItems.reduce(
        (sum, item) => sum + item.price,
        0
      );

      return {
        ...prev,
        prescriptionItems: updatedItems,
        medicineCharges: totalMedicineCharges,
      };
    });
  };

  // Rest of your functions remain the same...
  const handleRawMaterialSelection = (itemId, rawMaterialId, isChecked) => {
    setPrescriptionData((prev) => {
      const updatedItems = prev.prescriptionItems.map((item) => {
        if (item.id === itemId) {
          let updatedRawMaterials = [...item.rawMaterials];
          let updatedPreparationQuantity = [...item.preparationQuantity];
          const rawMaterial = rawMaterials.find(
            (rm) => rm._id === rawMaterialId
          );

          if (isChecked && rawMaterial) {
            if (!updatedRawMaterials.some((rm) => rm._id === rawMaterialId)) {
              updatedRawMaterials.push({
                _id: rawMaterialId,
                name: rawMaterial.name,
                selected: true,
              });
              updatedPreparationQuantity.push({
                _id: rawMaterialId,
                name: rawMaterial.name,
                quantity: 1,
                unit: rawMaterial.uom,
                pricePerUnit: rawMaterial.costPerUnit,
                totalPrice: rawMaterial.costPerUnit,
              });
            }
          } else {
            updatedRawMaterials = updatedRawMaterials.filter(
              (rm) => rm._id !== rawMaterialId
            );
            updatedPreparationQuantity = updatedPreparationQuantity.filter(
              (rm) => rm._id !== rawMaterialId
            );
          }

          const totalPrice = updatedPreparationQuantity.reduce(
            (sum, rm) => sum + rm.totalPrice,
            0
          );

          return {
            ...item,
            rawMaterials: updatedRawMaterials,
            preparationQuantity: updatedPreparationQuantity,
            price: totalPrice,
          };
        }
        return item;
      });

      const totalMedicineCharges = updatedItems.reduce(
        (sum, item) => sum + item.price,
        0
      );

      return {
        ...prev,
        prescriptionItems: updatedItems,
        medicineCharges: totalMedicineCharges,
      };
    });

    // Trigger distilled water calculation after material selection
    setTimeout(() => {
      const currentItem = prescriptionData.prescriptionItems.find(
        (item) => item.id === itemId
      );
      if (currentItem && currentItem.form === "Liquid form") {
        calculateDistilledWaterQuantity(itemId);
      }
    }, 100);
  };

  const updatePreparationQuantity = (itemId, rawMaterialId, quantity) => {
    setPrescriptionData((prev) => {
      const updatedItems = prev.prescriptionItems.map((item) => {
        if (item.id === itemId) {
          const updatedPreparationQuantity = item.preparationQuantity.map(
            (rm) => {
              if (rm._id === rawMaterialId) {
                const parsedQuantity = parseFloat(quantity) || 0;
                const totalPrice = parsedQuantity * rm.pricePerUnit;
                return { ...rm, quantity: parsedQuantity, totalPrice };
              }
              return rm;
            }
          );

          const totalPrice = updatedPreparationQuantity.reduce(
            (sum, rm) => sum + rm.totalPrice,
            0
          );

          return {
            ...item,
            preparationQuantity: updatedPreparationQuantity,
            price: totalPrice,
          };
        }
        return item;
      });

      const totalMedicineCharges = updatedItems.reduce(
        (sum, item) => sum + item.price,
        0
      );

      return {
        ...prev,
        prescriptionItems: updatedItems,
        medicineCharges: totalMedicineCharges,
      };
    });

    // Trigger distilled water calculation after quantity update
    setTimeout(() => {
      const currentItem = prescriptionData.prescriptionItems.find(
        (item) => item.id === itemId
      );
      if (currentItem && currentItem.form === "Liquid form") {
        // Don't recalculate if the changed item is distilled water itself
        const changedMaterial = currentItem.preparationQuantity.find(
          (prep) => prep._id === rawMaterialId
        );
        if (
          changedMaterial &&
          !changedMaterial.name.toLowerCase().includes("distilled water")
        ) {
          calculateDistilledWaterQuantity(itemId);
        }
      }
    }, 50);
  };

  const updatePrescriptionItem = (itemId, field, value) => {
    setPrescriptionData((prev) => ({
      ...prev,
      prescriptionItems: prev.prescriptionItems.map((item) => {
        if (item.id === itemId) {
          let updatedItem = { ...item };

          if (field === "frequencyData") {
            updatedItem = {
              ...updatedItem,
              frequencies: value.frequencies,
              standardSchedule: value.standardSchedule,
              frequentSchedule: value.frequentSchedule,
              frequencyType: value.frequencyType,
            };
          } else if (field === "form") {
            const formQuantity = getQuantityByForm(value);
            updatedItem = {
              ...updatedItem,
              form: value,
              dispenseQuantity: formQuantity.quantity,
              uom: formQuantity.uom,
              preparationQuantity: (item.preparationQuantity || []).map(
                (prep) => ({
                  ...prep,
                  unit: formQuantity.uom,
                })
              ),
            };
          } else {
            updatedItem[field] = value;
          }

          return updatedItem;
        }
        return item;
      }),
    }));

    // Trigger distilled water calculation for liquid forms when dispense quantity changes
    if (field === "dispenseQuantity" || field === "form") {
      setTimeout(() => {
        const currentItem = prescriptionData.prescriptionItems.find(
          (item) => item.id === itemId
        );
        if (currentItem && currentItem.form === "Liquid form") {
          calculateDistilledWaterQuantity(itemId);
        }
      }, 100);
    }
  };

  // Form quantity mapping based on medicine form
  const getQuantityByForm = (form) => {
    const quantityMap = {
      Tablets: { quantity: 10, uom: "Graam" },
      Pills: { quantity: 20, uom: "Dram" },
      "Liquid form": { quantity: 100, uom: "ML" },
      "Individual Medicine": { quantity: 1, uom: "Pieces" },
    };
    return quantityMap[form] || { quantity: 1, uom: "Pieces" };
  };

  const LOCAL_STORAGE_KEY = "customConsumptionSuggestions";

  // Inside your component
  const [customSuggestions, setCustomSuggestions] = useState([]);

  // Load from localStorage when component mounts
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      setCustomSuggestions(JSON.parse(saved));
    }
  }, []);

  // Function to update and store new custom values
  const addCustomSuggestion = (newVal) => {
    const trimmed = newVal.trim();
    if (
      trimmed.length > 2 && // Optional: minimum length to avoid "a", "he", etc.
      !customSuggestions.includes(trimmed)
    ) {
      const updated = [...customSuggestions, trimmed];
      setCustomSuggestions(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  // Check authentication on component load
  useEffect(() => {
    if (!checkAuth()) {
      toast.error("Please login to access this page");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!patientData || !patientData._id) {
      toast.error("Patient data is missing");
      navigate(-1);
      return;
    }

    fetchData();
  }, [API_URL, navigate, location.pathname, patientData]);

  // Fetch medicines, raw materials, and existing prescriptions
  const fetchData = async () => {
    try {
      setLoading(true);
      const authAxios = createAuthAxios();

      const [medicinesRes, rawMaterialsRes, prescriptionsRes, appointmentRes] =
        await Promise.all([
          authAxios.get(`${API_URL}/api/prescriptionControl/medicines`),
          authAxios.get(`${API_URL}/api/prescriptionControl/rawMaterials`),
          authAxios.get(
            `${API_URL}/api/prescriptionControl/patient/${patientData._id}`
          ),
          patientData.appointmentId
            ? authAxios.get(
                `${API_URL}/api/prescription/appointment/${patientData.appointmentId}`
              )
            : Promise.resolve(null),
        ]);
      // console.log("medicines: ", medicinesRes.data);
      setMedicines(medicinesRes.data?.data || []);
      setRawMaterials(rawMaterialsRes.data?.data || []);
      setExistingPrescriptions(prescriptionsRes.data?.data || []);

      if (appointmentRes) {
        const appointment = appointmentRes.data?.data || {};
        setAppointmentData(appointment);
        setPrescriptionData((prev) => ({
          ...prev,
          consultingType: appointment.consultingType || "",
          consultingFor: appointment.consultingFor || "",
        }));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to load prescription data. Please try again.");
        toast.error("Failed to load prescription data");
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleRawMaterialSelection = (itemId, rawMaterialId, isChecked) => {
  //   setPrescriptionData((prev) => {
  //     const updatedItems = prev.prescriptionItems.map((item) => {
  //       if (item.id === itemId) {
  //         let updatedRawMaterials = [...item.rawMaterials];
  //         let updatedPreparationQuantity = [...item.preparationQuantity];
  //         const rawMaterial = rawMaterials.find(
  //           (rm) => rm._id === rawMaterialId
  //         );

  //         if (isChecked && rawMaterial) {
  //           if (!updatedRawMaterials.some((rm) => rm._id === rawMaterialId)) {
  //             updatedRawMaterials.push({
  //               _id: rawMaterialId,
  //               name: rawMaterial.name,
  //               selected: true,
  //             });
  //             updatedPreparationQuantity.push({
  //               _id: rawMaterialId,
  //               name: rawMaterial.name,
  //               quantity: 1,
  //               unit: rawMaterial.uom,
  //               pricePerUnit: rawMaterial.costPerUnit,
  //               totalPrice: rawMaterial.costPerUnit,
  //             });
  //           }
  //         } else {
  //           updatedRawMaterials = updatedRawMaterials.filter(
  //             (rm) => rm._id !== rawMaterialId
  //           );
  //           updatedPreparationQuantity = updatedPreparationQuantity.filter(
  //             (rm) => rm._id !== rawMaterialId
  //           );
  //         }

  //         const totalPrice = updatedPreparationQuantity.reduce(
  //           (sum, rm) => sum + rm.totalPrice,
  //           0
  //         );

  //         return {
  //           ...item,
  //           rawMaterials: updatedRawMaterials,
  //           preparationQuantity: updatedPreparationQuantity,
  //           price: totalPrice,
  //         };
  //       }
  //       return item;
  //     });

  //     const totalMedicineCharges = updatedItems.reduce(
  //       (sum, item) => sum + item.price,
  //       0
  //     );

  //     return {
  //       ...prev,
  //       prescriptionItems: updatedItems,
  //       medicineCharges: totalMedicineCharges,
  //     };
  //   });
  // };

  // const updatePreparationQuantity = (itemId, rawMaterialId, quantity) => {
  //   setPrescriptionData((prev) => {
  //     const updatedItems = prev.prescriptionItems.map((item) => {
  //       if (item.id === itemId) {
  //         const updatedPreparationQuantity = item.preparationQuantity.map(
  //           (rm) => {
  //             if (rm._id === rawMaterialId) {
  //               const parsedQuantity = parseFloat(quantity) || 0;
  //               const totalPrice = parsedQuantity * rm.pricePerUnit;
  //               return { ...rm, quantity: parsedQuantity, totalPrice };
  //             }
  //             return rm;
  //           }
  //         );

  //         const totalPrice = updatedPreparationQuantity.reduce(
  //           (sum, rm) => sum + rm.totalPrice,
  //           0
  //         );

  //         return {
  //           ...item,
  //           preparationQuantity: updatedPreparationQuantity,
  //           price: totalPrice,
  //         };
  //       }
  //       return item;
  //     });

  //     const totalMedicineCharges = updatedItems.reduce(
  //       (sum, item) => sum + item.price,
  //       0
  //     );

  //     return {
  //       ...prev,
  //       prescriptionItems: updatedItems,
  //       medicineCharges: totalMedicineCharges,
  //     };
  //   });
  // };

  // const updatePrescriptionItem = (itemId, field, value) => {
  //   setPrescriptionData((prev) => ({
  //     ...prev,
  //     prescriptionItems: prev.prescriptionItems.map((item) => {
  //       if (item.id === itemId) {
  //         let updatedItem = { ...item };

  //         if (field === "frequencyData") {
  //           // Handle frequency data update
  //           updatedItem = {
  //             ...updatedItem,
  //             frequencies: value.frequencies,
  //             standardSchedule: value.standardSchedule,
  //             frequentSchedule: value.frequentSchedule,
  //             frequencyType: value.frequencyType,
  //           };
  //         } else if (field === "form") {
  //           const formQuantity = getQuantityByForm(value);
  //           updatedItem = {
  //             ...updatedItem,
  //             // 🔑 actually update the form
  //             form: value,
  //             dispenseQuantity: formQuantity.quantity,
  //             uom: formQuantity.uom,
  //             preparationQuantity: (item.preparationQuantity || []).map(
  //               (prep) => ({
  //                 ...prep,
  //                 unit: formQuantity.uom,
  //               })
  //             ),
  //           };
  //         } else {
  //           updatedItem[field] = value;
  //         }

  //         return updatedItem;
  //       }
  //       return item;
  //     }),
  //   }));
  // };

  const addPrescriptionItem = () => {
    const newId =
      Math.max(
        ...prescriptionData.prescriptionItems.map((item) => item.id),
        0
      ) + 1;
    const labels = ["A", "B", "C", "1", "2", "3", "4"];
    const nextLabel =
      labels[prescriptionData.prescriptionItems.length % labels.length];

    const newItem = {
      id: newId,
      prescriptionType: "Only Prescription",
      medicineConsumptionType: "Sequential",
      medicineName: "",
      form: "Tablets",
      dispenseQuantity: 0,
      rawMaterials: [],
      preparationQuantity: [],
      duration: "",
      frequencies: [],
      durationRanges: [],
      selectedDurationDays: [],
      price: 0,
      medicineConsumption: "",
      customConsumption: "",
      label: nextLabel,
      additionalComments: "",
    };

    setPrescriptionData((prev) => ({
      ...prev,
      prescriptionItems: [...prev.prescriptionItems, newItem],
    }));
  };

  const removePrescriptionItem = (itemId) => {
    setPrescriptionData((prev) => {
      const updatedItems = prev.prescriptionItems.filter(
        (item) => item.id !== itemId
      );
      const totalMedicineCharges = updatedItems.reduce(
        (sum, item) => sum + item.price,
        0
      );

      return {
        ...prev,
        prescriptionItems: updatedItems,
        medicineCharges: totalMedicineCharges,
      };
    });
  };

  const openFrequencyModal = (item, rowIndex) => {
    setCurrentItemForModal(item);
    setCurrentRowIndex(rowIndex);
    setShowFrequencyModal(true);
  };

  const openDurationModal = (item, rowIndex) => {
    setCurrentItemForModal(item);
    setCurrentRowIndex(rowIndex);
    setShowDurationModal(true);
  };

  const transformFrequencyData = (frequencies) => {
    if (!frequencies || frequencies.length === 0) {
      return {
        frequencies: [],
        standardSchedule: [],
        frequentSchedule: [],
        frequencyType: "standard",
      };
    }

    const frequencyType = frequencies[0]?.frequencyType || "standard";

    if (frequencyType === "standard") {
      // Transform to backend format for standard schedule
      const standardSchedule = frequencies.map((freq) => ({
        day: freq.day,
        duration: freq.duration,
        timing: freq.timing || {
          morning: {
            food: freq.standardFrequency?.morning?.foodType || "",
            time: freq.standardFrequency?.morning?.from || "",
          },
          afternoon: {
            food: freq.standardFrequency?.afternoon?.foodType || "",
            time: freq.standardFrequency?.afternoon?.from || "",
          },
          evening: {
            food: freq.standardFrequency?.evening?.foodType || "",
            time: freq.standardFrequency?.evening?.from || "",
          },
          night: {
            food: freq.standardFrequency?.night?.foodType || "",
            time: freq.standardFrequency?.night?.from || "",
          },
        },
      }));

      return {
        frequencies: frequencies,
        standardSchedule: standardSchedule,
        frequentSchedule: [],
        frequencyType: "standard",
      };
    } else {
      // Transform to backend format for frequent schedule
      const frequentSchedule = frequencies.map((freq) => ({
        day: freq.day,
        frequency:
          freq.frequency ||
          `${freq.frequentFrequency?.hours || 0}hr ${
            freq.frequentFrequency?.minutes || 0
          }mins`,
      }));

      return {
        frequencies: frequencies,
        standardSchedule: [],
        frequentSchedule: frequentSchedule,
        frequencyType: "frequent",
      };
    }
  };

  const saveFrequency = (frequencies) => {
    if (currentItemForModal) {
      console.log("Saving frequencies:", frequencies); // Debug log

      // Transform frequencies to proper backend format
      const transformedData = transformFrequencyData(frequencies);

      console.log("Transformed data:", transformedData); // Debug log

      // Update multiple fields at once
      updatePrescriptionItem(
        currentItemForModal.id,
        "frequencyData",
        transformedData
      );
    }
    setShowFrequencyModal(false);
    setCurrentItemForModal(null);
  };

const saveDuration = (durationRanges, summary, gapRanges = [], updatedCourseDays) => {
  if (currentItemForModal && currentRowIndex !== null) {
    // Extract selected days from ranges
    const selectedDurationDays = [];
    durationRanges.forEach((range) => {
      if (range.startDay && range.endDay) {
        for (let day = range.startDay; day <= range.endDay; day++) {
          if (!selectedDurationDays.includes(day)) {
            selectedDurationDays.push(day);
          }
        }
      }
    });

    // Update specific item in prescription data
    setPrescriptionData((prev) => ({
      ...prev,
      medicineCourse: updatedCourseDays || prev.medicineCourse, // Update course days if provided
      prescriptionItems: prev.prescriptionItems.map((item, index) => {
        if (index === currentRowIndex) {
          return {
            ...item,
            durationRanges,
            duration: summary || item.duration,
            selectedDurationDays: selectedDurationDays.sort((a, b) => a - b),
            gapRanges: gapRanges || [], // Store gap ranges for this medicine
          };
        }
        return item;
      }),
    }));

    // Update global allDurationRanges
    setAllDurationRanges((prev) => {
      const updated = [...prev];
      // Ensure the array is long enough
      while (updated.length <= currentRowIndex) {
        updated.push([]);
      }
      updated[currentRowIndex] = durationRanges;
      return updated;
    });

    // Update global allGapRanges
    setAllGapRanges((prev) => {
      const updated = [...prev];
      // Ensure the array is long enough
      while (updated.length <= currentRowIndex) {
        updated.push([]);
      }
      updated[currentRowIndex] = gapRanges || [];
      return updated;
    });
  }

  // Close modal
  setShowDurationModal(false);
  setCurrentItemForModal(null);
  setCurrentRowIndex(null);
};

  const handleCreateNewPrescription = () => {
    setShowPrescriptionTable(false);
    setSelectedPrescriptionId(null);
    setPrescriptionData((prev) => ({
      ...prev,
      parentPrescriptionId: null,
    }));
  };

  const handleAddToPrescription = (prescriptionId) => {
    setSelectedPrescriptionId(prescriptionId);
    setShowPrescriptionTable(false);
    setPrescriptionData((prev) => ({
      ...prev,
      parentPrescriptionId: prescriptionId,
    }));
  };

const prepareDataForBackend = (prescriptionData) => {
  const backendData = {
    ...prescriptionData,
    prescriptionItems: prescriptionData.prescriptionItems.map((item) => ({
      medicineName: item.medicineName || "",
      rawMaterials: (item.rawMaterialsDetails || []).map((rm) => ({
        _id: rm._id,
        name: rm.name,
        quantity: rm.quantity || 0,
        pricePerUnit: rm.pricePerUnit || 0,
        totalPrice: rm.totalPrice || 0,
      })),
      form: item.form || "Tablets",
      dispenseQuantity: item.dispenseQuantity || "",
      duration: item.duration || "",
      uom: item.uom || "Pieces",
      price: item.price || 0,
      additionalComments: item.additionalComments || "",
      frequencyType: item.frequencyType || "standard",
      standardSchedule:
        item.frequencyType === "standard" || item.frequencyType === "Standard"
          ? item.standardSchedule || []
          : [],
      frequentSchedule:
        item.frequencyType === "frequent" || item.frequencyType === "Frequent"
          ? item.frequentSchedule || []
          : [],
      prescriptionType: item.prescriptionType || "Only Prescription",
      consumptionType: item.consumptionType || "Sequential",
      label: item.label || "A",
      durationRanges: item.durationRanges || [], // Include duration ranges
      gapRanges: item.gapRanges || [], // Include gap ranges
      selectedDurationDays: item.selectedDurationDays || [], // Include selected days
    })),
  };

  console.log("Backend data prepared:", backendData);
  return backendData;
};

  const handleSavePrescription = async () => {
    try {
      setSaving(true);

      if (!prescriptionData.prescriptionItems.length) {
        toast.error("Please add at least one prescription item");
        return;
      }

      const validationErrors = [];
      prescriptionData.prescriptionItems.forEach((item, index) => {
        if (!item.medicineName?.trim()) {
          validationErrors.push(
            `Medicine name is required for item ${index + 1}`
          );
        }
        if (!item.duration?.trim()) {
          validationErrors.push(`Duration is required for item ${index + 1}`);
        }
        if (!item.frequencies || item.frequencies.length === 0) {
          validationErrors.push(
            `Frequency configuration is required for item ${index + 1}`
          );
        }
      });

      if (validationErrors.length > 0) {
        toast.error(
          `Please fix the following:\n${validationErrors.join("\n")}`
        );
        return;
      }

      const authAxios = createAuthAxios();

      // ✅ Use reusable data preparation function
      const apiData = prepareDataForBackend(prescriptionData);

      const response = await authAxios.post(
        `${API_URL}/api/prescriptionControl/create`,
        apiData
      );

      if (response.data.success) {
        toast.success("Prescription saved successfully!");
        clearDraft();
        navigate("/doctor-dashboard");
      } else {
        toast.error(response.data.message || "Failed to save prescription");
      }
    } catch (err) {
      console.error("Error saving prescription:", err);
      if (err.response) {
        toast.error(
          err.response.data?.message || `Server Error: ${err.response.status}`
        );
      } else if (err.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(err.message || "An unexpected error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  // OPTIONAL: Helper function to validate frequency data structure
  const validateFrequencyData = (frequencies, frequencyType) => {
    if (!frequencies || frequencies.length === 0) {
      return false;
    }

    const isStandard =
      frequencyType === "standard" || frequencyType === "Standard";

    return frequencies.every((freq) => {
      if (isStandard) {
        // Validate standard frequency structure
        const standardFreq = freq.standardFrequency;
        return (
          standardFreq &&
          (standardFreq.morning ||
            standardFreq.afternoon ||
            standardFreq.evening ||
            standardFreq.night)
        );
      } else {
        // Validate frequent frequency structure
        const frequentFreq = freq.frequentFrequency;
        return (
          frequentFreq &&
          ((frequentFreq.hours && frequentFreq.hours > 0) ||
            (frequentFreq.minutes && frequentFreq.minutes > 0))
        );
      }
    });
  };

  // OPTIONAL: Enhanced validation function
  const validatePrescriptionData = (prescriptionData) => {
    const errors = [];

    if (!prescriptionData.patientId) {
      errors.push("Patient ID is required");
    }

    if (!prescriptionData.prescriptionItems.length) {
      errors.push("At least one prescription item is required");
    }

    prescriptionData.prescriptionItems.forEach((item, index) => {
      const itemNum = index + 1;

      if (!item.medicineName?.trim()) {
        errors.push(`Medicine name is required for item ${itemNum}`);
      }

      if (!item.duration?.trim()) {
        errors.push(`Duration is required for item ${itemNum}`);
      }

      if (!item.frequencies || item.frequencies.length === 0) {
        errors.push(`Frequency configuration is required for item ${itemNum}`);
      } else if (!validateFrequencyData(item.frequencies, item.frequencyType)) {
        errors.push(`Invalid frequency configuration for item ${itemNum}`);
      }

      if (item.price && isNaN(parseFloat(item.price))) {
        errors.push(`Invalid price for item ${itemNum}`);
      }
    });

    return errors;
  };

  const filteredRawMaterials = rawMaterials.filter((material) =>
    material.name.toLowerCase().includes(searchRawTerm.toLowerCase())
  );

  const getSelectedDaysFromDurationRanges = (durationRanges) => {
    const selectedDays = [];
    if (durationRanges && durationRanges.length > 0) {
      durationRanges.forEach((range) => {
        for (let day = range.startDay; day <= range.endDay; day++) {
          if (!selectedDays.includes(day)) {
            selectedDays.push(day);
          }
        }
      });
    }
    return selectedDays.sort((a, b) => a - b);
  };

  const getFieldVisibility = (prescriptionType) => {
    const fieldConfig = {
      prescriptionType: true, // Always visible
      medicineConsumptionType: false,
      medicineName: true, // Always visible
      medicineForm: true, // Always visible
      dispenseQuantity: true, // Always visible
      rawMaterial: false,
      preparationQuantity: false,
      duration: false,
      frequency: false, // Always visible
      medicineConsumption: false,
      label: false,
      additionalComments: true, // Always visible
      actions: true, // Always visible
    };

    switch (prescriptionType) {
      case "Prescription + Medicine":
      case "Prescription + Medicine kit":
        return {
          ...fieldConfig,
          medicineConsumptionType: true,
          rawMaterial: true,
          preparationQuantity: true,
          duration: true,
          frequency: true,
          price: true,
          medicineConsumption: true,
          label: true,
        };

      case "Only Prescription":
        return {
          ...fieldConfig,
          medicineConsumptionType: true,
          duration: true,
          frequency: true,
          medicineConsumption: true,
          label: true,
        };

      case "SOS Medicine":
        return {
          ...fieldConfig,
          rawMaterial: true,
          // medicineConsumptionType: true,
          price: true,
          medicineConsumption: true,
        };
      case "Only Medicine":
      case "Medicine + Kit":
        return {
          ...fieldConfig,
          rawMaterial: true,
          price: true,
          preparationQuantity: true,
        };

      default:
        return fieldConfig;
    }
  };

  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState("");

  const handleAddMedicine = async () => {
    if (!newMedicineName.trim()) return alert("Medicine name cannot be empty.");

    const authAxios = createAuthAxios();
    try {
      const response = await authAxios.post(
        `${API_URL}/api/prescriptionControl/medicines`,
        { name: newMedicineName.trim() }
      );

      if (response.status === 201) {
        alert("Medicine added successfully!");
        setShowAddMedicineModal(false);
        setNewMedicineName("");
        fetchData(); // Refresh list
      }
    } catch (error) {
      if (error.response?.status === 409) {
        alert("This medicine already exists.");
      } else {
        console.error("Error adding medicine", error);
        alert("Failed to add medicine");
      }
    }
  };

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedCommentPrescriptionId, setSelectedCommentPrescriptionId] =
    useState(null);
  const [closeComment, setCloseComment] = useState("");

  const handleOpenCloseModal = (prescriptionId) => {
    setSelectedPrescriptionId(prescriptionId);
    setCloseComment("");
    setShowCloseModal(true);
  };

  const handleConfirmCloseStatus = async () => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.patch(
        `${API_URL}/api/prescriptionControl/${selectedPrescriptionId}/closeComment`,
        {
          status: "Close",
          closeComment: closeComment,
        }
      );

      if (response.data.success) {
        toast.success("Prescription marked as closed!");

        // ✅ Update the prescription in the existingPrescriptions list
        setExistingPrescriptions((prev) =>
          prev.map((p) =>
            p._id === selectedPrescriptionId ? response.data.data : p
          )
        );

        setShowCloseModal(false);
      } else {
        toast.error(response.data.message || "Failed to update status.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("An error occurred while updating the status.");
    }
  };

  const handleUpdateActionStatus = async (
    prescriptionId,
    status = "In Progress"
  ) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.patch(
        `${API_URL}/api/prescriptionControl/${prescriptionId}/closeComment`,
        {
          status: status,
          closeComment: "", // Empty since it's a reopen
        }
      );

      if (response.data.success) {
        toast.success(`Prescription marked as ${status}`);
        // ✅ Update UI with new data
        setExistingPrescriptions((prev) =>
          prev.map((p) => (p._id === prescriptionId ? response.data.data : p))
        );
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating action status:", err);
      toast.error("An error occurred while updating the status");
    }
  };

  const updateMedicineCourse = (newCourseDays) => {
  setPrescriptionData(prev => ({
    ...prev,
    medicineCourse: Math.max(prev.medicineCourse, newCourseDays)
  }));
};

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
        <span className="ml-2 text-lg">Loading prescription data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
          <p className="text-lg text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-9xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={1000} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/doctor-dashboard")}
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <IoIosArrowBack className="text-xl mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Prescription for {patientData?.name || "Patient"}
          </h1>
        </div>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium">Patient Name:</span>{" "}
            {patientData?.name}
          </div>
          <div>
            <span className="font-medium">Age:</span> {patientData?.age}
          </div>
          <div>
            <span className="font-medium">Phone:</span> {patientData?.phone}
          </div>
        </div>
      </div>

      {/* Existing Prescriptions Table */}
      {showPrescriptionTable && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Existing Prescriptions</h2>
            <button
              onClick={handleCreateNewPrescription}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create New Prescription
            </button>
          </div>

          {existingPrescriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Date
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Consulting Type
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Consulting For
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Medicine Course
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Action Status
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {existingPrescriptions.map((prescription) => (
                    <tr key={prescription._id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {/* {prescription.consultingType || "N/A"} */}
                        {patientData?.medicalDetails?.diseaseType?.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {/* {prescription.consultingFor || "N/A"} */}
                        {patientData?.medicalDetails?.drafts}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {prescription.medicineCourse} days
                      </td>

                      <div>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {prescription.action?.status === "In Progress" ? (
                            <button
                              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                              onClick={() =>
                                handleOpenCloseModal(prescription._id)
                              }
                            >
                              Mark as Closed
                            </button>
                          ) : (
                            <button
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                              // onClick={() => handleUpdateActionStatus(prescription._id, "In Progress")}
                            >
                              Closed
                            </button>
                          )}
                        </td>
                      </div>
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          onClick={() =>
                            handleAddToPrescription(prescription._id)
                          }
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Add Prescription
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {showCloseModal && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                      <h2 className="text-lg font-semibold mb-4">
                        Add Close Comment
                      </h2>
                      <textarea
                        rows="4"
                        className="w-full p-2 border rounded mb-4"
                        placeholder="Enter reason or notes for closing..."
                        value={closeComment}
                        onChange={(e) => setCloseComment(e.target.value)}
                      />
                      <div className="flex justify-end gap-3">
                        <button
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                          onClick={() => setShowCloseModal(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          onClick={handleConfirmCloseStatus}
                        >
                          Confirm Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No existing prescriptions found for this patient.</p>
              <button
                onClick={handleCreateNewPrescription}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create First Prescription
              </button>
            </div>
          )}
        </div>
      )}

      {showAddMedicineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Add New Medicine</h2>
            <input
              type="text"
              value={newMedicineName}
              onChange={(e) => setNewMedicineName(e.target.value)}
              placeholder="Enter medicine name"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddMedicineModal(false)}
                className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMedicine}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Prescription Form */}
      {!showPrescriptionTable && (
        <div className="space-y-6">
          {/* Prescription Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Prescription Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-3.5">
                  Consulting Type:
                </label>
                <p>{patientData?.medicalDetails?.diseaseType?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3.5">
                  Consulting For
                </label>
                <p>{patientData?.medicalDetails?.drafts}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3.5">
                  Medicine Course (Days)
                </label>
                <input
                  type="number"
                  value={prescriptionData.medicineCourse}
                  onChange={(e) =>
                    setPrescriptionData((prev) => ({
                      ...prev,
                      medicineCourse: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3.5">
                  Action
                </label>

                <p>In progress</p>
              </div>
            </div>
          </div>

          {/* Prescription Items Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
  <div>
    <h2 className="text-2xl font-bold text-gray-800">
      Prescription Items
    </h2>
    <p className="text-sm text-gray-600 mt-1">
      Manage medicines and prescriptions
    </p>
  </div>

  <div className="flex gap-3">
    <button
      onClick={addPrescriptionItem}
      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
    >
      <IoIosAdd className="text-lg" />
      Add Medicine
    </button>

    <button
      onClick={resetPrescriptionData}
      className="flex items-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow hover:shadow-lg"
    >
      🗑️ Clear All
    </button>
  </div>
</div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      S.No
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Prescription Type
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Medicine Consumption Type
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Medicine Name
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Medicine Form
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Dispense Quantity
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Raw Material
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Preparation + Quantity
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Duration
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Frequency
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Price
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Medicine Consumption
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Label
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Additional Comments
                    </th>
                    <th className="border-b border-gray-200 px-4 py-4 text-sm font-semibold text-gray-700 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {prescriptionData.prescriptionItems.map((item, index) => {
                    const fieldVisibility = getFieldVisibility(
                      item.prescriptionType
                    );

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50 transition-colors duration-150"
                      >
                        {/* S.No */}
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {index + 1}
                          </span>
                        </td>

                        {/* Prescription Type */}
                        <td className="px-4 py-4 min-w-48">
                          <select
                            value={item.prescriptionType}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                item.id,
                                "prescriptionType",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                          >
                            <option value="Only Prescription">
                              Only Prescription
                            </option>
                            <option value="Prescription + Medicine">
                              Prescription + Medicine
                            </option>
                            <option value="Medicine + Kit">
                              Medicine + Kit
                            </option>
                            <option value="Only Medicine">Only Medicine</option>
                            <option value="Prescription + Medicine kit">
                              Prescription + Medicine kit
                            </option>
                            <option value="SOS Medicine">SOS Medicine</option>
                          </select>
                        </td>

                        {/* Medicine Consumption Type */}
                        <td
                          className={`px-4 py-4 min-w-44 ${
                            !fieldVisibility.medicineConsumptionType
                              ? "opacity-30 pointer-events-none"
                              : ""
                          }`}
                        >
                          <select
                            value={item.medicineConsumptionType}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                item.id,
                                "medicineConsumptionType",
                                e.target.value
                              )
                            }
                            disabled={!fieldVisibility.medicineConsumptionType}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="Sequential">Sequential</option>
                            <option value="Sequential + Gap">Sequential + Gap</option>
                            <option value="Parallel">Parallel</option>
                            <option value="Parallel">Parallel + Gap</option>
                          </select>
                        </td>

                        {/* Medicine Name */}
                        <td className="px-4 py-4 min-w-44">
                          <div className="flex items-center space-x-2">
                            <select
                              value={item.medicineName}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  item.id,
                                  "medicineName",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                            >
                              <option value="">Select medicine</option>
                              {medicines.map((med) => (
                                <option key={med._id} value={med.name}>
                                  {med.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setShowAddMedicineModal(true)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Add new medicine"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        </td>

                        {/* Medicine Form */}
                        <td className="px-4 py-4 min-w-36">
                          <select
                            value={item.form}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                item.id,
                                "form",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                          >
                            <option value="Tablets">Tablets</option>
                            <option value="Pills">Pills</option>
                            <option value="Liquid form">Liquid form</option>
                            <option value="Individual Medicine">
                              Individual Medicine
                            </option>
                          </select>
                        </td>

                        {/* Dispense Quantity */}
                        <td className="px-4 py-4 min-w-32">
                          {item.form === "Liquid form" ? (
                            <select
                              value={item.dispenseQuantity}
                              onChange={(e) => {
                                updatePrescriptionItem(
                                  item.id,
                                  "dispenseQuantity",
                                  e.target.value
                                );
                              }}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                            >
                              <option value="">Select quantity</option>
                              <option value="5ml">5ml</option>
                              <option value="15ml">15ml</option>
                              <option value="30ml">30ml</option>
                            </select>
                          ) : item.form === "Pills" ? (
                            <select
                              value={item.dispenseQuantity}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  item.id,
                                  "dispenseQuantity",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                            >
                              <option value="">Select quantity</option>
                              <option value="1/2 dram">1/2 dram</option>
                              <option value="1 dram">1 dram</option>
                              <option value="2 dram">2 dram</option>
                            </select>
                          ) : item.form === "Tablets" ? (
                            <select
                              value={item.dispenseQuantity}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  item.id,
                                  "dispenseQuantity",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                            >
                              <option value="">Select quantity</option>
                              <option value="10gram">10gram</option>
                              <option value="20gram">20gram</option>
                              <option value="25gram">25gram</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={item.dispenseQuantity}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  item.id,
                                  "dispenseQuantity",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
                              placeholder="Enter quantity"
                            />
                          )}
                        </td>

                        {/* Raw Material */}
                        <td
                          className={`px-4 py-4 min-w-44 ${
                            !fieldVisibility.rawMaterial
                              ? "opacity-30 pointer-events-none"
                              : ""
                          }`}
                        >
                          <div className="relative">
                            <button
                              type="button"
                              disabled={!fieldVisibility.rawMaterial}
                              onClick={() => {
                                if (fieldVisibility.rawMaterial) {
                                  const dropdown = document.getElementById(
                                    `raw-material-dropdown-${item.id}`
                                  );
                                  dropdown.style.display =
                                    dropdown.style.display === "block"
                                      ? "none"
                                      : "block";
                                }
                              }}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-left bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <span>
                                Raw Materials ({item.rawMaterials.length})
                              </span>
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 9l-7 7-7-7"
                                ></path>
                              </svg>
                            </button>
                            {fieldVisibility.rawMaterial && (
                              <div
                                id={`raw-material-dropdown-${item.id}`}
                                className="absolute z-10 w-72 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 max-h-48 overflow-y-auto hidden"
                              >
                                <div className="p-3 border-b border-gray-100">
                                  <input
                                    type="text"
                                    placeholder="Search raw materials..."
                                    value={searchRawTerm}
                                    onChange={(e) =>
                                      setSearchRawTerm(e.target.value)
                                    }
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="max-h-36 overflow-y-auto">
                                  <div className="grid grid-cols-2 text-sm font-semibold text-gray-600 px-3 py-2 border-b bg-gray-100">
                                    <span>Material Name</span>
                                    <span>Quantity</span>
                                  </div>

                                  {filteredRawMaterials.map((material) => (
                                    <div
                                      key={material._id}
                                      className="grid grid-cols-2 px-3 py-2 hover:bg-blue-50 transition-colors items-center"
                                    >
                                      <label className="flex items-center text-sm cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={item.rawMaterials.some(
                                            (rm) => rm._id === material._id
                                          )}
                                          onChange={(e) =>
                                            handleRawMaterialSelection(
                                              item.id,
                                              material._id,
                                              e.target.checked
                                            )
                                          }
                                          className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">
                                          {material.name}
                                        </span>
                                      </label>
                                      <span className="text-sm text-gray-800">
                                        {material.currentQuantity ?? 0}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Preparation + Quantity */}
                        <td
                          className={`px-4 py-4 min-w-52 ${
                            !fieldVisibility.preparationQuantity
                              ? "opacity-30 pointer-events-none"
                              : ""
                          }`}
                        >
                          <div className="space-y-2">
                            {item.preparationQuantity.map((prep) => (
                              <div
                                key={prep._id}
                                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100"
                              >
                                <span className="text-sm text-gray-700 flex-1 truncate">
                                  {prep.name}
                                </span>
                                <input
                                  type="number"
                                  value={
                                    prep.name
                                      .toLowerCase()
                                      .includes("distilled water")
                                      ? dropsToMl(prep.quantity).toFixed(1)
                                      : prep.quantity
                                  }
                                  onChange={(e) => {
                                    updatePreparationQuantity(
                                      item.id,
                                      prep._id,
                                      e.target.value
                                    );
                                  }}
                                  disabled={
                                    !fieldVisibility.preparationQuantity ||
                                    (item.form === "Liquid form" &&
                                      prep.name
                                        .toLowerCase()
                                        .includes("distilled water"))
                                  }
                                  className="w-20 border border-gray-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  min="0"
                                  step="0.1"
                                />

                                <span className="text-sm text-gray-500">
                                  {prep.name
                                    .toLowerCase()
                                    .includes("distilled water")
                                    ? "ml"
                                    : prep.unit === "ml"
                                    ? "drops"
                                    : prep.unit}
                                </span>
                                {item.form === "Liquid form" &&
                                  prep.name
                                    .toLowerCase()
                                    .includes("distilled water") && (
                                    <span className="text-xs text-blue-600 ml-2">
                                      (Auto)
                                    </span>
                                  )}
                              </div>
                            ))}
                            {item.preparationQuantity.length === 0 && (
                              <div className="p-3 text-center">
                                <span className="text-sm text-gray-400">
                                  No materials selected
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Duration */}
                        <td
                          className={`px-4 py-4 min-w-32 ${
                            !fieldVisibility.duration
                              ? "opacity-30 pointer-events-none"
                              : ""
                          }`}
                        >
                          <button
                            type="button"
                            disabled={!fieldVisibility.duration}
                            onClick={() =>
                              fieldVisibility.duration &&
                              openDurationModal(item, index)
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 hover:border-gray-300 text-left transition-all duration-200 flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <span className="text-gray-700">
                              {item.duration && item.duration !== "undefined"
                                ? item.duration
                                : "Set Duration"}
                            </span>
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                              />
                            </svg>
                          </button>
                        </td>

                        {/* Frequency */}
                        <td
                          className={`px-4 py-4 min-w-32 ${
                            !fieldVisibility.frequency
                              ? "opacity-30 pointer-events-none"
                              : ""
                          }`}
                        >
                          <div className="space-y-2">
                            {/* Frequency Type Selector */}
                            <select
                              value={item.frequencyType || "standard"}
                              onChange={(e) =>
                                updatePrescriptionItem(
                                  item.id,
                                  "frequencyType",
                                  e.target.value
                                )
                              }
                              disabled={!fieldVisibility.frequency}
                              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <option value="standard">
                                Standard (4 times/day)
                              </option>
                              <option value="frequent">
                                Frequent Interval
                              </option>
                            </select>

                            {/* Frequency Config Button */}
                            <button
                              type="button"
                              disabled={!fieldVisibility.frequency}
                              onClick={() =>
                                fieldVisibility.frequency &&
                                openFrequencyModal(item, index)
                              }
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 hover:border-gray-300 text-left transition-all duration-200 flex items-center justify-between disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                              <span className="text-gray-700">
                                {item.frequencies.length > 0
                                  ? `${item.frequencies.length} frequencies`
                                  : "Set Frequency"}
                              </span>
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4 text-center min-w-24">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                            ₹{item.price.toFixed(2)}
                          </span>
                        </td>

                        {/* Medicine Consumption */}
                        <td className={`px-4 py-4 min-w-64 ${!fieldVisibility.medicineConsumption ? "opacity-30 pointer-events-none" : ""}`}>
  <MedicineConsumptionSelector
    form={item.form}
    value={item.medicineConsumption}
    customValue={item.customConsumption}
    onChange={(val) =>
      updatePrescriptionItem(item.id, "medicineConsumption", val)
    }
    onCustomChange={(val) =>
      updatePrescriptionItem(item.id, "customConsumption", val)
    }
    disabled={!fieldVisibility.medicineConsumption}
    itemId={item.id}
  />
</td>


                        <LabelDropdown
                          item={item}
                          updatePrescriptionItem={updatePrescriptionItem}
                          fieldVisibility={fieldVisibility}
                        />

                        {/* Additional Comments */}
                        <td className="px-4 py-4 min-w-48">
                          <textarea
                            value={item.additionalComments}
                            onChange={(e) =>
                              updatePrescriptionItem(
                                item.id,
                                "additionalComments",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white hover:border-gray-300 transition-colors"
                            rows="2"
                            placeholder="Additional notes..."
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-center">
                          {prescriptionData.prescriptionItems.length > 1 && (
                            <button
                              onClick={() => removePrescriptionItem(item.id)}
                              className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                              title="Remove item"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Prescription Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Medicine Charges
                </label>
                <input
                  type="number"
                  value={prescriptionData.medicineCharges}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Shipping Charges
                </label>
                <input
                  type="number"
                  value={prescriptionData.shippingCharges}
                  onChange={(e) =>
                    setPrescriptionData((prev) => ({
                      ...prev,
                      shippingCharges: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full border rounded px-3 py-2"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Total Amount
                </label>
                <input
                  type="number"
                  value={
                    prescriptionData.medicineCharges +
                    prescriptionData.shippingCharges
                  }
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100 font-medium"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Additional Notes
              </label>
              <textarea
                value={prescriptionData.notes}
                onChange={(e) =>
                  setPrescriptionData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className="w-full border rounded px-3 py-2"
                rows="3"
                placeholder="Enter any additional notes for the prescription..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowPrescriptionTable(true)}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Back to Prescriptions
            </button>
            <div className="space-x-4">
              <button
                onClick={() => navigate("/doctor-dashboard")}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePrescription}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Prescription"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showFrequencyModal && (
        <FrequencyModal
          isOpen={showFrequencyModal}
          onClose={() => setShowFrequencyModal(false)}
          onSave={saveFrequency}
          selectedDurationDays={
            currentItemForModal?.selectedDurationDays ||
            getSelectedDaysFromDurationRanges(
              currentItemForModal?.durationRanges
            ) ||
            []
          }
          currentFrequencies={currentItemForModal?.frequencies || []}
          frequencyType={currentItemForModal?.frequencyType || "standard"}
        />
      )}

      {/* Duration Modal */}
      {showDurationModal && currentItemForModal && (
  <DurationModal
    isOpen={showDurationModal}
    onClose={() => {
      setShowDurationModal(false);
      setCurrentItemForModal(null);
      setCurrentRowIndex(null);
    }}
    onSave={saveDuration}
    days={prescriptionData.medicineCourse}
    prescriptionItems={prescriptionData.prescriptionItems}
    rawMaterials={currentItemForModal.rawMaterials || []}
    consumptionType={
      currentItemForModal.medicineConsumptionType || "Sequential"
    }
    currentDuration={currentItemForModal.durationRanges || []}
    currentRowIndex={currentRowIndex}
    allDurationRanges={allDurationRanges}
    allGapRanges={allGapRanges} // Add this new prop
    onUpdateMedicineCourse={updateMedicineCourse} // Add this callback
    updatePrescriptionItem={updatePrescriptionItem}
    setPrescriptionData={setPrescriptionData}
    selectedMedicine={currentItemForModal}
    selectedDays={currentItemForModal.selectedDurationDays || []}
    conflictInfo={currentItemForModal.conflictInfo || null}
    clickStart={null}
  />
)}
    </div>
  );
};

export default PrescriptionWriting;
