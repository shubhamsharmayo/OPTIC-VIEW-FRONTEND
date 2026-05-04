import React, { useContext, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { IoMdTrash } from "react-icons/io";
import classes from "./RightSideBar.module.css";
import DataContext from "store/DataContext";

const RightSideBar = ({
  isOpen,
  onClose,
  selectedWindow,
  setCurrentLinkField,
  currentLinkField,
}) => {
  const [fields, setFields] = useState([]);
  const dataCtx = useContext(DataContext);
  useEffect(() => {
    if (selectedWindow.length > 0) {
      setFields(selectedWindow);
    } else {
      setFields([]);
    }
  }, [selectedWindow]);

  const toggleSidebar = () => {
    setCurrentLinkField(null)
    onClose(!isOpen);
  };

  const deleteHandler = (index) => {
    const result = window.confirm(
      "Are you sure you want to delete this field? This action cannot be undone."
    );
    if (!result) return;
    dataCtx.deleteLinkField(index);
  };
  const rowClickHandler = (index) => {
    setCurrentLinkField(index);
  };
  const allFields = fields.map((field, index) => {
    const backgroundColor =
      currentLinkField === index
        ? classes["sidebar-list-active"]
        : classes["sidebar-list"];

    return (
      <li
        key={index}
        className={backgroundColor}
        style={{
          display: "grid",
          gridTemplateColumns: "10% 60% 40%", // Improved proportions
          gap: "10px",
          borderBottom: "1px solid #ddd",
          alignItems: "center", // Vertical alignment for consistent layout
        }}
        onClick={() => rowClickHandler(index)}
      >
        <span style={{ color: "#000", fontWeight: "bold" }}>{index + 1})</span>

        <a
          style={{
            color: "#000",
            textDecoration: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={field.fieldName} // Tooltip for full text visibility
        >
          {field.fieldName}
        </a>

        <span
          className="mx-2 text-dark"
          title="Delete"
          style={{ cursor: "pointer" }}
          onClick={() => deleteHandler(index)}
        >
          <IoMdTrash color="black" />
        </span>
      </li>
    );
  });
  return (
    <div
      className={`${classes.sidebar} ${isOpen ? classes.active : ""}`}
      style={{
        backdropFilter: "blur(20px)",
        color: "#007bff",
        padding: "15px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "12px ",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <span className={classes["close-btn"]} onClick={toggleSidebar}>
        <FiX size={24} color="#ff0000" />
      </span>

      <h4
        className="text-center"
        style={{ color: "#007bff", marginBottom: "10px", marginTop: "30px" }}
      >
        Linked Fields
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

export default RightSideBar;
