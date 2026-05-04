import React, { useEffect, useState } from "react";

import "./Sidebar.css"; // Custom CSS for sidebar styling
import { FiX } from "react-icons/fi";
const SideBar = ({ isOpen, onClose, selectedWindow }) => {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    if (selectedWindow.length > 0) {
      setFields(selectedWindow);
    }
  }, [selectedWindow]);
  const toggleSidebar = () => {
    onClose(!isOpen);
  };

  const allFields = fields.map((field, index) => (
    <li
      key={index}
      style={{
        display: "grid",
        gridTemplateColumns: "10% 40% 40%", // Improved proportions
        gap: "10px",
        padding: "8px 0",
        borderBottom: "1px solid #ddd",
        alignItems: "center", // Vertical alignment for consistent layout
      }}
    >
      <span style={{ color: "#000", fontWeight: "bold" }}>{index + 1})</span>
  
      <a
        href="#"
        style={{
          color: "#000",
          textDecoration: "none",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={field.name} // Tooltip for full text visibility
      >
        {field.name}
      </a>
  
      <span style={{ color: "#000" }}>{field.fieldType}</span>
    </li>
  ));
  

  return (
    <div
    className={`sidebar ${isOpen ? "active" : ""}`}
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(10px)",
      color: "#007bff",
      padding: "15px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column", // Enables better layout control
      height: "100vh", // Full viewport height
    }}
  >
    <span className="close-btn" onClick={toggleSidebar}>
      <FiX size={24} color="#ff0000" />
    </span>
  
    <h4
      className="text-center"
      style={{ color: "#007bff", marginBottom: "10px", marginTop: "30px" }}
    >
      Selected Window List
    </h4>
  
    <ul
      className="list-unstyled p-3"
      style={{
        margin: 0,
        overflowY: "auto", // Scroll only inside the list
        flex: 1, // Ensures the list takes up remaining space
        scrollbarWidth: "thin", // Firefox - Thin scrollbar
        scrollbarColor: "rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0)", // Firefox - Hidden by default
        msOverflowStyle: "none",
      }}
    >
      {allFields}
    </ul>
  </div>
  
  );
};

export default SideBar;
