import React, { useContext, useEffect, useRef, useState } from "react";
import _ from "lodash";
import { toast } from "react-toastify";
import DataContext from "store/DataContext";

export default function ExcelLikeTable(props) {
  const [data, setData] = useState([[]]);
  const [fields, setFields] = useState([]);
  const [hoveredCell, setHoveredCell] = useState({ row: null, col: null });
  const [draggedCell, setDraggedCell] = useState({ row: null, col: null });
  const [dottedIndexes, setDottedIndexes] = useState([]);
  const [selectedCell, setSelectedCell] = useState([]);
  const tableWrapperRef = useRef(null);
  const cellRefs = useRef({});
  const dataCtx = useContext(DataContext);

  useEffect(() => {
    if (!selectedCell || selectedCell.length === 0) return;

    const lastCell = selectedCell[selectedCell.length - 1];
    const key = `${lastCell.row}-${lastCell.col}`;
    const cellElement = cellRefs.current[key];

    if (cellElement && tableWrapperRef.current) {
      const wrapper = tableWrapperRef.current;
      const cellRect = cellElement.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();

      // Scroll if out of view
      if (
        cellRect.top < wrapperRect.top ||
        cellRect.bottom > wrapperRect.bottom ||
        cellRect.left < wrapperRect.left ||
        cellRect.right > wrapperRect.right
      ) {
        cellElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    }
  }, [selectedCell]);


  useEffect(() => {
    const selectedFields = Array.isArray(props.selected) ? props.selected : [];
    console.log(props.selected)

    const linkFields = Array.isArray(props.linkFields) ? props.linkFields : [];

    const allFields = [...selectedFields];

    // Add form fields from linkFields
    linkFields.forEach((item) => {
      allFields.push({
        name: item.fieldName,
        fieldType: "formField",
      });
    });

    setFields(allFields);

    // Build first row
    const newRow = selectedFields.flatMap((item) => {
      switch (item.fieldType) {
        case "formField":
        case "skewField":
          return [
            {
              cellValue: item.name,
              cellType: item.fieldType,
              selectedField: item,
            },
          ];
        case "questionField":
          const [start, end] = item.name.split("-");
          const prefix = start.replace(/\d+$/, "");
          const startNum = parseInt(start.match(/\d+/)[0]);
          const endNum = parseInt(end.match(/\d+/)[0]);
          const questions = [];
          for (let i = startNum; i <= endNum; i++) {
            questions.push({
              cellValue: `${prefix}${i}`,
              cellType: item.fieldType,
              selectedField: item,
            });
          }
          return questions;
        default:
          return [
            {
              cellValue: item.name,
              cellType: item.fieldType,
              selectedField: item,
            },
          ];
      }
    });

    const desiredLength = 20;
    while (newRow.length < desiredLength) {
      newRow.push({ cellValue: "", cellType: "" });
    }

    // Build second row from linkFields
    const linkedRow = Array(desiredLength).fill({
      cellValue: "",
      cellType: "",
    });

    const allFieldIndexes = linkFields.map((item) => item.fieldIndexes).flat();
    setDottedIndexes(allFieldIndexes);

    linkFields.forEach((item) => {
      const indexes = item.fieldIndexes || [];
      const centerIndex = indexes[Math.floor(indexes.length / 2)];

      indexes.forEach((idx) => {
        linkedRow[idx] =
          idx === centerIndex
            ? {
                cellValue: item.fieldName,
                cellType: "formField",
                selectedField: {
                  name: item.fieldName,
                  fieldType: "formField",
                },
                isCenter: true,
              }
            : {
                cellValue: "",
                cellType: "formField",
                isSpanned: true,
              };
      });
    });

    setData([newRow, linkedRow]);
  }, [props.selected, props.linkFields]);

  useEffect(() => {
    if (!props.currentSelectedCoordinate) return;
   
    const coordinate = { ...props.currentSelectedCoordinate };
    const matchingCells = [];
    // delete coordinate["name"];
    // Find the matching cell in the data
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (_.isEqual(coordinate, cell.selectedField)) {
         
          matchingCells.push({ row: rowIndex, col: colIndex });
        }
      });
    });
    setSelectedCell(matchingCells);
  }, [props.currentSelectedCoordinate, data]);



  const handleFieldClick = (item, colIndex, rowIndex) => {
    const matchedField = findFieldDetailsUsingObj(item.selectedField);

    if (matchedField) {
      setSelectedCell([{ row: rowIndex, col: colIndex }]);

      const indexOfField = fields.findIndex((field) =>
        _.isEqual(field, matchedField)
      );
      props.handleEyeClick(matchedField, indexOfField);
    } else {
      toast.warning("Selected field not found");
    }
  };
  const findFieldDetailsUsingObj = (selectedField) => {
    return fields.find((field) => _.isEqual(field, selectedField)) || null;
  };
  const findFieldDetails = (cellValue) => {
    for (const field of fields) {
      // Assume fieldData is the first array you provided
      if (field.fieldType === "formField") {
        if (field.name === cellValue) {
          return field; // Direct match
        }
      } else if (field.fieldType === "questionField") {
        const [start, end] = field.name.split("-");
        const prefix = start.replace(/\d+$/, "");
        const startNum = parseInt(start.match(/\d+/)[0]);
        const endNum = parseInt(end.match(/\d+/)[0]);

        // Generate all names in range
        const generatedQuestions = [];
        for (let i = startNum; i <= endNum; i++) {
          generatedQuestions.push(`${prefix}${i}`);
        }

        if (generatedQuestions.includes(cellValue)) {
          return field; // Found in generated range
        }
      }
    }

    return null; // No match found
  };
  const handleSingleClick = (item, colIndex, rowIndex) => {
    setSelectedCell([{ row: rowIndex, col: colIndex }]); // ✅ Wrap in array
 const matchedField = findFieldDetailsUsingObj(item.selectedField);
 
    if (matchedField) {
      setSelectedCell([{ row: rowIndex, col: colIndex }]);

      const indexOfField = fields.findIndex((field) =>
        _.isEqual(field, matchedField)
      );
      props.handleSingleSelect(item.selectedField,indexOfField);
    }
  };
  const handleDragStart = (cell, rowIndex, colIndex) => {
    setDraggedCell({ cell, rowIndex, colIndex });
  };

  const handleDrop = (targetRow, targetCol) => {
    // Prevent drop into dotted or selected cells
    if (
      dottedIndexes.includes(targetCol) ||
      (selectedCell.row === targetRow && selectedCell.col === targetCol)
    ) {
      return; // Do nothing
    }

    if (draggedCell && data[targetRow][targetCol].cellType === "formField") {
      const newData = [...data];
      // Swap cells
      const temp = newData[targetRow][targetCol];
      newData[targetRow][targetCol] = draggedCell.cell;
      newData[draggedCell.rowIndex][draggedCell.colIndex] = temp;

      const filteredFormfield = newData[0].filter(
        (item) => item.cellType === "formField"
      );

      const formDetails = filteredFormfield.map((item) =>
        findFieldDetails(item.cellValue)
      );
      if (formDetails.length > 0) {
        dataCtx.changeIndexTemplate(formDetails, "formField");
      }

      setData(newData);
      setDraggedCell(null);
    }
  };
  const handleDragOver = (e, targetRow, targetCol) => {
    // Disallow drop if cell is in dotted indexes or is the selected cell
    if (
      dottedIndexes.includes(targetCol) ||
      (selectedCell.row === targetRow && selectedCell.col === targetCol)
    ) {
      return; // Don't allow drop
    }

    if (data[targetRow][targetCol].cellType === "formField") {
      e.preventDefault(); // Allow drop
    }
  };

  // Generate Excel-style column headers: A, B, ..., Z, AA, AB, ...
  const columnHeaders =
    data[0]?.map((_, index) => {
      let result = "";
      let n = index;
      while (n >= 0) {
        result = String.fromCharCode((n % 26) + 65) + result;
        n = Math.floor(n / 26) - 1;
      }
      return result;
    }) || [];



  return (
    <div
      style={{ overflowX: "auto" , backgroundColor:"white " }}
      ref={tableWrapperRef}
      className="border border-dark border-bottom-0"
    >
      <table
        className="table-bordered mb-0 text-center"
        style={{ tableLayout: "fixed", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th style={{ width: "40px", minWidth: "40px" }}></th>
            {columnHeaders.map((header, index) => (
              <th
                key={index}
                style={{
                  width: "80px",
                  minWidth: "80px",
                  maxWidth: "80px",
                  textAlign: "center",
                  verticalAlign: "middle",
                  backgroundColor: selectedCell.some((c) => c.col === index)
                    ? "#A0A0A0"
                    : "#E0E0E0",
                  color: selectedCell.some((c) => c.col === index)
                    ? "white"
                    : "black",
                  border: selectedCell.some((c) => c.col === index)
                    ? "2px solid red"
                    : "1px solid #dee2e6",
                  transition: "background-color 0.2s ease, border 0.2s ease",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody >
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} style={{ height: "25px" }}>
              <th
                style={{
                  width: "40px",
                  minWidth: "40px",
                  maxWidth: "40px",
                  verticalAlign: "middle",
                  textAlign: "center",
                  backgroundColor: "#E0E0E0",
                  color: "black",
                  position: "sticky",
                  left: "0",
                  zIndex: "2",
                }}
              >
                {rowIndex + 1}
              </th>
              {row.map((cell, colIndex) => {
                if (cell.isSpanned && !cell.isCenter) return null;

                const colSpan = cell.isCenter
                  ? props.linkFields.find(
                      (f) =>
                        f.fieldName === cell.cellValue &&
                        f.fieldIndexes.includes(colIndex)
                    )?.fieldIndexes.length || 1
                  : 1;

                const isSelected = selectedCell.some(
                  (c) => c.row === rowIndex && c.col === colIndex
                );

                return (
                  <td
                    key={colIndex}
                    ref={(el) => {
                      if (el) {
                        const key = `${rowIndex}-${colIndex}`;
                        cellRefs.current[key] = el;
                      }
                    }}
                    colSpan={colSpan}
                    draggable={
                      !(dottedIndexes.includes(colIndex) || isSelected)
                    }
                    onDragStart={() =>
                      handleDragStart(cell, rowIndex, colIndex)
                    }
                    onDragOver={(e) => handleDragOver(e, rowIndex, colIndex)}
                    onDrop={() => handleDrop(rowIndex, colIndex)}
                    style={{
                      width: `${100 * colSpan}px`,
                      minWidth: `${100 * colSpan}px`,
                      maxWidth: `${100 * colSpan}px`,
                      height: "30px",
                      padding: "0",
                      boxSizing: "border-box",
                      overflow: "hidden",
                      border: isSelected
                        ? "2px solid red"
                        : dottedIndexes.includes(colIndex)
                        ? "2px dotted blue"
                        : "1px solid #dee2e6",
                      backgroundColor: isSelected
                        ? "#A5D6A7"
                        : hoveredCell.row === rowIndex &&
                          hoveredCell.col === colIndex
                        ? "#A5D6A7"
                        : cell.cellType === "formField"
                        ? "#FFF176"
                        : cell.cellType === "questionField"
                        ? "#FFB74D"
                        : "#C8E6C9",
                      transition: "background-color 0.2s ease",
                      cursor:
                        dottedIndexes.includes(colIndex) || isSelected
                          ? "not-allowed"
                          : "grab",
                    }}
                    onDoubleClick={() =>
                      handleFieldClick(cell, colIndex, rowIndex)
                    }
                    onClick={() => handleSingleClick(cell, colIndex, rowIndex)}
                    onMouseEnter={() =>
                      setHoveredCell({ row: rowIndex, col: colIndex })
                    }
                    onMouseLeave={() => setHoveredCell({ row: -1, col: -1 })}
                  >
                    <div
                      className="text-center"
                      style={{
                        width: "100%",
                        height: "100%",
                        padding: "4px",
                        boxSizing: "border-box",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {cell.cellValue}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
