import { useEffect, useState } from "react";
import axios from "axios";
import config from "../../config";
const LabelDropdown = ({ item, updatePrescriptionItem, fieldVisibility }) => {
  const [labels, setLabels] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [showInput, setShowInput] = useState(false);
  const API_URL = config.API_URL;
  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/labels`);
      setLabels(res.data);
    } catch (err) {
      console.error("Failed to fetch labels", err);
    }
  };

  const handleAddLabel = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/labels`, {
        value: newLabel,
      });
      setNewLabel("");
      setShowInput(false);
      fetchLabels();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to add label");
    }
  };

  return (
    <td
      className={`px-4 py-4 min-w-40 align-top ${
        !fieldVisibility.label ? "opacity-30 pointer-events-none" : ""
      }`}
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Label</label>
        <select
          value={item.label}
          onChange={(e) =>
            updatePrescriptionItem(item.id, "label", e.target.value)
          }
          disabled={!fieldVisibility.label}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm"
        >
          <option value="">Select</option>
          {labels.map((label) => (
            <option key={label._id} value={label.value}>
              {label.value}
            </option>
          ))}
        </select>

        {showInput ? (
          <div className="flex flex-col gap-2 mt-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new label (e.g. E or 5)"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleAddLabel}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowInput(false);
                  setNewLabel("");
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="text-blue-600 text-sm hover:underline mt-2"
          >
            + Add New Label
          </button>
        )}
      </div>
    </td>
  );
};

export default LabelDropdown;
