import { useState, useEffect } from "react";

const NoteTaking = () => {
  const [notes, setNotes] = useState(localStorage.getItem("notes") || "");

  useEffect(() => {
    localStorage.setItem("notes", notes);
  }, [notes]);

  return (
    <div style={styles.popupContainer}>
      <h3 style={styles.header}>Notes</h3>
      <textarea
        style={styles.textarea}
        placeholder="Type your notes here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      ></textarea>
    </div>
  );
};

const styles = {
  popupContainer: {
    width: "100%",
    height: "100vh",
    padding: "20px",
    backgroundColor: "#fff",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },
  header: {
    fontSize: "1.5rem",
    marginBottom: "10px",
    color: "#2c3e50",
  },
  textarea: {
    width: "100%",
    height: "80vh",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px",
    fontSize: "1rem",
    resize: "none",
  },
};

export default NoteTaking;
