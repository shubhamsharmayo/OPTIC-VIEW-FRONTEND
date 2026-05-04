import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
} from "reactstrap";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import IconButton from "@mui/material/IconButton";

// Helper to map index to group
const getFieldGroups = (linkedFields) => {
  const indexToGroupMap = {};
  linkedFields.forEach((field, idx) => {
    field.fieldIndexes.forEach((fieldIdx) => {
      indexToGroupMap[fieldIdx] = idx;
    });
  });
  return indexToGroupMap;
};

// Sample colors for group highlighting
const groupColors = [
  "#e6f7ff", // Light blue
  "#fffbe6", // Light yellow
  "#f9f0ff", // Light purple
  "#f6ffed", // Light green
];

const TableRow = ({
  type,
  fieldData,
  selectedItems,
  handleSort = () => {},
  editHandler = () => {},
  deleteHander = () => {},
  handleCheckboxChange,
  serialOffset = 0,
  linkedFields,
}) => {
  const [direction, setDirection] = useState(null);
  const [fields, setFields] = useState(fieldData);
  const [animatingIndex, setAnimatingIndex] = useState(null);

  const indexToGroupMap = useMemo(
    () => getFieldGroups(linkedFields),
    [linkedFields]
  );

  useEffect(() => {
    setFields(fieldData);
  }, [fieldData]);

  useEffect(() => {
    if (typeof handleSort === "function") {
      handleSort(type, fields);
    }
  }, [fields, handleSort]);

  const resetAnimation = () => {
    setAnimatingIndex(null);
    setDirection(null);
  };

  const moveUp = (index) => {
    const currentGroup = indexToGroupMap[index];
    const aboveGroup = indexToGroupMap[index - 1];

    if (index > 0 && currentGroup === aboveGroup) {
      setAnimatingIndex(index);
      setDirection("up");
      setTimeout(() => {
        const newFields = [...fields];
        [newFields[index], newFields[index - 1]] = [
          newFields[index - 1],
          newFields[index],
        ];
        setFields(newFields);
        resetAnimation();
      }, 300);
    }
  };

  const moveDown = (index) => {
    const currentGroup = indexToGroupMap[index];
    const belowGroup = indexToGroupMap[index + 1];

    if (index < fields.length - 1 && currentGroup === belowGroup) {
      setAnimatingIndex(index);
      setDirection("down");
      setTimeout(() => {
        const newFields = [...fields];
        [newFields[index], newFields[index + 1]] = [
          newFields[index + 1],
          newFields[index],
        ];
        setFields(newFields);
        resetAnimation();
      }, 300);
    }
  };

  return fields?.map((item, i) => {
    const isAnimating = animatingIndex === i;
    const slno =
      serialOffset +
      (isAnimating ? (direction === "up" ? i + 1 : i - 1) : i + 1);
    const uniqueId = `${item.name}-${slno - 1}`;
    const isSelected = selectedItems.includes(uniqueId);

    const groupIndex = indexToGroupMap[i];
    const groupColor =
      groupIndex !== undefined
        ? groupColors[groupIndex % groupColors.length]
        : "transparent";

    return (
      <tr
        key={i}
        style={{
          backgroundColor: isAnimating
            ? direction === "up"
              ? "#f0f0f0"
              : "#d9d9d9"
            : groupColor,
          transition:
            "background-color 0.3s ease-in-out, transform 0.3s ease-in-out",
          transform: isAnimating
            ? direction === "up"
              ? "translateY(-50px)"
              : "translateY(50px)"
            : "none",
        }}
      >
        <td onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleCheckboxChange(uniqueId, item)}
          />
        </td>
        <td>{slno}</td>
        <td>{item.name}</td>
        <td>{item.fieldType}</td>
        <td>
          <IconButton
            onClick={() => moveUp(i)}
            aria-label="move up"
            disabled={
              indexToGroupMap[i] !== indexToGroupMap[i + 1] ||
              indexToGroupMap[i] !== indexToGroupMap[i - 1]
            }
          >
            <ArrowCircleUpIcon fontSize="inherit" />
          </IconButton>
          <IconButton
            onClick={() => moveDown(i)}
            aria-label="move down"
            disabled={
              indexToGroupMap[i] !== indexToGroupMap[i - 1] ||
              indexToGroupMap[i] !== indexToGroupMap[i + 1]
            }
          >
            <ArrowCircleDownIcon fontSize="inherit" />
          </IconButton>
        </td>
        <td>
          <UncontrolledDropdown>
            <DropdownToggle
              className="btn-icon-only"
              href="#pablo"
              role="button"
              size="sm"
              onClick={(e) => e.preventDefault()}
            >
              <i className="fas fa-ellipsis-v" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem onClick={() => editHandler(item, i)}>
                Edit
              </DropdownItem>
              <DropdownItem
                onClick={() => deleteHander(item, i)}
                style={{ color: "red" }}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </td>
      </tr>
    );
  });
};

export default React.memo(TableRow);
