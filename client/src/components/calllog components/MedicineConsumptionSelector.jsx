import React, { useEffect, useState } from "react";
import config from "../../config";
const MedicineConsumptionSelector = ({
  form,
  value,
  customValue,
  onChange,
  onCustomChange,
  disabled = false,
  itemId,
}) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!form) return;
    const fetchOptions = async () => {
      try {
        const res = await fetch(`${config.API_URL}/api/consumptions/${form}`);
        const data = await res.json();
        setOptions(data.map((opt) => opt.label));
      } catch (err) {
        console.error("Failed to fetch options", err);
      }
    };
    fetchOptions();
  }, [form]);

  const handleAddCustomOption = async (label) => {
    if (!label.trim()) return;
    try {
      const res = await fetch(`${config.API_URL}/api/consumptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, label }),
      });

      if (res.ok) {
        const newOption = await res.json();
        setOptions((prev) => [...prev, newOption.label]);
        onChange(newOption.label);
      } else {
        const err = await res.json();
        console.warn("Save failed:", err.message);
      }
    } catch (err) {
      console.error("Error saving custom option:", err);
    }
  };

  return (
    <div className="space-y-2">
      {form === "Individual Medicine" ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter consumption instructions"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">Select</option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
          <option value="Add another">Add another</option>
        </select>
      )}

      {value === "Add another" && (
        <>
          <input
            type="text"
            list={`custom-suggestions-${itemId}`}
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            onBlur={(e) => handleAddCustomOption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddCustomOption(e.target.value);
              }
            }}
            placeholder="Enter custom instruction"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500"
          />
          <datalist id={`custom-suggestions-${itemId}`}>
            {options.map((opt, idx) => (
              <option key={idx} value={opt} />
            ))}
          </datalist>
        </>
      )}
    </div>
  );
};

export default MedicineConsumptionSelector;
