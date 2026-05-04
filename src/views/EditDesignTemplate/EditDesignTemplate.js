import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Modal,
  Button,
  Col,
  Badge,
  Container,
  OverlayTrigger,
} from "react-bootstrap";
import { Row } from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";
import classes from "./DesignTemplate.module.css";
import DataContext from "store/DataContext";
import { MultiSelect } from "react-multi-select-component";
import SmallHeader from "components/Headers/SmallHeader";
import { toast } from "react-toastify";
import isEqual from "lodash/isEqual";
import EditTemplateModal from "ui/EditTemplateModal";
import processDirection from "data/processDirection";
import resetJson from "data/resetJson";
import { useWindowSize } from "react-use";
import { Box, Button as Muibtn, Slider, Tooltip } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CopyModal from "modals/CopyModal/CopyModal";
import FieldDetails from "modals/FieldDetails";
import EditImagesCropper from "modals/EditImagesCropper";
import convertToCamelCase from "services/lowerLetter";
import { calculateTotalRow } from "services/HelperFunctions";
import SideBar from "components/SideBar";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import questionNameGenerator from "helper/questionNameGenerator";
import groupQuestionNameGenerator from "helper/groupQuestionGenerator";
import AddLinkIcon from "@mui/icons-material/AddLink";
import LinkModal from "modals/LinkModal/LinkModal";
import RightSideBar from "components/RightSideBar/RightSideBar";
import FieldsFooter from "components/Footers/FieldsFooter";
import BootstrapNumberInput from "ui/BootstrapNumber";
import ExcelLikeTable from "components/ExcellLike";
import CustomDraggableModal from "views/test";
import skewQuestionNameGenerator from "helper/skewQuestionNameGenerator";
import _ from "lodash";
import ShadesOfGrey from "ui/shadesOfGrey";
import CustomTooltip from "components/CustomTooltip";
// import splitQuestionWindow from '../../helper/splitFunction'

const EditDesignTemplate = () => {
  const [selected, setSelected] = useState({});
  const [selection, setSelection] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const imageRef = useRef(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState([]);
  const [name, setName] = useState();
  const [skewoption, setSkewOption] = useState("none");
  const [windowNgOption, setWindowNgOption] = useState("");
  const [readingDirectionOption, setReadingDirectionOption] = useState("");
  const [minimumMark, setMinimumMark] = useState(1);
  const [maximumMark, setMaximumMark] = useState(600);
  const [noInRow, setNoInRow] = useState();
  const [noOfStepInRow, setNoOfStepInRow] = useState(1);
  const [noInCol, setNoInCol] = useState();
  const [noOfStepInCol, setNoOfStepInCol] = useState(1);
  const [type, setType] = useState("2");
  const [selectedFieldType, setSelectedFieldType] = useState(false);
  const [fieldType, setFieldType] = useState();
  const [numberOfField, setNumberOfField] = useState();
  const dataCtx = useContext(DataContext);
  const [selectedCol, setSelectedCol] = useState([]);
  const [options, setOptions] = useState([]);
  const [idNumber, setIdNumber] = useState("0000000000000000000000000000");
  const [layoutFieldData, setLayoutFieldData] = useState();
  const [multipleValue, setMultipleValue] = useState("");
  const [blankValue, setBlankValue] = useState("");
  const [multiple, setMultiple] = useState("");
  const [blank, setBlank] = useState("");
  const [startRowInput, setStartRowInput] = useState("");
  const [startColInput, setStartColInput] = useState("");
  const [endRowInput, setEndRowInput] = useState("");
  const [endColInput, setEndColInput] = useState("");
  const [idType, setIdType] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [modalUpdate, setModalUpdate] = useState(false);
  const [coordinateIndex, setCoordinateIndex] = useState(0);
  const [selectionIndex, setSelectionIndex] = useState();
  const [idSelectionCount, setIdSelectionCount] = useState(0);
  const [detailPage, setDetailPage] = useState(false);
  const [imageModalShow, setImageModalShow] = useState(false);
  const [imagesSelectedCount, setImagesSelectedCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [sizes, setSizes] = useState({});
  const [selectedField, setSelectedField] = useState();
  const [showCopy, setShowCopy] = useState(false);
  const [sensitivity, setSensitivity] = useState(5);
  const [showFieldDetails, setShowFieldDetails] = useState(false);
  const [fontSize, setFontSize] = useState("0.6rem"); // Default font size
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [showSideBar, setShowSideBar] = useState(false);
  const [showRightSideBar, setShowRightSideBar] = useState(false);
  const [data, setData] = useState(
    sessionStorage.getItem("Template")
      ? convertToCamelCase(JSON.parse(sessionStorage.getItem("Template")))
          .layoutParameters
      : {},
  );
  const [skewFieldValue, setSkewFieldValue] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkFields, setLinkFields] = useState([]);
  const [currentLinkField, setCurrentLinkField] = useState(null);
  const [groupCopy, setGroupCopy] = useState(false);
  const [filteredSelectedCoordinate, setFilteredSelectedCoordinate] = useState(
    [],
  );
  const [highlightField, setHighlightField] = useState(false);
  const [formatting, setFormatting] = useState("");
  const [enableFormatting, setEnableFormatting] = useState(false);
  const [marksFields, setmarksFields] = useState(false);
  const [currentSelectedCoordinate, setCurrentSelectedCoordinate] =
    useState(null);
  const [fieldSensitivity, setFieldSensitivity] = useState(3);
  const [fieldDifference, setFieldDifference] = useState(8);
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3)); // Limit max zoom
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5)); // Limit min zoom
  };
  const divRefs = useRef([]);
  const inputRef = useRef(null);
  const numRows = data.timingMarks;
  const numCols = data.totalColumns;
  const { width } = useWindowSize();
  const isWideScreen = width >= 994;
  const blankRef = useRef(null);
  const gridRef = useRef(null);

  // useEffect(() => {
  //   if (!modalUpdate) {
  //     setMaximumMark(Math.max(noInCol, noInRow));
  //   }
  // }, [noInCol, noInRow, modalShow, modalUpdate]);

  useEffect(() => {
    if (!enableFormatting) {
      setFormatting(""); // if formatting is disabled → clear it
      return;
    }

    if (!noInCol || !noOfStepInCol) {
      setFormatting(""); // if inputs are invalid → clear it
      return;
    }

    const totalVisibleColumn = Math.ceil(noInCol / noOfStepInCol);

    setFormatting(numberOfField > 0 ? "X".repeat(numberOfField) : "");
  }, [noInCol, noOfStepInCol, enableFormatting, numberOfField]);

  useEffect(() => {
    if (modalShow) {
      if (startRowInput && endRowInput && modalShow) {
        const total = +endRowInput - +startRowInput + 1;
        // console.log(Math.ceil(total/noOfStepInRow))
        setNoInRow(Math.ceil(total / noOfStepInRow));
        // setNoInRow(total);
      }
      if (startColInput && endColInput && modalShow) {
        const total = +endColInput - +startColInput + 1;
        setNoInCol(Math.ceil(total / noOfStepInCol));
        // setNoInCol(total);
      }
    }
  }, [
    modalShow,
    noOfStepInCol,
    noOfStepInRow,
    endColInput,
    endRowInput,
    startColInput,
    startRowInput,
  ]);
  useEffect(() => {
    const template = dataCtx.allTemplates;

    if (template) {
      const imageData = template[0][0]?.imageCroppingDTO;

      if (imageData) {
        setImagesSelectedCount(imageData?.length);
      }
    }
  }, [dataCtx.allTemplates]);

  useEffect(() => {
    setTimeout(() => {
      if (dataCtx.allTemplates.length > 0) {
        sendHandler();
      }
    }, 500);
  }, [dataCtx.allTemplates]);

  // **************************PREVENT FROM RELOADING*********************
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const confirmationMessage =
        "Are you sure you want to leave this page? All unsaved data will be lost.";
      event.returnValue = confirmationMessage; // Standard for most browsers
      return confirmationMessage; // Required for some browsers
    };

    const handleNavigation = (event) => {
      if (
        event.type === "POP" &&
        !window.confirm(
          "Are you sure you want to leave this page? All unsaved data will be lost.",
        )
      ) {
        navigate(location.pathname); // Navigate back to the current page
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handleNavigation);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handleNavigation);
    };
  }, [navigate, location.pathname]);
  console.log(dataCtx.allTemplates[0][0]);
  useEffect(() => {
    if (dataCtx.allTemplates.length > 0) {
      sessionStorage.setItem(
        "Template",
        JSON.stringify(dataCtx.allTemplates[0][0]),
      );
    }
  }, [dataCtx.allTemplates]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 576) {
        setFontSize("0.3rem");
      } else if (window.innerWidth < 768) {
        setFontSize("0.6rem");
      } else {
        setFontSize("0.8rem");
      }
    };

    window.addEventListener("resize", handleResize);

    // Call handler on mount to set initial font size
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const idFieldCount = selectedCoordinates.filter(
      (item) => item.fieldType === "idField",
    ).length;
    if (idFieldCount > 0) {
      setIdSelectionCount(1);
    }
  }, [selectedCoordinates]);

  useEffect(() => {
    setStartRowInput(selection?.startRow + 1);
    setEndRowInput(selection?.endRow + 1);
    setStartColInput(selection?.startCol);
    setEndColInput(selection?.endCol);
  }, [selection]);

  useEffect(() => {
    selectedCoordinates.forEach((item) => {
      const isQuestionField = item?.fieldType === "questionField";
      const isFormField = item?.fieldType === "formField";
      const template = dataCtx.allTemplates[0];
      const layoutDetails = template[0].layoutParameters;

      setSensitivity(layoutDetails.iSensitivity);

      if (isQuestionField || isFormField) {
        const parameters = isQuestionField
          ? template[0].questionsWindowParameters
          : template[0].formFieldWindowParameters;
        const layoutDetails = template[0].layoutParameters;
        // Format the selected file for comparison
        const formattedSelectedFile = {
          "End Col": item.endCol,
          "End Row": item.endRow + 1,
          "Start Col": item.startCol,
          "Start Row": item.startRow + 1,
          fieldType: item.fieldType,
          name: item.name,
        };

        // Find the index of the matched object
        console.log(parameters);
        const index = parameters.findIndex((param) =>
          isEqual(param.Coordinate, formattedSelectedFile),
        );

        console.log(index);

        // Get the matched object
        const data2 = index !== -1 ? parameters[index] : null;
        if (data2) {
          // Determine the reading direction
          let readingDirection = "rightToLeft";
          const directionMapping = {
            0: "topToBottom",
            1: "topToBottom",
            2: "bottomToTop",
            3: "bottomToTop",
            4: "leftToRight",
            5: "rightToLeft",
            6: "leftToRight",
            7: "rightToLeft",
          };
          readingDirection =
            directionMapping[data2.iDirection] || "rightToLeft";

          const type = data2.numericOrAlphabets;
          // Process the data with the determined direction

          const customRawValue = data2?.customFieldValue
            ? data2.customFieldValue.split(",")
            : [""];
          const customValue = customRawValue.map((item) =>
            item.slice(0, 2).toUpperCase(),
          );
          // console.log(customValue);
          const stepInRow = data2.rowStep;
          const stepInCol = data2.columnStep;
          processDirection(
            readingDirection,
            item.startRow,
            item.endRow,
            item.startCol,
            item.endCol,
            data.numberedExcelJsonFile,
            type,
            stepInRow,
            stepInCol,
            customValue,
          );
        }
      }
    });
  }, [
    data.numberedExcelJsonFile,
    selectedCoordinates,
    dataCtx.allTemplates,
    data.templateIndex,
    modalUpdate,
  ]);

  useEffect(() => {
    const checkSizes = () => {
      const newSizes = {};
      divRefs.current.forEach((ref, index) => {
        if (ref) {
          const { offsetWidth } = ref;
          newSizes[index] = offsetWidth <= 42; // Define your threshold for "small"
        }
      });
      setSizes(newSizes);
    };

    checkSizes(); // Initial check
    window.addEventListener("resize", checkSizes);

    return () => window.removeEventListener("resize", checkSizes);
  }, [selectedCoordinates, selection]);

  // *************************For Fetching the details and setting the coordinate******************
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = dataCtx.allTemplates[0];
        console.log(response);
        setLayoutFieldData(response[0]);
        if (response) {
          // Extract data from the response
          const formFieldData = response[0]?.formFieldWindowParameters ?? [];
          const questionField = response[0]?.questionsWindowParameters ?? [];
          const skewField = response[0]?.skewMarksWindowParameters ?? [];
          const idField = response[0]?.layoutParameters ?? {};
          // Map and restructure data for coordinates
          console.log(questionField);
          const coordinateOfFormData = formFieldData.map((item) => ({
            ...item.Coordinate,
            name: item.windowName,
          }));

          const coordinateOfQuestionField = questionField.map((item) => ({
            ...item.Coordinate,
            name: item.windowName,
          }));
          console.log(coordinateOfQuestionField);
          // const coordinateOfSkewField = skewField.map((item) => ({
          //   ...item.Coordinate,
          //   name: item.windowName,
          // }));
          const coordinateOfSkewField = skewField
            .map((item) => {
              // Check if Coordinate exists and has all undefined values
              const isCoordinateUndefined =
                !item.Coordinate ||
                Object.values(item.Coordinate).every(
                  (value) => value === undefined,
                );

              // If all values are undefined, return null (or filter later)
              if (isCoordinateUndefined) return null;

              return {
                ...item.Coordinate,
                name: item.windowName,
              };
            })
            .filter(Boolean); // Removes null entries

          let coordinateOfIdField = idField?.layoutCoordinates
            ? idField?.layoutCoordinates
            : {};

          if (
            coordinateOfIdField["Start Row"] === 0 &&
            coordinateOfIdField["Start Col"] === 0
          ) {
            coordinateOfIdField = {};
          }
          // Combine all coordinates into a single array, conditionally including the ID field's coordinates

          const allCoordinates = [
            ...coordinateOfFormData,
            ...coordinateOfQuestionField,
            ...coordinateOfSkewField,
            ...(Object.keys(coordinateOfIdField).length > 0
              ? [coordinateOfIdField]
              : []),
          ];
          console.log(coordinateOfQuestionField);
          // Format the coordinates for the state update
          const newSelectedFields = allCoordinates.map((item) => {
            const {
              "Start Row": originalStartRow,
              "Start Col": startCol,
              "End Row": originalEndRow,
              "End Col": endCol,
              name,
              fieldType,
            } = item;
            const startRow = originalStartRow - 1;
            const endRow = originalEndRow - 1;
            return { startRow, startCol, endRow, endCol, name, fieldType };
          });
          // Update state with the formatted coordinates and image data
          console.log(newSelectedFields);
          setSelectedCoordinates(newSelectedFields);
          setLinkFields(response[0]?.linkedCoordinates || []);
        }
      } catch (error) {
        console.error("Error fetching layout data:", error);
      }
    };

    // Call the fetch details function
    fetchDetails();
  }, [dataCtx.allTemplates]);

  // *****************************************************************************************

  useEffect(() => {
    // Create an array to hold the options
    const options = Array.from({ length: +data.totalColumns }, (v, i) => ({
      label: `${idType} ${i + 1}`, // Set the label as 'Col X' where X is the column number
      value: i, // Set the value as the index
    }));

    // Update the state with the new options array
    setOptions(options);
  }, [data.totalColumns, idType]);

  useEffect(() => {
    if (selectedCol.length > 0) {
      const value = selectedCol.map((item) => item.value);
      const arr = Array(+data.totalColumns).fill(0);
      for (let j = 0; j < value.length; j++) {
        arr[value[j]] = 1;
      }
      setIdNumber(arr.join("").toString());
    }
  }, [options, selectedCol]);

  const handleMouseDown = (e) => {
    const boundingRect = imageRef.current.getBoundingClientRect();
    const col = Math.floor(
      (e.clientX - boundingRect.left) / (boundingRect.width / numCols),
    );
    const row = Math.floor(
      (e.clientY - boundingRect.top) / (boundingRect.height / numRows),
    );

    // Check if the clicked cell is a timing mark or already selected (a circle)
    if (col === 0 || selected[`${row},${col}`]) return;

    setDragStart({ row, col });
  };
  const handleMouseMove = (e) => {
    if (!e.buttons || !dragStart) return;
    const boundingRect = imageRef.current.getBoundingClientRect();
    const col = Math.floor(
      (e.clientX - boundingRect.left) / (boundingRect.width / numCols),
    );
    const row = Math.floor(
      (e.clientY - boundingRect.top) / (boundingRect.height / numRows),
    );
    setSelection((prevSelection) => {
      const startRow = Math.min(dragStart.row, row);
      const startCol = Math.min(dragStart.col, col);
      const endRow = Math.max(dragStart.row, row);
      const endCol = Math.max(dragStart.col, col);

      const newSelection = {
        startRow: Math.max(0, startRow), // Ensure startRow is not negative
        startCol: Math.max(1, startCol), // Ensure startCol is not negative
        endRow: Math.min(numRows - 1, endRow), // Ensure endRow is within grid bounds
        endCol: Math.min(numCols, endCol), // Ensure endCol is within grid bounds
      };

      return newSelection;
    });
  };

  const handleMouseUp = (e) => {
    // e.preventDefault();
    if (!selection) {
      return;
    }
    const filteredCoordinates = selectedCoordinates.filter((coord) => {
      const isFullyInside =
        coord.startRow >= selection.startRow &&
        coord.endRow <= selection.endRow &&
        coord.startCol >= selection.startCol &&
        coord.endCol <= selection.endCol;

      return isFullyInside;
    });

    // console.log(selection);
    if (dragStart && selection && !(e.ctrlKey || e.metaKey)) {
      // Handle selection via drag
      // handleCancel();
      setDragStart(null);
      setModalShow(true);
      setSelectedFieldType(null);
    } else if ((e.ctrlKey || e.metaKey) && filteredCoordinates.length > 0) {
      // Handle copy with Ctrl/Cmd key
      // console.log(filteredCoordinates);
      handleFillData(filteredCoordinates[0]);
      setGroupCopy(true);
      setFilteredSelectedCoordinate(filteredCoordinates);
    } else if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd pressed but no valid selection
      toast.error("Selected window cannot be copied.");
    }
  };

  const handleCancel = () => {
    setDragStart(null);
    setSelection(null);
    setModalShow(false);
    setModalUpdate(false);
    setSkewOption("none");
    setWindowNgOption("");
    setReadingDirectionOption("");
    setMinimumMark(1);
    setMaximumMark(numberOfField);
    setNoInRow();
    setNoOfStepInRow(1);
    setNoInCol();
    setNoOfStepInCol(1);
    setType("2");
    setFieldType();
    setNumberOfField();
    setMultipleValue();
    setBlankValue();
    setMultiple();
    setBlank();
    setStartRowInput();
    setStartColInput();
    setEndRowInput();
    setEndColInput();
    setCustomValue("");
    setPrefix("");
    setSuffix("");
    setName("");
    setHighlightField(false);
  };
  const validateFormField = () => {
    const errors = {
      name: "Name Field can not be empty",
      multiple: "Please select multiple",
      blank: "Please select blank",
      windowNgOption: "Please select window Ng",
      minimumMark: "Minimum mark cannot be empty",
      // maximumMark: "Maximum mark cannot be empty",
      noInRow: "Total number in row cannot be empty",
      noOfStepInRow: "Total number of step in a row cannot be empty",
      noInCol: "Total number in col cannot be empty",
      noOfStepInCol: "Total number of step in a col cannot be empty",
      readingDirectionOption: "Please select reading direction",
      type: "Please select type",
      numberOfField: "Total field cannot be empty",
      fieldType: "Please select field type",
    };

    for (let [field, errorMsg] of Object.entries(errors)) {
      const value = eval(field); // ← still dangerous, but keeping your structure
      if (value === null || value === undefined || value === "") {
        toast.error(errorMsg);
        return false;
      }
    }
    return true;
  };

  const validateSkewField = () => {
    const errors = {
      name: "Name Field can not be empty",
      windowNgOption: "Please select window Ng",
      skewoption: "Please select the skew mark position",
      noInRow: "Total number in row cannot be empty",
      noOfStepInRow: "Total number of step in a row cannot be empty",
      noInCol: "Total number in col cannot be empty",
      noOfStepInCol: "Total number of step in a col cannot be empty",
      readingDirectionOption: "Please select reading direction",
      type: "Please select type",
    };

    for (let [field, errorMsg] of Object.entries(errors)) {
      if (!eval(field)) {
        toast.error(errorMsg);
        return false;
      }
    }
    return true;
  };
  const validateIdField = () => {
    const errors = {
      noInRow: "Total number in row cannot be empty",
      noOfStepInRow: "Total number of step in a row cannot be empty",
      noInCol: "Total number in col cannot be empty",
      noOfStepInCol: "Total number of step in a col cannot be empty",
      readingDirectionOption: "Please select reading direction",
    };

    for (let [field, errorMsg] of Object.entries(errors)) {
      if (!eval(field)) {
        toast.error(errorMsg);
        return false;
      }
    }
    return true;
  };

  function splitQuestionWindow({
    newData,
    selection,
    nums,
    selectedFieldType,
    readingDirection,
  }) {
    if (selectedFieldType !== "questionField") return {};
    console.log(nums);
    const [startQ, endQ] = nums;
    const key = `q${startQ}-q${endQ}`;

    const result = {
      [key]: [],
    };

    let rowCursor = newData.rowStart;
    let colCursor = newData.columnStart;

    const isRowWise = [4, 5].includes(readingDirection);
    const isColumnWise = [0, 2].includes(readingDirection);
    for (let q = startQ; q <= endQ; q++) {
      result[key].push({
        iFace: newData.iFace,
        windowName: `q${q}`,
        columnStart: isColumnWise ? colCursor : newData.columnStart,
        columnNumber: isColumnWise ? 1 : newData.columnNumber,
        columnStep: newData.columnStep,
        rowStart: isRowWise ? rowCursor : newData.rowStart,
        rowNumber: isRowWise ? 1 : newData.rowNumber,
        rowStep: newData.rowStep,
        iDirection: newData.iDirection,
        iSensitivity: newData.iSensitivity,
        iDifference: newData.iDifference,
        iOption: newData.iOption,
        prefix: newData.prefix,
        suffix: newData.suffix,
        iMinimumMarks: newData.iMinimumMarks,
        iMaximumMarks: newData.iMaximumMarks,
        iType: newData.iType,
        ngAction: newData.ngAction,
        totalNumberOfFields: newData.totalNumberOfFields,
        numericOrAlphabets: newData.numericOrAlphabets,
        multipleAllow: newData.multipleAllow,
        multipleValue: newData.multipleValue,
        blankAllow: newData.blankAllow,
        blankValue: newData.blankValue,
        customFieldValue: newData.customFieldValue,
        formatting: newData.formatting,

        
      });
      if (isRowWise) rowCursor += newData.rowStep || 1;
      if (isColumnWise) colCursor += newData.columnStep || 1;
    }

    return result;
  }
  function splitFormWindow({
    newData,
    selection,
    nums,
    selectedFieldType,
    readingDirection,
  }) {
    if (selectedFieldType !== "formField") return {};

    // const [startQ, endQ] = nums;
    let startQ;
    let endQ;
    const key = nums;
    const result = {
      [key]: [],
    };
    if ([4, 5].includes(readingDirection)) {
      startQ = newData.rowStart;
      endQ = newData.rowNumber - 1 + newData.rowStart;
    } else {
      startQ = newData.columnStart;
      endQ = newData.columnNumber - 1 + newData.columnStart;
    }

    let rowCursor = newData.rowStart;
    let colCursor = newData.columnStart;

    const isRowWise = [4, 5].includes(readingDirection);
    const isColumnWise = [0, 2].includes(readingDirection);
    for (let q = startQ; q <= endQ; q++) {
      result[key].push({
        iFace: newData.iFace,
        windowName: nums,
        columnStart: isColumnWise ? colCursor : newData.columnStart,
        columnNumber: isColumnWise ? 1 : newData.columnNumber,
        columnStep: newData.columnStep,
        rowStart: isRowWise ? rowCursor : newData.rowStart,
        rowNumber: isRowWise ? 1 : newData.rowNumber,
        rowStep: newData.rowStep,
        iDirection: newData.iDirection,
        iSensitivity: newData.iSensitivity,
        iDifference: newData.iDifference,
        iOption: newData.iOption,
        prefix: newData.prefix,
        suffix: newData.suffix,
        iMinimumMarks: newData.iMinimumMarks,
        iMaximumMarks: newData.iMaximumMarks,
        iType: newData.iType,
        ngAction: newData.ngAction,
        totalNumberOfFields: newData.totalNumberOfFields,
        numericOrAlphabets: newData.numericOrAlphabets,
        multipleAllow: newData.multipleAllow,
        multipleValue: newData.multipleValue,
        blankAllow: newData.blankAllow,
        blankValue: newData.blankValue,
        customFieldValue: newData.customFieldValue,
        formatting: newData.formatting,

        
      });
      if (isRowWise) rowCursor += newData.rowStep || 1;
      if (isColumnWise) colCursor += newData.columnStep || 1;
    }

    return result;
  }

  let nameOFWindow;
  const handleSave = () => {
    if (
      selectedFieldType === "formField" ||
      selectedFieldType === "questionField"
    ) {
      if (multiple !== "allow") {
        if (!multipleValue) {
          toast.error("Multiple value cannot be empty");
          return;
        }
      }
      if (blank !== "allow") {
        if (!blankValue) {
          toast.error("Blank value cannot be empty");
          return;
        }
      }
      if (!validateFormField()) {
        return;
      }
    } else if (selectedFieldType === "skewMarkField") {
      if (!validateSkewField()) {
        return;
      }
    } else if (selectedFieldType === "idField") {
      if (!validateIdField()) {
        return;
      }
    }
    // console.log(selection?.startCol);
    // console.log(selection?.endCol);
    console.log(selection?.startRow);
    console.log(selection?.endRow);
    // console.log(readingDirectionOption);
    // console.log(selectedField);

    const cleanName = typeof name === "string" ? name.trim().toLowerCase() : "";

    const direction = Number(readingDirectionOption);

    if (
      selectedFieldType === "questionField" &&
      [0, 2].includes(direction) &&
      typeof selection?.startCol === "number" &&
      typeof selection?.endCol === "number"
    ) {
      const start = Number(cleanName?.match(/\d+/)?.[0]);
      if (!Number.isFinite(start)) return;

      const startCol = selection.startCol;
      const endCol = selection.endCol;

      if (endCol < startCol) return;

      const step = noOfStepInCol || 1;

      // ✅ actual columns selected using step logic
      const actualColsSelected = Math.floor((endCol - startCol) / step) + 1;

      // ✅ sequential questions
      const end = start + actualColsSelected - 1;

      nameOFWindow = `q${start}-q${end}`;
    }

    if (selectedFieldType === "questionField" && [4, 5].includes(direction)) {
      const match = cleanName?.match(/\d+/);
      if (!match) return;

      const start = Number(match[0]);

      const startRow = selection?.startRow;
      const endRow = selection?.endRow;

      if (!Number.isFinite(startRow) || !Number.isFinite(endRow)) return;
      if (endRow < startRow) return;

      const step = noOfStepInRow || 1;

      // ✅ real number of rows picked via step logic
      const actualRowsSelected = Math.floor((endRow - startRow) / step) + 1;

      // ✅ questions are sequential
      const end = start + actualRowsSelected - 1;

      nameOFWindow = `q${start}-q${end}`;
    }

    // console.log("nameOFWindow:", nameOFWindow);

    let newData = {};
    let selectedWindowName = "";
    const layoutData = layoutFieldData.layoutParameters;
    if (selectedFieldType === "idField") {
      selectedWindowName = "Id Field";
      newData = {
        Coordinate: {
          "Start Row": selection?.startRow + 1,
          "Start Col": selection?.startCol,
          "End Row": selection?.endRow + 1,
          "End Col": selection?.endCol,
          name: "Id Field",
          fieldType: selectedFieldType,
        },
        columnStart: +selection?.startCol,
        columnNumber: +noInCol,
        columnStep: +noOfStepInCol,
        rowStart: +selection?.startRow + 1,
        rowNumber: +noInRow,
        rowStep: +noOfStepInRow,
        iDirection: +readingDirectionOption,
        idMarksPattern: idNumber.toString(),
      };
    } else if (selectedFieldType === "skewMarkField") {
      selectedWindowName = name;
      newData = {
        iFace: +layoutData.iFace ?? 0,
        columnStart: +selection?.startCol,
        columnNumber: +noInCol,
        columnStep: +noOfStepInCol,
        rowStart: +selection?.startRow + 1,
        rowNumber: +noInRow,
        rowStep: +noOfStepInRow,
        iSensitivity:
          layoutData.iSensitivity === fieldSensitivity
            ? +layoutData.iSensitivity
            : +fieldSensitivity,
        iDifference:
          layoutData.iDifference === fieldDifference
            ? +layoutData.iDifference
            : +fieldDifference,

        iOption: blank === "allow" ? 1 : 0,
        iReject: +layoutData.iReject,
        iDirection: +readingDirectionOption,
        windowName: name,
        Coordinate: {
          "Start Row": selection?.startRow + 1,
          "Start Col": selection?.startCol,
          "End Row": selection?.endRow + 1,
          "End Col": selection?.endCol,
          name: name,
          fieldType: selectedFieldType,
        },
        ngAction: windowNgOption,
        iMinimumMarks: 1,
        iMaximumMarks: 1,
        skewMark: +skewoption,
        iType: type,
        dataRejection: skewoption,
        skewFieldValue: skewFieldValue,
        blankAllow: blank,
        blankValue: blankValue ? blankValue : "",
      };
    } else {
      selectedWindowName = name;
      newData = {
        iFace: +layoutData.iFace ?? 0,
        windowName: nameOFWindow === undefined ? name : nameOFWindow,
        columnStart: +selection?.startCol,
        columnNumber: +noInCol,
        columnStep: +noOfStepInCol,
        rowStart: +selection?.startRow + 1,
        rowNumber: +noInRow,
        rowStep: +noOfStepInRow,
        iDirection: +readingDirectionOption,

        iSensitivity:
          layoutData.iSensitivity === fieldSensitivity
            ? +layoutData.iSensitivity
            : +fieldSensitivity,
        iDifference:
          layoutData.iDifference === fieldDifference
            ? +layoutData.iDifference
            : +fieldDifference,

        iOption: blank === "allow" ? 1 : 0,
        prefix: selectedFieldType === "formField" ? prefix : "",
        suffix: selectedFieldType === "formField" ? suffix : "",
        iMinimumMarks: +minimumMark,
        iMaximumMarks: +maximumMark,
        iType: type,
        ngAction: windowNgOption,
        Coordinate: {
          "Start Row": selection?.startRow + 1,
          "Start Col": selection?.startCol,
          "End Row": selection?.endRow + 1,
          "End Col": selection?.endCol,
          name: nameOFWindow === undefined ? name : nameOFWindow,
          fieldType: selectedFieldType,
        },
        totalNumberOfFields: numberOfField,
        numericOrAlphabets: fieldType,
        multipleAllow: multiple,
        multipleValue: multipleValue ? multipleValue : "",
        blankAllow: blank,
        blankValue: blankValue ? blankValue : "",
        customFieldValue: customValue ? customValue : "",
        formatting: formatting ? formatting : "",
      };
    }

    // else {
    //     if (selectedFieldType === "idField") {
    //         selectedWindowName = "Id Field"
    //         newData = {
    //             Coordinate: {
    //                 "Start Row": selection?.startRow,
    //                 "Start Col": selection?.startCol,
    //                 "End Row": selection?.endRow,
    //                 "End Col": selection?.endCol,
    //                 name: "Id Field",
    //                 fieldType: selectedFieldType,
    //             },
    //             imageStructureData: position,
    //             columnStart: +selection?.startCol,
    //             columnNumber: +noInCol,
    //             columnStep: +noOfStepInCol,
    //             rowStart: +selection?.startRow + 1,
    //             rowNumber: +noInRow,
    //             rowStep: +noOfStepInRow,
    //             iDirection: +readingDirectionOption,
    //             idMarksPattern: idNumber.toString(),
    //         };
    //     } else if (selectedFieldType === "skewMarkField") {
    //         selectedWindowName = name
    //         newData = {
    //             iFace: +data.iFace,
    //             columnStart: +selection?.startCol,
    //             columnNumber: +noInCol,
    //             columnStep: +noOfStepInCol,
    //             rowStart: +selection?.startRow + 1,
    //             rowNumber: +noInRow,
    //             rowStep: +noOfStepInRow,
    //             iSensitivity: +data.iSensitivity,
    //             iDifference: +data.iDifference,
    //             iOption: +option,
    //             iReject: +data.iReject,
    //             iDirection: +readingDirectionOption,
    //             windowName: name,
    //             Coordinate: {
    //                 "Start Row": selection?.startRow,
    //                 "Start Col": selection?.startCol,
    //                 "End Row": selection?.endRow,
    //                 "End Col": selection?.endCol,
    //                 name: name,
    //                 fieldType: selectedFieldType,
    //             },
    //             ngAction: windowNgOption,
    //             iMinimumMarks: +minimumMark,
    //             iMaximumMarks: +maximumMark,
    //             skewMark: +skewoption,
    //             iType: type,
    //             // imageStructureData: position,
    //         };
    //     } else {
    //         console.log("update form")
    //         selectedWindowName = name
    //         newData = {
    //             iFace: +data.iFace,
    //             windowName: name,
    //             columnStart: +selection?.startCol,
    //             columnNumber: +noInCol,
    //             columnStep: +noOfStepInCol,
    //             rowStart: +selection?.startRow + 1,
    //             rowNumber: +noInRow,
    //             rowStep: +noOfStepInRow,
    //             iDirection: +readingDirectionOption,
    //             iSensitivity: +data.iSensitivity,
    //             iDifference: +data.iDifference,
    //             iOption: +option,
    //             iMinimumMarks: +minimumMark,
    //             iMaximumMarks: +maximumMark,
    //             iType: type,
    //             ngAction: windowNgOption,
    //             Coordinate: {
    //                 "Start Row": selection?.startRow+1,
    //                 "Start Col": selection?.startCol,
    //                 "End Row": selection?.endRow+1,
    //                 "End Col": selection?.endCol,
    //                 name: name,
    //                 fieldType: selectedFieldType,
    //             },
    //             totalNumberOfFields: numberOfField,
    //             numericOrAlphabets: fieldType,
    //             multipleAllow: multiple,
    //             multipleValue: multipleValue ? multipleValue : "",
    //             blankAllow: blank,
    //             blankValue: blankValue ? blankValue : "",
    //             customFieldValue: customValue ? customValue : ""
    //         };
    //     }
    // }

    // setSelectedCoordinates((prev) => [...prev, newSelected]);//chamnge here
    // setSelection(null);

    setModalShow(false);
    if (!modalUpdate) {
      // dataCtx.modifyAllTemplate(0, newData, selectedFieldType);
      console.log(newData);
      let s = newData.windowName;
      let nums =
        selectedFieldType === "questionField" ? s.match(/\d+/g).map(Number) : s;
      console.log(nums);

      let questionGroupedData = {};
      let formGroupedData = {};

      if (selectedFieldType === "questionField") {
        questionGroupedData = splitQuestionWindow({
          newData,
          selection,
          nums,
          selectedFieldType,
          readingDirection: +readingDirectionOption,
        });

        // console.log("Grouped Question Data:", questionGroupedData);
      }
      if (selectedFieldType === "formField") {
        formGroupedData = splitFormWindow({
          newData,
          selection,
          nums,
          selectedFieldType,
          readingDirection: +readingDirectionOption,
        });

        // console.log("Grouped Question Data:", questionGroupedData);
      }

      const isFormEmpty = Object.keys(formGroupedData || {}).length === 0;

      const isQuestionEmpty =
        Object.keys(questionGroupedData || {}).length === 0;

      const group = {
        ...newData,
        ...(isFormEmpty
          ? { questionGroupedData }
          : isQuestionEmpty
            ? { formGroupedData }
            : {}),
      };

      dataCtx.modifyAllTemplate(0, group, selectedFieldType);
      const newSelected = {
        ...selection,
        name:
          selectedFieldType !== "idField"
            ? selectedFieldType === "questionField" &&
              nameOFWindow !== undefined
              ? nameOFWindow
              : name
            : "Id Field",
        fieldType: selectedFieldType,
      };

      console.log(newSelected);
      setSelectedCoordinates((prev) => [...prev, newSelected]);
      setSelection(null);
    } else {
      // const updatedValue = {
      //     startRow: selection?.startRow - 1,
      //     startCol: selection?.startCol,
      //     endRow: selection?.endRow - 1,
      //     endCol: selection?.endCol,
      //     name: name,
      //     fieldType: selectedFieldType,
      //   };

      let s = newData.windowName;
      let nums =
        selectedFieldType === "questionField" ? s.match(/\d+/g).map(Number) : s;

      let questionGroupedData = {};
      let formGroupedData = {};

      if (selectedFieldType === "questionField") {
        questionGroupedData = splitQuestionWindow({
          newData,
          selection,
          nums,
          selectedFieldType,
          readingDirection: +readingDirectionOption,
        });

        // console.log("Grouped Question Data:", questionGroupedData);
      }
      if (selectedFieldType === "formField") {
        formGroupedData = splitFormWindow({
          newData,
          selection,
          nums,
          selectedFieldType,
          readingDirection: +readingDirectionOption,
        });

        // console.log("Grouped Question Data:", questionGroupedData);
      }
      const isFormEmpty = Object.keys(formGroupedData || {}).length === 0;

      const isQuestionEmpty =
        Object.keys(questionGroupedData || {}).length === 0;

      const group = {
        ...newData,
        ...(isFormEmpty
          ? { questionGroupedData }
          : isQuestionEmpty
            ? { formGroupedData }
            : {}),
      };

      setSelectedCoordinates((item) => {
        // Ensure item is defined and coordinateIndex is valid
        if (!item || coordinateIndex < 0 || coordinateIndex >= item.length) {
          console.error("Invalid coordinate index or item array");
          return item; // Return the unchanged state if validation fails
        }

        const copiedSelectedField = [...item];
        copiedSelectedField[coordinateIndex] = {
          ...copiedSelectedField[coordinateIndex],
          name: selectedWindowName,
          fieldType: selectedFieldType,
        };

        return copiedSelectedField;
      });
      dataCtx.modifyWithRegion(0, group, selectedFieldType, coordinateIndex);
      setSelection(null);
    }
  };

  const handleSkewMarkOptionChange = (event) => {
    setSkewOption(event.target.value);
  };
  const handleWindowNgOptionChange = (event) => {
    setWindowNgOption(event.target.value);
  };
  const handleRadioChange = (e) => {
    setSelectedFieldType(e.target.value);
  };
  const handleEyeClick = (selectedField, index) => {
    setCurrentSelectedCoordinate(selectedField);
    setSelectedField(selectedField);
    setHighlightField(true);
    setSelection(() => ({
      startRow: selectedField.startRow,
      startCol: selectedField.startCol,
      endRow: selectedField.endRow,
      endCol: selectedField.endCol,
    }));
    const formattedSelectedFile = {
      "End Col": selectedField.endCol,
      "End Row": selectedField.endRow + 1,
      "Start Col": selectedField.startCol,
      "Start Row": selectedField.startRow + 1,
      fieldType: selectedField.fieldType,
      name: selectedField.name,
    };

    setSelectionIndex(index);

    const template = dataCtx.allTemplates[0];
    if (selectedField?.fieldType === "idField") {
      const data = template[0].layoutParameters;
      setSelectedFieldType("idField");
      setWindowNgOption(data?.ngAction);
      setMinimumMark(data?.minimumMark);
      setMaximumMark(data?.numberOfField);
      setNoInRow(data?.rowNumber);
      setNoInCol(data?.columnNumber);
      setNoOfStepInRow(data?.rowStep);
      setNoOfStepInCol(data?.columnStep);
      setStartRowInput(formattedSelectedFile["Start Row"]);
      setEndRowInput(formattedSelectedFile["End Row"]);
      setStartColInput(formattedSelectedFile["Start Col"]);
      setEndColInput(formattedSelectedFile["End Col"]);
      setReadingDirectionOption(data?.iDirection);
      setCoordinateIndex(index);
      setModalUpdate(true);
      setModalShow(true);
      setIdNumber(data?.idMarksPattern);
    } else if (selectedField?.fieldType === "questionField") {
      const parameters = template[0].questionsWindowParameters;
      const index = parameters.findIndex((item) =>
        isEqual(item?.Coordinate, formattedSelectedFile),
      );
      const data = parameters[index];
      setCoordinateIndex(index);
      setModalUpdate(true);
      setModalShow(true);
      setName(data?.windowName);
      setSelectedFieldType("questionField");
      setWindowNgOption(data?.ngAction);
      setMinimumMark(data?.iMinimumMarks);
      setMaximumMark(data?.iMaximumMarks);
      setNoInRow(data?.rowNumber);
      setNoInCol(data?.columnNumber);
      setStartRowInput(formattedSelectedFile["Start Row"]);
      setEndRowInput(formattedSelectedFile["End Row"]);
      setStartColInput(formattedSelectedFile["Start Col"]);
      setEndColInput(formattedSelectedFile["End Col"]);
      setReadingDirectionOption((data?.iDirection).toString());
      setType(data?.iType);
      setNumberOfField(data?.totalNumberOfFields);
      setFieldType(data?.numericOrAlphabets);
      setMultiple(data?.multipleAllow);
      setMultipleValue(data?.multipleValue);
      setBlank(data?.blankAllow);
      setBlankValue(data?.blankValue);
      setNoOfStepInRow(data?.rowStep);
      setNoOfStepInCol(data?.columnStep);
      setCustomValue(data?.customFieldValue);
      setFieldSensitivity(data?.iSensitivity);
      setFieldDifference(data?.iDifference);
    } else if (selectedField?.fieldType === "formField") {
      const parameters = template[0].formFieldWindowParameters;
      const index = parameters.findIndex((item) =>
        isEqual(item?.Coordinate, formattedSelectedFile),
      );

      if (index === -1) {
        alert("No data found");
      }
      const data = parameters[index];
      // Get the matched object
      setCoordinateIndex(index);
      setModalUpdate(true);
      setModalShow(true);
      setSelectedFieldType("formField");
      setName(data?.windowName);
      setWindowNgOption(data?.ngAction);
      setMinimumMark(data?.iMinimumMarks);
      setMaximumMark(data?.iMaximumMarks);
      setNoOfStepInRow(data?.rowStep);
      setNoOfStepInCol(data?.columnStep);
      setNoInRow(data?.rowNumber);
      setNoInCol(data?.columnNumber);
      setStartRowInput(formattedSelectedFile["Start Row"] - 2);
      setEndRowInput(formattedSelectedFile["End Row"] - 2);
      setStartColInput(formattedSelectedFile["Start Col"]);
      setEndColInput(formattedSelectedFile["End Col"]);
      setReadingDirectionOption((data?.iDirection).toString());
      setType(data?.iType);
      setNumberOfField(data?.totalNumberOfFields);
      setFieldType(data?.numericOrAlphabets);
      setMultiple(data?.multipleAllow);
      setMultipleValue(data?.multipleValue);
      setBlank(data?.blankAllow);
      setBlankValue(data?.blankValue);
      setCustomValue(data?.customFieldValue);
      setSuffix(data?.suffix);
      setPrefix(data?.prefix);
      setFormatting(data?.formatting);
      setFieldSensitivity(data?.iSensitivity);
      setFieldDifference(data?.iDifference);
    } else if (selectedField?.fieldType === "skewMarkField") {
      const parameters = template[0].skewMarksWindowParameters;
      const index = parameters.findIndex((item) =>
        isEqual(item?.Coordinate, formattedSelectedFile),
      );

      if (index === -1) {
        alert("No data found");
      }
      const data = parameters[index];
      setName(data?.windowName);
      setMinimumMark(data?.iMinimumMarks);
      setNoOfStepInRow(data?.rowStep);
      setNoOfStepInCol(data?.columnStep);
      setMaximumMark(data?.numberOfField);
      setNoInRow(data?.rowNumber);
      setNoInCol(data?.columnNumber);
      setReadingDirectionOption((data?.iDirection).toString());
      setType(data?.iType);
      setCoordinateIndex(index);
      setModalUpdate(true);
      setModalShow(true);
      setSelectedFieldType("skewMarkField");
      setStartRowInput(formattedSelectedFile["Start Row"]);
      setEndRowInput(formattedSelectedFile["End Row"]);
      setStartColInput(formattedSelectedFile["Start Col"]);
      setEndColInput(formattedSelectedFile["End Col"]);
      setNoOfStepInRow(data?.rowStep);
      setNoOfStepInCol(data?.columnStep);
      setWindowNgOption(data?.ngAction);
      setSkewOption(data?.dataRejection);
      setSkewFieldValue(data?.skewFieldValue);
      setFieldSensitivity(data?.iSensitivity);
      setFieldDifference(data?.iDifference);
      setBlank(data?.blankAllow);
      setBlankValue(data?.blankValue);
    }
  };
  const handleFillData = (selectedField) => {
    setSelectedField(selectedField);
    setSelection(() => ({
      startRow: selectedField.startRow,
      startCol: selectedField.startCol,
      endRow: selectedField.endRow,
      endCol: selectedField.endCol,
    }));
    const formattedSelectedFile = {
      "End Col": selectedField.endCol,
      "End Row": selectedField.endRow + 1,
      "Start Col": selectedField.startCol,
      "Start Row": selectedField.startRow + 1,
      fieldType: selectedField.fieldType,
      name: selectedField.name,
    };

    const template = dataCtx.allTemplates[0];
    if (selectedField?.fieldType === "idField") {
      const data = template[0].layoutParameters;

      setSelectedFieldType("idField");
      setWindowNgOption(data?.ngAction);
      setMinimumMark(data?.minimumMark);
      setMaximumMark(data?.iMaximumMarks);
      setNoInRow(data?.rowNumber);
      setNoInCol(data?.columnNumber);
      setNoOfStepInRow(data?.rowStep);
      setNoOfStepInCol(data?.columnStep);
      setStartRowInput(formattedSelectedFile["Start Row"]);
      setEndRowInput(formattedSelectedFile["End Row"]);
      setStartColInput(formattedSelectedFile["Start Col"]);
      setEndColInput(formattedSelectedFile["End Col"]);
      setReadingDirectionOption(data?.iDirection);

      setModalUpdate(true);
      setModalShow(true);
      setIdNumber(data?.idMarksPattern);
    } else if (selectedField?.fieldType === "questionField") {
      const parameters = template[0].questionsWindowParameters;
      const index = parameters.findIndex((item) =>
        isEqual(item?.Coordinate, formattedSelectedFile),
      );
      const data = parameters[index];
      // console.log(data);
      setName(data?.windowName);
      setSelectedFieldType("questionField");
      setWindowNgOption(data?.ngAction);
      setMinimumMark(data?.iMinimumMarks);
      setMaximumMark(data?.iMaximumMarks);
      setNoInRow(data?.rowNumber);
      setNoInCol(data?.columnNumber);
      setStartRowInput(formattedSelectedFile["Start Row"]);
      setEndRowInput(formattedSelectedFile["End Row"]);
      setStartColInput(formattedSelectedFile["Start Col"]);
      setEndColInput(formattedSelectedFile["End Col"]);
      setReadingDirectionOption((data?.iDirection).toString());
      setType(data?.iType);
      setNumberOfField(data?.totalNumberOfFields);
      setFieldType(data?.numericOrAlphabets);
      setMultiple(data?.multipleAllow);
      setMultipleValue(data?.multipleValue);
      setBlank(data?.blankAllow);
      setBlankValue(data?.blankValue);
      setNoOfStepInRow(data?.rowStep);
      setNoOfStepInCol(data?.columnStep);
      setCustomValue(data?.customFieldValue);
      setFieldSensitivity(data?.iSensitivity);
      setFieldDifference(data?.iDifference);
    } else if (selectedField?.fieldType === "formField") {
      const parameters = template[0].formFieldWindowParameters;
      const index = parameters.findIndex((item) =>
        isEqual(item?.Coordinate, formattedSelectedFile),
      );

      if (index === -1) {
        alert("No data found");
      }
      const data = parameters[index];
      // Get the matched object

      setSelectedFieldType("formField");
      setName(data?.windowName);
      setWindowNgOption(data?.ngAction);
      setMinimumMark(data?.iMinimumMarks);
      setMaximumMark(data?.iMaximumMarks);
      setNoOfStepInRow(data?.rowStep);
      setNoOfStepInCol(data?.columnStep);

      setNoInRow(data?.rowNumber);
      setNoInCol(data?.columnNumber);
      setStartRowInput(formattedSelectedFile["Start Row"] - 2);
      setEndRowInput(formattedSelectedFile["End Row"] - 2);
      setStartColInput(formattedSelectedFile["Start Col"]);
      setEndColInput(formattedSelectedFile["End Col"]);
      setReadingDirectionOption((data?.iDirection).toString());
      setType(data?.iType);
      setNumberOfField(data?.totalNumberOfFields);
      setFieldType(data?.numericOrAlphabets);
      setMultiple(data?.multipleAllow);
      setMultipleValue(data?.multipleValue);
      setBlank(data?.blankAllow);
      setBlankValue(data?.blankValue);
      setCustomValue(data?.customFieldValue);
      setSuffix(data?.suffix);
      setPrefix(data?.prefix);
      setFieldSensitivity(data?.iSensitivity);
      setFieldDifference(data?.iDifference);
    } else if (selectedField?.fieldType === "skewMarkField") {
      const parameters = template[0].skewMarksWindowParameters;
      const index = parameters.findIndex((item) =>
        isEqual(item?.Coordinate, formattedSelectedFile),
      );

      if (index === -1) {
        alert("No data found");
      }
      const data = parameters[index];
      setName(data?.windowName);
      setMinimumMark(data?.iMinimumMarks);
      setMaximumMark(data?.iMaximumMarks);
      setNoOfStepInRow(data?.rowStep);
      setNoOfStepInCol(data?.columnStep);

      setNoInRow(data?.rowNumber);
      setNoInCol(data?.columnNumber);
      setReadingDirectionOption((data?.iDirection).toString());
      setType(data?.iType);
      setCoordinateIndex(index);
      setModalUpdate(true);
      setModalShow(true);
      setSelectedFieldType("skewMarkField");
      setStartRowInput(formattedSelectedFile["Start Row"]);
      setEndRowInput(formattedSelectedFile["End Row"]);
      setStartColInput(formattedSelectedFile["Start Col"]);
      setEndColInput(formattedSelectedFile["End Col"]);
      setNoOfStepInRow(data?.rowStep);
      setNoOfStepInCol(data?.columnStep);
      setWindowNgOption(data?.ngAction);
      setSkewOption(data?.dataRejection);
      setSkewFieldValue(data?.skewFieldValue);
      setFieldSensitivity(data?.iSensitivity);
      setFieldDifference(data?.iDifference);
      setBlank(data?.blankAllow);
      setBlankValue(data?.blankValue);
    }
  };
  const handleCrossClick = (selectedField, index) => {
    const response = window.confirm(
      "Are you sure you want to delete the selected field ?",
    );
    if (!response) {
      return;
    }

    const formattedSelectedFile = {
      "End Col": selectedField.endCol,
      "End Row": selectedField.endRow + 1,
      "Start Col": selectedField.startCol,
      "Start Row": selectedField.startRow + 1,
      fieldType: selectedField.fieldType,
      name: selectedField.name,
    };

    setSelectedCoordinates((prevState) => {
      const copiedState = [...prevState];
      copiedState.splice(index, 1); // Remove the item at the specified index
      return copiedState;
    });
    dataCtx.deleteFieldTemplate(0, formattedSelectedFile);
    resetJson(
      data.numberedExcelJsonFile,
      formattedSelectedFile["Start Row"] - 1,
      formattedSelectedFile["End Row"] - 1,
      formattedSelectedFile["Start Col"],
      formattedSelectedFile["End Col"],
    );
  };
  const handleIconMouseUp = (event) => {
    event.stopPropagation();
  };
  const sendHandler = async () => {
    // Retrieve the selected template
    const template = dataCtx.allTemplates[0];
    console.log(template);
    // Extract layout parameters and its coordinates
    const layoutParameters = template[0].layoutParameters;
    // layoutParameters.id = data.templateId;
    layoutParameters.numberedExcelJsonFile = data.numberedExcelJsonFile;
    const idpatttern = "000000000000000000000000";
    if (layoutParameters.idMarksPattern === idpatttern) {
      layoutParameters.columnNumber = 1;
      layoutParameters.columnStart = 3;
      layoutParameters.columnStep = 1;
      layoutParameters.rowNumber = 1;
      layoutParameters.rowStart = 1;
      layoutParameters.rowStep = 1;
    }
    const Coordinate = layoutParameters.layoutCoordinates;
    let layoutCoordinates = {};
    // Transform layout coordinates into the required format
    if (Coordinate) {
      layoutCoordinates = {
        right: Coordinate["End Col"],
        end: Coordinate["End Row"],
        left: Coordinate["Start Col"],
        start: Coordinate["Start Row"],
        fieldType: Coordinate["fieldType"],
        name: Coordinate["name"],
      };
    }

    // Extract and format image structure data
    const imageStructureData = layoutParameters.imageStructureData;
    let imageCoordinates = {};
    if (imageStructureData) {
      imageCoordinates = {
        height: imageStructureData.height,
        x: imageStructureData.x,
        y: imageStructureData.y,
        width: imageStructureData.width,
      };
    }

    // Update layout parameters, removing original Coordinate and imageStructureData
    const updatedLayout = {
      ...layoutParameters,
      layoutCoordinates,
      imageCoordinates,
    };
    delete updatedLayout.Coordinate;
    delete updatedLayout.imageStructureData;
    // Extract and format barcode, image, and printing data
    const barcodeData = template[0].barcodeData;
    const imageData = template[0].imageData;
    const printingData = template[0].printingData;

    // Transform question window parameters into the required format
    const questionsWindowParameters =
      template[0].questionsWindowParameters?.map((item) => {
        const { Coordinate, ...rest } = item;
        const questionWindowCoordinates = Coordinate
          ? {
              right: Coordinate["End Col"],
              end: Coordinate["End Row"],
              left: Coordinate["Start Col"],
              start: Coordinate["Start Row"],
              fieldType: Coordinate["fieldType"],
              name: Coordinate["name"],
            }
          : {};
        const columnStart = Coordinate["Start Col"];
        const rowStart = Coordinate["Start Row"];
        return { ...rest, columnStart, rowStart, questionWindowCoordinates };
      });

    // Transform skew marks window parameters into the required format
    const skewMarksWindowParameters =
      template[0].skewMarksWindowParameters?.map((item) => {
        const { Coordinate, ...rest } = item;
        const layoutWindowCoordinates = Coordinate
          ? {
              right: Coordinate["End Col"],
              end: Coordinate["End Row"],
              left: Coordinate["Start Col"],
              start: Coordinate["Start Row"],
              fieldType: Coordinate["fieldType"],
              name: Coordinate["name"],
            }
          : {};
        const columnStart = Coordinate["Start Col"];
        const rowStart = Coordinate["Start Row"];
        return { ...rest, columnStart, rowStart, layoutWindowCoordinates };
      });

    // Transform form field window parameters into the required format
    const formFieldWindowParameters =
      template[0].formFieldWindowParameters?.map((item) => {
        const { Coordinate, ...rest } = item;
        const formFieldCoordinates = Coordinate
          ? {
              right: Coordinate["End Col"],
              end: Coordinate["End Row"],
              left: Coordinate["Start Col"],
              start: Coordinate["Start Row"],
              fieldType: Coordinate["fieldType"],
              name: Coordinate["name"],
            }
          : {};
        return { ...rest, formFieldCoordinates };
      });
    const { imageCroppingDTO, linkedCoordinates } = template[0];
    // Assemble the full request data
    const fullRequestData = {
      layoutParameters: updatedLayout,
      barcodeData,
      imageData,
      printingData,
      questionsWindowParameters: questionsWindowParameters
        ? questionsWindowParameters
        : [],
      skewMarksWindowParameters: skewMarksWindowParameters
        ? skewMarksWindowParameters
        : [],
      formFieldWindowParameters: formFieldWindowParameters
        ? formFieldWindowParameters
        : [],
      imageCroppingDTO: imageCroppingDTO ? imageCroppingDTO : [],
      linkedCoordinates,
    };
    handleCancel();
    sessionStorage.setItem(
      "StructuredTemplate",
      JSON.stringify(fullRequestData),
    );
    sessionStorage.setItem("Template", JSON.stringify(fullRequestData));
  };
  const handleImage = (images) => {
    setImagesSelectedCount(images.length);
  };

  const sensitivityHandler = (num) => {
    console.log(num);
  };

  const saveRegion = (pitchValue, value, copiedNumber) => {
    try {
      console.log(saveRegion);
      if (!value) {
        alert("Please select Position.");
        return;
      }
      if (!pitchValue) {
        alert("Pitch value cannot be blank.");
        return;
      }
      if (!copiedNumber || copiedNumber < 1) {
        alert("Please select a valid number of copies.");
        return;
      }
      if (selectedField.fieldType === "idField") {
        alert("Id Field cannot be copied.");
        return;
      }

      let object = { ...selectedField };

      const MIN_COL = 1;
      const MAX_COL = numCols;
      const MIN_ROW = 1;
      const MAX_ROW = numRows;

      const newCoordinates = [];

      for (let i = 0; i < copiedNumber; i++) {
        let newObject = { ...object };

        switch (value) {
          case "end":
            if (i === 0) {
              newObject.startCol = object.endCol + Number(pitchValue);
            } else {
              newObject.startCol =
                newCoordinates[i - 1].endCol + Number(pitchValue);
            }
            newObject.endCol =
              newObject.startCol + (object.endCol - object.startCol);
            if (newObject.endCol > MAX_COL) {
              alert("Out of bound Error: Column exceeds maximum limit.");
              return;
            }
            break;

          case "top":
            if (i === 0) {
              newObject.startRow =
                object.startRow -
                (object.endRow - object.startRow) -
                Number(pitchValue);
            } else {
              newObject.startRow =
                newCoordinates[i - 1].startRow -
                (object.endRow - object.startRow) -
                Number(pitchValue);
            }
            newObject.endRow =
              newObject.startRow + (object.endRow - object.startRow);
            if (newObject.startRow < MIN_ROW) {
              alert("Out of bound Error: Row exceeds minimum limit.");
              return;
            }
            break;

          case "bottom":
            if (i === 0) {
              newObject.startRow = object.endRow + Number(pitchValue);
            } else {
              newObject.startRow =
                newCoordinates[i - 1].endRow + Number(pitchValue);
            }
            newObject.endRow =
              newObject.startRow + (object.endRow - object.startRow);
            if (newObject.endRow > MAX_ROW) {
              alert("Out of bound Error: Row exceeds maximum limit.");
              return;
            }
            break;

          case "start":
            if (i === 0) {
              newObject.startCol =
                object.startCol -
                (object.endCol - object.startCol) -
                Number(pitchValue);
            } else {
              newObject.startCol =
                newCoordinates[i - 1].startCol -
                (object.endCol - object.startCol) -
                Number(pitchValue);
            }
            newObject.endCol =
              newObject.startCol + (object.endCol - object.startCol);
            if (newObject.startCol < MIN_COL) {
              alert("Out of bound Error: Column exceeds minimum limit.");
              return;
            }
            break;

          default:
            alert("Invalid direction.");
            return;
        }

        newCoordinates.push(newObject);
        let newData = {};
        const layoutData = layoutFieldData.layoutParameters;
        if (
          selectedField.fieldType === "questionField" ||
          selectedField.fieldType === "formField"
        ) {
          const updatedName =
            selectedField.fieldType === "questionField"
              ? questionNameGenerator(selectedField.name, i + 1)
              : selectedField.name;
          newData = {
            Coordinate: {
              "Start Row": newObject?.startRow + 1,
              "Start Col": newObject?.startCol,
              "End Row": newObject?.endRow + 1,
              "End Col": newObject?.endCol,
              name: updatedName,
              fieldType: selectedField.fieldType,
            },
            windowName: updatedName,

            columnStart: +newObject?.startCol,
            columnNumber: +noInCol,
            columnStep: +noOfStepInCol,
            rowStart: +newObject?.startRow + 1,
            rowNumber: +noInRow,
            rowStep: +noOfStepInRow,
            iDirection: +readingDirectionOption,
            iFace: +layoutData.iFace ?? 0,
            iSensitivity: +layoutData.iSensitivity ?? 3,
            iDifference: +layoutData.iDifference ?? 5,
            iOption: blank === "allow" ? 1 : 0,
            iMinimumMarks: +minimumMark,
            iMaximumMarks: +maximumMark,
            iType: type,
            ngAction: windowNgOption,
            totalNumberOfFields: numberOfField,
            numericOrAlphabets: fieldType,
            multipleAllow: multiple,
            multipleValue: multipleValue ? multipleValue : "",
            blankAllow: blank,
            blankValue: blankValue ? blankValue : "",
            customFieldValue: customValue ? customValue : "",
            prefix: selectedFieldType === "formField" ? prefix : "",
            suffix: selectedFieldType === "formField" ? suffix : "",
          };
        } else if (selectedField.fieldType === "skewMarkField") {
          const updatedName =
            selectedField.fieldType === "skewMarkField"
              ? skewQuestionNameGenerator(selectedField.name, i + 1)
              : selectedField.name;
          newData = {
            Coordinate: {
              "Start Row": newObject?.startRow + 1,
              "Start Col": newObject?.startCol,
              "End Row": newObject?.endRow + 1,
              "End Col": newObject?.endCol,
              name: updatedName,
              fieldType: selectedField.fieldType,
            },
            windowName: updatedName,
            columnStart: +newObject?.startCol,
            columnNumber: +noInCol,
            columnStep: +noOfStepInCol,
            rowStart: +newObject?.startRow + 1,
            rowNumber: +noInRow,
            rowStep: +noOfStepInRow,
            iDirection: +readingDirectionOption,
            iFace: +layoutData.iFace ?? 0,
            iSensitivity: +layoutData.iSensitivity ?? 3,
            iDifference: +layoutData.iDifference ?? 5,
            iOption: blank === "allow" ? 1 : 0,
            iMinimumMarks: 1,
            iMaximumMarks: 1,
            iType: type,
            ngAction: windowNgOption,
            skewMark: +skewoption,
            dataRejection: skewoption,
            skewFieldValue: skewFieldValue,
            blankAllow: blank,
            blankValue: blankValue ? blankValue : "",
          };
        } else {
          const updatedName =
            selectedField.fieldType === "questionField"
              ? questionNameGenerator(selectedField.name, i + 1)
              : selectedField.name;
          newData = {
            Coordinate: {
              "Start Row": newObject?.startRow + 1,
              "Start Col": newObject?.startCol,
              "End Row": newObject?.endRow + 1,
              "End Col": newObject?.endCol,
              name: updatedName,
              fieldType: selectedField.fieldType,
            },

            columnStart: +newObject?.startCol,
            columnNumber: +noInCol,
            columnStep: +noOfStepInCol,
            rowStart: +newObject?.startRow + 1,
            rowNumber: +noInRow,
            rowStep: +noOfStepInRow,
            iDirection: +readingDirectionOption,
            idMarksPattern: idNumber.toString(),
          };
        }

        let s = newData.windowName;
        let nums =
          selectedFieldType === "questionField"
            ? s.match(/\d+/g).map(Number)
            : s;
        console.log(nums);

        let questionGroupedData = {};
        let formGroupedData = {};

        if (selectedFieldType === "questionField") {
          questionGroupedData = splitQuestionWindow({
            newData,
            selection,
            nums,
            selectedFieldType,
            readingDirection: +readingDirectionOption,
          });

          // console.log("Grouped Question Data:", questionGroupedData);
        }
        if (selectedFieldType === "formField") {
          formGroupedData = splitFormWindow({
            newData,
            selection,
            nums,
            selectedFieldType,
            readingDirection: +readingDirectionOption,
          });

          // console.log("Grouped Question Data:", questionGroupedData);
        }

         const isFormEmpty =
  Object.keys(formGroupedData || {}).length === 0;

const isQuestionEmpty =
  Object.keys(questionGroupedData || {}).length === 0;

const group = {
  ...newData,
  ...(isFormEmpty
    ? { questionGroupedData }
    : isQuestionEmpty
    ? { formGroupedData }
    : {}),
};

        dataCtx.modifyAllTemplate(0, group, selectedField.fieldType);
      }

      setSelectedCoordinates((prev) => [...prev, ...newCoordinates]);
    } catch (err) {
      console.log(err);
    }
  };
  const saveGroupRegion = (pitchValue, value, copiedNumber) => {
    try {
      //  console.log(saveGroupRegion)
      if (filteredSelectedCoordinate.length === 0) {
        toast.error("Cannot copy the selected fields.");
        return;
      }

      if (!value) {
        alert("Please select Position.");
        return;
      }

      if (!pitchValue) {
        alert("Pitch value cannot be blank.");
        return;
      }

      if (!copiedNumber || copiedNumber < 1) {
        alert("Please select a valid number of copies.");
        return;
      }

      const MIN_COL = 1;
      const MAX_COL = numCols;
      const MIN_ROW = 1;
      const MAX_ROW = numRows;

      const maxEndCol = Math.max(
        ...filteredSelectedCoordinate.map((f) => f.endCol),
      );
      const minStartCol = Math.min(
        ...filteredSelectedCoordinate.map((f) => f.startCol),
      );
      const maxEndRow = Math.max(
        ...filteredSelectedCoordinate.map((f) => f.endRow),
      );
      const minStartRow = Math.min(
        ...filteredSelectedCoordinate.map((f) => f.startRow),
      );

      const groupWidth = maxEndCol - minStartCol + 1;
      const groupHeight = maxEndRow - minStartRow + 1;

      let maxQuestionNumber = 0;

      for (const field of filteredSelectedCoordinate) {
        if (field.fieldType === "questionField") {
          const parts = field.name.split("-");
          const endPart = parts[1]?.match(/\d+/g);
          if (endPart) {
            const numberPart = parseInt(endPart[0], 10);
            if (numberPart > maxQuestionNumber) {
              maxQuestionNumber = numberPart;
            }
          }
        }
      }

      let runningQuestionNumber = maxQuestionNumber + 1;

      for (let i = 1; i <= copiedNumber; i++) {
        let rowShift = 0;
        let colShift = 0;

        switch (value) {
          case "end":
            colShift = i * (groupWidth + Number(pitchValue));
            break;
          case "start":
            colShift = -i * (groupWidth + Number(pitchValue));
            break;
          case "bottom":
            rowShift = i * (groupHeight + Number(pitchValue));
            break;
          case "top":
            rowShift = -i * (groupHeight + Number(pitchValue));
            break;
          default:
            alert("Invalid direction.");
            return;
        }

        for (const field of filteredSelectedCoordinate) {
          if (field.fieldType === "idField") continue;

          let newField = { ...field };
          newField.startRow += rowShift;
          newField.endRow += rowShift;
          newField.startCol += colShift;
          newField.endCol += colShift;

          if (
            newField.startCol < MIN_COL ||
            newField.endCol > MAX_COL ||
            newField.startRow < MIN_ROW ||
            newField.endRow > MAX_ROW
          ) {
            alert("Out of bound Error: Field exceeds grid limit.");
            return;
          }

          let updatedName = field.name;

          if (field.fieldType === "questionField") {
            updatedName = groupQuestionNameGenerator(
              field.name,
              runningQuestionNumber,
            );

            const parts = updatedName.split("-");
            const endPart = parts[1]?.match(/\d+/g);
            if (endPart) {
              runningQuestionNumber = parseInt(endPart[0], 10) + 1;
            }
          }

          const baseCoordinate = {
            "Start Row": newField.startRow + 1,
            "Start Col": newField.startCol,
            "End Row": newField.endRow + 1,
            "End Col": newField.endCol,
            name: updatedName,
            fieldType: field.fieldType,
          };

          const layoutData = layoutFieldData.layoutParameters;

          let newData = {};

          if (
            field.fieldType === "questionField" ||
            field.fieldType === "formField"
          ) {
            newData = {
              Coordinate: baseCoordinate,
              windowName: updatedName,
              columnStart: +newField.startCol,
              columnNumber: +noInCol,
              columnStep: +noOfStepInCol,
              rowStart: +newField.startRow + 1,
              rowNumber: +noInRow,
              rowStep: +noOfStepInRow,
              iDirection: +readingDirectionOption,
              iFace: +layoutData.iFace ?? 0,
              iSensitivity: +layoutData.iSensitivity ?? 3,
              iDifference: +layoutData.iDifference ?? 5,
              iOption: blank === "allow" ? 1 : 0,
              iMinimumMarks: +minimumMark,
              iMaximumMarks: +maximumMark,
              iType: type,
              ngAction: windowNgOption,
              totalNumberOfFields: numberOfField,
              numericOrAlphabets: fieldType,
              multipleAllow: multiple,
              multipleValue: multipleValue || "",
              blankAllow: blank,
              blankValue: blankValue || "",
              customFieldValue: customValue || "",
              prefix: field.fieldType === "formField" ? prefix : "",
              suffix: field.fieldType === "formField" ? suffix : "",
            };
          } else if (field.fieldType === "skewMarkField") {
            newData = {
              Coordinate: baseCoordinate,
              windowName: updatedName,
              columnStart: +newField.startCol,
              columnNumber: +noInCol,
              columnStep: +noOfStepInCol,
              rowStart: +newField.startRow + 1,
              rowNumber: +noInRow,
              rowStep: +noOfStepInRow,
              iDirection: +readingDirectionOption,
              iFace: +layoutData.iFace ?? 0,
              iSensitivity: +layoutData.iSensitivity ?? 3,
              iDifference: +layoutData.iDifference ?? 5,
              iOption: blank === "allow" ? 1 : 0,
              iMinimumMarks: 1,
              iMaximumMarks: 1,
              iType: type,
              ngAction: windowNgOption,
              skewMark: +skewoption,
              dataRejection: skewoption,
              skewFieldValue: skewFieldValue,
              blankAllow: blank,
              blankValue: blankValue ? blankValue : "",
            };
          } else {
            newData = {
              Coordinate: baseCoordinate,
              columnStart: +newField.startCol,
              columnNumber: +noInCol,
              columnStep: +noOfStepInCol,
              rowStart: +newField.startRow + 1,
              rowNumber: +noInRow,
              rowStep: +noOfStepInRow,
              iDirection: +readingDirectionOption,
              idMarksPattern: idNumber.toString(),
            };
          }

          let s = newData.windowName;
          let nums =
            selectedFieldType === "questionField"
              ? s.match(/\d+/g).map(Number)
              : s;
          console.log(nums);

          let questionGroupedData = {};
          let formGroupedData = {};

          if (selectedFieldType === "questionField") {
            questionGroupedData = splitQuestionWindow({
              newData,
              selection,
              nums,
              selectedFieldType,
              readingDirection: +readingDirectionOption,
            });

            // console.log("Grouped Question Data:", questionGroupedData);
          }

          if (selectedFieldType === "formField") {
            formGroupedData = splitFormWindow({
              newData,
              selection,
              nums,
              selectedFieldType,
              readingDirection: +readingDirectionOption,
            });

            // console.log("Grouped Question Data:", questionGroupedData);
          }

         const isFormEmpty = Object.keys(formGroupedData || {}).length === 0;

      const isQuestionEmpty =
        Object.keys(questionGroupedData || {}).length === 0;

      const group = {
        ...newData,
        ...(isFormEmpty
          ? { questionGroupedData }
          : isQuestionEmpty
            ? { formGroupedData }
            : {}),
      };

          dataCtx.modifyAllTemplate(0, group, field.fieldType);
          setSelectedCoordinates((prev) => [...prev, newField]);
        }
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  // console.log(dataCtx.allTemplates[0][0]?.layoutParameters?.layoutName);

  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 99 }}>
        <SmallHeader text={"template 1"} />
      </div>

      {/* section for showing layout name */}
      <div
        style={{
          position: isWideScreen ? "fixed" : "absolute",
          top: "5px",
          left: "10px",
          marginTop: "8px",
          zIndex: "999",
          backgroundColor: "#f8f9fa", // Light grey background
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
          border: "1px solid #dee2e6", // Light border for structure
        }}
      >
        <nav
          style={{ "--bs-breadcrumb-divider": "'>'" }}
          aria-label="breadcrumb"
        >
          <ol className="breadcrumb mb-0" style={{ fontSize: "0.9rem" }}>
            <li
              className="breadcrumb-item"
              style={{
                fontWeight: "600",
                color: "#0d6efd", // Bootstrap primary blue
              }}
              aria-current="page"
            >
              Layout Name:&nbsp;
              <span style={{ color: "#212529" }}>
                {dataCtx.allTemplates[0][0]?.layoutParameters?.layoutName}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <div
        style={{
          position: isWideScreen ? "fixed" : "absolute",
          top: "15px",
          left: isWideScreen ? "50%" : "10%",
          transform: isWideScreen ? "translateX(-50%)" : "none",
          zIndex: "999",
        }}
      >
        <Container fluid>
          <Row className="justify-content-center">
            <Col xs="auto">
              <Button
                variant="primary"
                onClick={() => {
                  setImageModalShow(true);
                }}
                className="position-relative"
              >
                Image Area
                <Badge
                  pill
                  variant="light"
                  className="position-absolute"
                  style={{
                    top: "-5px",
                    right: "-5px",
                    transform: "translate(50%, -50%)",
                  }}
                >
                  {imagesSelectedCount}
                </Badge>
              </Button>
            </Col>
            <Col xs="auto">
              <Button
                variant="secondary"
                onClick={() => {
                  setDetailPage(true);
                }}
              >
                Layout details
              </Button>
            </Col>
            <Col xs="auto">
              <Button
                variant="success"
                onClick={() => {
                  setShowFieldDetails(true);
                }}
              >
                Field Details
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      {!modalShow && selection && (
        <Button
          onClick={() => {
            setModalShow(true);
          }}
          variant="default"
          style={{
            position: "fixed",
            bottom: "50px", // Adjust the top value as needed
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: "999",
          }}
        >
          Show Modal
        </Button>
      )}
      <div style={{ height: "80%" }}>
        <div style={{ height: "97%", overflow: "auto", width: "100%" }}>
          <div className="main-container">
            <div className="containers" style={{ marginBottom: "10rem" }}>
              <div className="d-flex">
                <div style={{ marginRight: "0.5rem", marginTop: "0.5rem" }}>
                  <div className="top"></div>
                  {Array.from({ length: numRows }).map((_, rowIndex) => (
                    <div
                      key={rowIndex}
                      className={
                        data.bubbleType === "circle"
                          ? "left-nums-circle"
                          : "left-nums"
                      }
                    >
                      {rowIndex + 1}
                    </div>
                  ))}
                </div>
                <div>
                  <div
                    className="top-row"
                    style={{
                      position: "",
                      // top: 120,
                      zIndex: 10,
                      // backgroundColor: "white",
                    }}
                  >
                    <div className="corner"></div>
                    {Array.from({ length: numCols }).map((_, index) => (
                      <div key={index} className="top-num ">
                        {index + 1}
                      </div>
                    ))}
                  </div>

                  <div
                    id="grid-div"
                    style={{
                      border: "2px solid black",
                      marginTop: "0.5rem",
                      paddingTop: "1rem",
                      paddingRight: "1.2rem",
                      paddingLeft: "1rem",
                      paddingBottom: "1rem",
                      overflowY: "auto",
                      width: "max-content",
                    }}
                  >
                    <div
                      className="grid"
                      ref={imageRef}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}
                    >
                      {Array.from({ length: numRows }).map((_, rowIndex) => {
                        const result = [
                          ...data.excelJsonFile.map(Object.values),
                        ];

                        const numberedJson = [
                          ...data.numberedExcelJsonFile.map(Object.values),
                        ];
                        return (
                          <div
                            key={rowIndex}
                            className="row"
                            style={{ overflowX: "auto", position: "relative" }}
                          >
                            <div
                              className={
                                data.bubbleType === "circle"
                                  ? "left-num-circle"
                                  : "left-num"
                              }
                              style={{
                                position: "sticky",
                                position: "-webkit-sticky",
                              }}
                            >
                              <div className="timing-mark "></div>
                            </div>
                            {Array.from({ length: numCols }).map(
                              (_, colIndex) => {
                                const num =
                                  (numberedJson[rowIndex] &&
                                    numberedJson[rowIndex][colIndex]) !==
                                  undefined
                                    ? numberedJson[rowIndex][colIndex]
                                    : null;
                                const value = result[rowIndex][colIndex];

                                let bgColor =
                                  +result[rowIndex][colIndex] >=
                                    +data.iSensitivity &&
                                  result[rowIndex][colIndex] !== undefined
                                    ? "black"
                                    : "";
                                if (num || num === 0) {
                                  bgColor = "lightgreen";
                                }

                                // Font color logic
                                let fontColor =
                                  rowIndex < result.length &&
                                  colIndex < result[rowIndex].length &&
                                  value != 0 &&
                                  value !== undefined
                                    ? "black"
                                    : "black";
                                if (num === 0) {
                                  fontColor = "black";
                                }

                                return (
                                  <div
                                    key={colIndex}
                                    style={{
                                      backgroundColor: bgColor,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize:
                                        data.bubbleType === "circle"
                                          ? "12px"
                                          : "8px",
                                      color: fontColor,
                                      userSelect: "none",
                                    }}
                                    className={`${data.bubbleType} ${
                                      selected[`${rowIndex},${colIndex}`]
                                        ? "selected"
                                        : ""
                                    }`}
                                  >
                                    {(numberedJson[rowIndex] &&
                                      numberedJson[rowIndex][colIndex]) !==
                                    undefined
                                      ? numberedJson[rowIndex][colIndex]
                                      : null}
                                  </div>
                                );
                              },
                            )}
                          </div>
                        );
                      })}

                      {selectedCoordinates.map((data, index) => {
                        const imageWidth =
                          imageRef.current.getBoundingClientRect().width;
                        const imageHeight =
                          imageRef.current.getBoundingClientRect().height;

                        const boxLeft =
                          data.startCol * (imageWidth / numCols) - 4;
                        const boxTop =
                          data.startRow * (imageHeight / numRows) - 3;

                        const boxWidth =
                          (data.endCol - data.startCol + 1) *
                          (imageWidth / numCols);
                        const boxHeight =
                          (data.endRow - data.startRow + 1) *
                          (imageHeight / numRows + 0.1);

                        const isSelected = _.isEqual(
                          data,
                          currentSelectedCoordinate,
                        );
                        const borderColor = isSelected ? "red" : "#007bff";

                        return (
                          <div key={index} style={{ position: "absolute" }}>
                            {/* Label Positioned Outside without Margin */}
                            <div
                              style={{
                                position: "absolute",
                                left: `${boxLeft}px`,
                                top: `${boxTop - 22}px`, // Move label directly above the box (no margin)
                                backgroundColor: "#000000", // Good contrast background
                                color: "white",
                                fontSize: "12px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                border: `2px solid ${borderColor}`, // Match the box border color
                                whiteSpace: "nowrap",
                                zIndex: 5,
                                cursor: "default",
                              }}
                              onClick={(e) => e.stopPropagation()} // Prevent click propagation
                            >
                              {data.name}
                            </div>

                            {/* Main Rectangle */}
                            <div
                              ref={(el) => (divRefs.current[index] = el)}
                              onDoubleClick={() => handleEyeClick(data, index)}
                              onClick={() => setCurrentSelectedCoordinate(data)}
                              onDragStart={(e) => e.preventDefault()}
                              style={{
                                border: `3px solid ${borderColor}`,
                                position: "absolute",
                                overflow: "hidden",
                                left: `${boxLeft}px`,
                                top: `${boxTop}px`,
                                width: `${boxWidth}px`,
                                height: `${boxHeight}px`,
                              }}
                            ></div>
                          </div>
                        );
                      })}

                      {linkFields.map((data, index) => {
                        const border =
                          currentLinkField === index
                            ? "4px dashed red"
                            : "4px dashed rgb(142, 95, 218)";
                        const boxShadow =
                          currentLinkField === index
                            ? "0 0 5px rgba(255, 0, 0, 0.5)"
                            : "";
                        return (
                          <div
                            key={index}
                            ref={(el) => (divRefs.current[index] = el)}
                            className="border-blue-900"
                            style={{
                              border,
                              boxShadow,
                              pointerEvents: "none",
                              position: "absolute",
                              overflow: "hidden",
                              padding: "10px",
                              left: `${
                                data.minStartCol *
                                  (imageRef.current.getBoundingClientRect()
                                    .width /
                                    numCols) -
                                4
                              }px`,
                              top: `${
                                data.minStartRow *
                                  (imageRef.current.getBoundingClientRect()
                                    .height /
                                    numRows) -
                                3
                              }px`,
                              width: `${
                                (data.maxEndCol - data.minStartCol + 1) *
                                (imageRef.current.getBoundingClientRect()
                                  .width /
                                  numCols)
                              }px`,
                              height: `${
                                (data.maxEndRow - data.minStartRow + 1) *
                                (imageRef.current.getBoundingClientRect()
                                  .height /
                                  numRows +
                                  0.1)
                              }px`,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          ></div>
                        );
                      })}
                      {selection && (
                        <div
                          className="border-green-700"
                          style={{
                            border: !highlightField
                              ? "2px solid green"
                              : "2px solid red",

                            position: "absolute",
                            left: `${
                              selection.startCol *
                                (imageRef.current.getBoundingClientRect()
                                  .width /
                                  numCols) -
                              4
                            }px`,
                            top: `${
                              selection.startRow *
                                (imageRef.current.getBoundingClientRect()
                                  .height /
                                  numRows) -
                              3
                            }px`,
                            width: `${
                              (selection.endCol - selection.startCol + 1) *
                              (imageRef.current.getBoundingClientRect().width /
                                numCols)
                            }px`,
                            height: `${
                              (selection.endRow - selection.startRow + 1) *
                              (imageRef.current.getBoundingClientRect().height /
                                numRows)
                            }px`,
                            content: "question field",
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100vw", // ✅ CONSTRAINT
            maxWidth: "100vw", // ✅ CONSTRAINT
            overflowX: "auto", // ✅ SCROLL HERE
            zIndex: 998,
            background: "white",
          }}
        >
          <ExcelLikeTable
            handleEyeClick={handleEyeClick}
            linkFields={linkFields}
            selected={selectedCoordinates}
            handleSingleSelect={(item) => setCurrentSelectedCoordinate(item)}
            currentSelectedCoordinate={currentSelectedCoordinate}
          />
        </div>
      </div>

      <CustomDraggableModal
        show={modalShow}
        size="md"
        onClose={() => {
          handleCancel();
        }}
      >
        <CustomDraggableModal.Header>
          <div style={{ width: "100%" }}>
            {modalUpdate && (
              <h2
                className="text-center text-uppercase pt-2 fw-semibold fs-1"
                style={{
                  letterSpacing: "0.5px",
                  fontSize: "1.7rem",
                  color: "rgba(255, 128, 0)",
                }}
              >
                {!modalUpdate
                  ? "Choose field type"
                  : selectedFieldType === "formField"
                    ? "Form Properties"
                    : selectedFieldType === "questionField"
                      ? "Question Properties"
                      : selectedFieldType === "skewMarkField"
                        ? "Skew Properties"
                        : selectedFieldType === "idField"
                          ? "ID Properties"
                          : ""}
              </h2>
            )}
            {!selectedFieldType && (
              <>
                <h2
                  className="text-center"
                  style={{ color: "rgba(255, 128, 0)" }}
                >
                  {!modalUpdate ? "Choose field type" : selectedFieldType}
                </h2>
                <br />
              </>
            )}
            {!modalUpdate && (
              <div className="d-flex justify-content-center">
                <Row
                  className="mb-2 align-items-center flex-nowrap"
                  style={{ width: "auto", overflowX: "auto" }}
                >
                  <Col md="auto" className="d-flex align-items-center">
                    <label
                      htmlFor="formField"
                      className="mr-2 mb-0 field-label"
                    >
                      Form:
                    </label>
                    <input
                      id="formField"
                      type="radio"
                      name="fieldType"
                      value="formField"
                      checked={selectedFieldType === "formField"}
                      onChange={handleRadioChange}
                      className="field-label"
                      style={{ accentColor: "rgba(255, 128, 0)" }}
                    />
                  </Col>

                  <Col md="auto" className="d-flex align-items-center">
                    <label
                      htmlFor="fieldType"
                      className="mr-2 mb-0 field-label"
                    >
                      Question:
                    </label>
                    <input
                      id="fieldType"
                      type="radio"
                      name="fieldType"
                      value="questionField"
                      checked={selectedFieldType === "questionField"}
                      onChange={handleRadioChange}
                      className="field-label"
                      style={{ accentColor: "rgba(255, 128, 0)" }}
                    />
                  </Col>

                  <Col md="auto" className="d-flex align-items-center">
                    <label
                      htmlFor="skewMarkField"
                      className="mr-2 mb-0 field-label"
                    >
                      Skew Mark:
                    </label>
                    <input
                      id="skewMarkField"
                      type="radio"
                      name="fieldType"
                      value="skewMarkField"
                      checked={selectedFieldType === "skewMarkField"}
                      onChange={handleRadioChange}
                      className="field-label"
                      style={{ accentColor: "rgba(255, 128, 0)" }}
                    />
                  </Col>

                  <Col md="auto" className="d-flex align-items-center">
                    <label htmlFor="idField" className="mr-2 mb-0 field-label">
                      ID Mark:
                    </label>
                    <input
                      id="idField"
                      type="radio"
                      name="fieldType"
                      value="idField"
                      checked={selectedFieldType === "idField"}
                      onChange={handleRadioChange}
                      className="field-label"
                      disabled={idSelectionCount > 0}
                      style={{ accentColor: "rgba(255, 128, 0)" }}
                    />
                    {idSelectionCount > 0 && (
                      <small style={{ color: "orangered", marginLeft: "5px" }}>
                        already selected
                      </small>
                    )}
                  </Col>
                </Row>
              </div>
            )}
          </div>
        </CustomDraggableModal.Header>
        <CustomDraggableModal.Body>
          {selectedFieldType && (
            <div>
              {selectedFieldType !== "idField" && (
                <Row className="mb-2">
                  <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label "
                    style={{ fontSize: "0.8rem" }}
                  >
                    Window Name
                  </label>
                  <div className="col-md-10">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={
                        selectedFieldType === "questionField"
                          ? "Enter Question Range (e.g., Q1–Q2)"
                          : "Enter Window Name"
                      }
                      ref={inputRef}
                      value={name}
                      onChange={(e) => {
                        const inputValue = e.target.value;

                        // Prevent setting value if first character is a space
                        if (inputValue.length === 1 && inputValue === " ") {
                          return;
                        }

                        setName(inputValue);
                      }}
                      // onBlur={(e) => {
                      //   const value = e.target.value;

                      //   if (selectedFieldType === "questionField") {
                      //     const isValid = /^Q\d+\s*[-–]\s*Q\d+$/i.test(value);

                      //     if (!isValid && value.trim() !== "") {
                      //       toast.warn(
                      //         "Invalid format. Please enter in Q1–Q2 format.",
                      //       );
                      //       inputRef.current?.focus();
                      //     }
                      //   }
                      // }}
                      required
                      style={{ color: "black" }}
                    />
                  </div>
                </Row>
              )}
              {(selectedFieldType === "questionField" ||
                selectedFieldType === "formField") && (
                <Row className="mb-2">
                  <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Grid
                  </label>
                  <div
                    className={multiple !== "allow" ? "col-md-4" : "col-md-10"}
                  >
                    <select
                      className="form-control"
                      value={multiple}
                      onChange={(e) => {
                        setMultiple(e.target.value);
                        if (e.target.value === "not allow") {
                          setTimeout(() => {
                            gridRef?.current?.focus();
                          }, 100);
                        }
                      }}
                      defaultValue={""}
                    >
                      <option value="" disabled hidden>
                        Select Grid Option..
                      </option>
                      <option value="allow">Allow All</option>
                      <option value="not allow">Allow None</option>
                    </select>
                  </div>
                  {multiple !== "allow" && (
                    <>
                      <label
                        htmlFor="example-text-input"
                        className="col-md-2 col-form-label"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Grid Value
                      </label>
                      <div className="col-md-4">
                        <input
                          type="text"
                          ref={gridRef}
                          maxLength={1}
                          className="form-control"
                          placeholder="Character of Multiple"
                          value={multipleValue}
                          onChange={(e) => setMultipleValue(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}
                </Row>
              )}
              {(selectedFieldType === "questionField" ||
                selectedFieldType === "formField" ||
                selectedFieldType === "skewMarkField") && (
                <Row className="mb-2">
                  <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Blanks
                  </label>
                  <div className={blank !== "allow" ? "col-md-4" : "col-md-10"}>
                    <select
                      className="form-control"
                      value={blank}
                      onChange={(e) => {
                        setBlank(e.target.value);
                        if (e.target.value === "not allow") {
                          setBlankValue(" ");
                          setTimeout(() => {
                            blankRef.current.focus();
                          }, 100);
                        }
                      }}
                      defaultValue={""}
                    >
                      <option value="" disabled hidden>
                        Select Blank Option...
                      </option>
                      <option value="allow">Allow All</option>
                      <option value="not allow">Allow None</option>
                    </select>
                  </div>
                  {blank !== "allow" && (
                    <>
                      <label
                        htmlFor="example-text-input"
                        className="col-md-2 col-form-label"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Blank Value
                      </label>
                      <div className="col-md-4">
                        <input
                          type="text"
                          ref={blankRef}
                          maxLength={1}
                          className="form-control"
                          placeholder="Character of Blank"
                          value={blankValue}
                          onChange={(e) => setBlankValue(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}
                </Row>
              )}
              {(selectedFieldType !== "idField" ||
                selectedFieldType !== "skewMarkField") && (
                <Row className="mb-2">
                  <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Exception
                  </label>
                  <div className="col-md-10">
                    <select
                      className="form-control"
                      value={windowNgOption}
                      onChange={handleWindowNgOptionChange}
                      defaultValue={""}
                    >
                      <option value="" disabled hidden>
                        Select An Action For Exception Handling...
                      </option>
                      <option value="0x00000001">Use Rejector</option>
                      <option value="0x00000002">Do Not Use Rejector</option>
                      <option value="0x00000004">No Action</option>
                    </select>
                  </div>
                </Row>
              )}

              {(selectedFieldType !== "idField" ||
                selectedFieldType !== "skewMarkField") && (
                <Row className="mb-2">
                  <label
                    htmlFor="field-formatting"
                    className="col-md-2 col-form-label"
                    style={{ fontSize: "0.8rem" }}
                  >
                    show marks
                  </label>
                  <div className="col-10 d-flex align-items-center gap-3">
                    {/* Switch toggle */}
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="enable-marks"
                        checked={marksFields}
                        onChange={(e) => setmarksFields(e.target.checked)}
                      />
                      <label
                        className="form-check-label ms-2"
                        htmlFor="enable-formatting"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        Enable
                      </label>
                    </div>
                  </div>
                </Row>
              )}
              {(selectedFieldType !== "idField" ||
                selectedFieldType !== "skewMarkField") &&
                marksFields && (
                  <Row className="mb-2">
                    <label
                      htmlFor="example-text-input"
                      className="col-md-2 col-form-label"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Minimum Marks
                    </label>
                    <div className="col-md-4">
                      <input
                        type="number"
                        className="form-control"
                        value={minimumMark}
                        onChange={(e) => setMinimumMark(e.target.value)}
                      />
                    </div>
                    <label
                      htmlFor="example-text-input"
                      className="col-md-2 col-form-label"
                      style={{ fontSize: "0.8rem" }}
                    >
                      Maximum Marks
                    </label>
                    <div className="col-md-4">
                      <input
                        type="number"
                        className="form-control"
                        value={maximumMark}
                        onChange={(e) => setMaximumMark(e.target.value)}
                      />
                    </div>
                  </Row>
                )}
              <Row className="mb-3">
                <label
                  htmlFor="example-text-input"
                  className="col-md-2 col-form-label  "
                  style={{ fontSize: ".9rem" }}
                >
                  Sensitivity
                </label>
                <div
                  className="col-md-3"
                  style={{
                    display: "flex",
                    gap: "5px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        borderRadius: "6px",
                        overflow: "hidden",
                      }}
                    >
                      <ShadesOfGrey type="reverse" />
                    </div>
                    <Box
                      sx={{
                        width: "94%",
                        justifyContent: "center",
                        alignSelf: "center",
                      }}
                    >
                      <Slider
                        getAriaLabel={() => "Sensitivity range"}
                        // value={17 - value}
                        value={17 - fieldSensitivity}
                        onChange={(event, newValue) => {
                          const val = 17 - newValue;
                          if (fieldDifference + val > 17) {
                            return;
                          }
                          setFieldSensitivity(val);
                        }}
                        valueLabelDisplay="auto"
                        min={1}
                        max={16}
                        step={1}
                        scale={(x) => 17 - x} // This reverses the displayed value
                        size="small"
                        color="PRIMARY"
                        slots={{
                          ValueLabel: (props) => (
                            <CustomTooltip
                              {...props}
                              // shade={getShadeFromValue(value)}
                            />
                          ),
                        }}
                      />
                    </Box>
                  </div>
                </div>
                <input
                  value={`${fieldSensitivity}`}
                  style={{
                    width: "100%",
                    padding: "2px",
                    textAlign: "center",
                  }}
                  className="form-control col-md-1"
                  type="text"
                  disabled
                />

                <label
                  htmlFor="example-text-input"
                  className="col-md-2 col-form-label  "
                  style={{ fontSize: ".9rem" }}
                >
                  Density
                </label>
                <div
                  className="col-md-3"
                  style={{
                    display: "flex",
                    gap: "5px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        borderRadius: "6px",
                        overflow: "hidden",
                      }}
                    >
                      <ShadesOfGrey type="normal" />
                    </div>
                    <Box
                      sx={{
                        width: "94%",
                        justifyContent: "center",
                        alignSelf: "center",
                      }}
                    >
                      <Slider
                        getAriaLabel={() => "Sensitivity range"}
                        value={17 - fieldDifference}
                        onChange={(event, newValue) => {
                          const val = 17 - newValue;

                          if (fieldSensitivity + val > 17) {
                            return;
                          }
                          setFieldDifference(val);
                          // handleChange(val);
                        }}
                        valueLabelDisplay="auto"
                        min={1}
                        max={16}
                        step={1}
                        scale={(x) => 17 - x} // This reverses the displayed value
                        size="small"
                        color="PRIMARY"
                        slots={{
                          ValueLabel: (props) => (
                            <CustomTooltip
                              {...props}
                              // shade={getShadeFromValue(value)}
                            />
                          ),
                        }}
                      />
                    </Box>
                  </div>
                </div>
                <input
                  value={`${fieldDifference}`}
                  style={{
                    textAlign: "center",
                  }}
                  className="form-control col-md-1"
                  type="text"
                  disabled
                />
              </Row>
              {selectedFieldType === "idField" && (
                <Row className="mb-2">
                  <label
                    className="col-md-2 col-form-label "
                    style={{ fontSize: "0.8rem" }}
                  >
                    Set Id Pattern
                  </label>

                  <div className="col-md-2">
                    <select
                      value={idType}
                      onChange={(e) => {
                        setIdType(e.target.value);
                      }}
                      className=" form-control"
                    >
                      <option value="Row">Row</option>
                      <option value="Col">Col</option>
                    </select>
                  </div>
                  <label
                    htmlFor="example-select-input"
                    className="col-md-2 col-form-label"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Id selection
                  </label>
                  <div className="col-md-6">
                    <MultiSelect
                      options={options}
                      value={selectedCol}
                      onChange={setSelectedCol}
                      labelledBy="Select"
                    />
                  </div>
                </Row>
              )}
              {selectedFieldType === "skewMarkField" && (
                <Row className="mb-2">
                  <label
                    htmlFor="example-select-input"
                    className="col-md-2 col-form-label"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Data Rejection
                  </label>
                  <div className="col-md-4">
                    <select
                      className="form-control"
                      value={skewoption}
                      onChange={handleSkewMarkOptionChange}
                      defaultValue={"none"}
                    >
                      <option value="">
                        Select a Data Rejection Option...
                      </option>
                      <option value="use">Mark as Exception</option>
                      <option value="not use">Do Not Mark as Exception</option>
                    </select>
                  </div>
                  <label
                    htmlFor="example-select-input"
                    className="col-md-2 col-form-label"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Field Value
                  </label>
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      value={skewFieldValue}
                      onChange={(e) => {
                        setSkewFieldValue(e.target.value);
                      }}
                    />
                  </div>
                </Row>
              )}

              <Row className="mb-2">
                <label
                  htmlFor="example-select-input"
                  className="col-2 col-form-label"
                  style={{ fontSize: "0.8rem" }}
                >
                  Start Row
                </label>
                <div className="col-2 ">
                  <input
                    id="startRow"
                    type="text"
                    value={startRowInput}
                    onBlur={(e) => {
                      const newValue = Number(e.target.value); // Ensure it's a number
                      // console.log(newValue);

                      if (newValue > 0) {
                        setSelection((item) => ({
                          ...item,
                          startRow: newValue - 1,
                        }));
                      } else {
                        // Reset to previous valid value
                        setStartRowInput(selection.startRow + 1);
                      }
                    }}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^0-9]/g, ""); // Strip non-numeric

                      if (value === "") {
                        // If input is empty, reset to empty string to allow typing
                        setStartRowInput("");
                        return;
                      }

                      const numericValue = Number(value);
                      // console.log(typeof numericValue); // This will now always be 'number'
                      setStartRowInput(numericValue);
                    }}
                    className="form-control"
                  />
                </div>
                <label
                  htmlFor="example-select-input"
                  className="col-2 col-form-label"
                  style={{ fontSize: "0.8rem" }}
                >
                  End Row
                </label>
                <div className="col-2">
                  <input
                    type="text"
                    value={endRowInput}
                    // disabled={modalUpdate}
                    onBlur={(e) => {
                      const newValue = Number(e.target.value);
                      if (newValue > 0) {
                        setSelection((item) => ({
                          ...item,
                          endRow: newValue - 1,
                        }));
                      } else {
                        // Reset to previous valid value
                        setEndRowInput(selection?.endRow + 1);
                      }
                    }}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(
                        /[^0-9]/g,
                        "",
                      );
                      if (numericValue === "") {
                        setEndRowInput("");
                      } else {
                        setEndRowInput(Number(numericValue));
                      }
                    }}
                    className="form-control"
                  />
                </div>
                <label
                  htmlFor="example-select-input"
                  className="col-2 col-form-label"
                  style={{ fontSize: "0.8rem" }}
                >
                  Total Row
                </label>
                <div className="col-2">
                  <input value={numRows} readOnly className="form-control" />
                </div>
              </Row>
              <Row className="">
                <label
                  htmlFor="example-select-input"
                  className="col-2 col-form-label"
                  style={{ fontSize: "0.8rem" }}
                >
                  Steps In Row
                </label>
                <div className="col-4">
                  <BootstrapNumberInput
                    value={noOfStepInRow}
                    setValue={setNoOfStepInRow}
                    start={+startRowInput}
                    end={+endRowInput}
                    // setDerivedValue={setNoInRow}
                    id="step-in-row"
                  />
                </div>
                <label
                  htmlFor="example-select-input"
                  className="col-2 col-form-label "
                  style={{ fontSize: "0.8rem" }}
                >
                  Total Per Row
                </label>
                <div className="col-4">
                  <input
                    type="number"
                    className="form-control"
                    value={noInRow}
                    onChange={(e) => setNoInRow(e.target.value)}
                    // required
                    disabled
                  />
                </div>
              </Row>
              <Row className="mb-2">
                {/* Start Column */}
                <label
                  htmlFor="startCol"
                  className="col-2 col-form-label"
                  style={{ fontSize: "0.8rem" }}
                >
                  Start Col
                </label>
                <div className="col-2">
                  <input
                    id="startCol"
                    type="text"
                    value={startColInput}
                    onBlur={(e) => {
                      const newValue = Number(e.target.value);
                      if (newValue > 0) {
                        setSelection((item) => ({
                          ...item,
                          startCol: newValue,
                        }));
                      } else {
                        setStartColInput(selection?.startCol); // Reset to previous valid value
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      if (value === "") {
                        setStartColInput("");
                      } else {
                        setStartColInput(Number(value));
                      }
                    }}
                    className="form-control"
                  />
                </div>

                {/* End Column */}
                <label
                  htmlFor="endCol"
                  className="col-2 col-form-label"
                  style={{ fontSize: "0.8rem" }}
                >
                  End Col
                </label>
                <div className="col-2">
                  <input
                    id="endCol"
                    type="text"
                    value={endColInput}
                    onBlur={(e) => {
                      const newValue = Number(e.target.value);
                      if (newValue > 0) {
                        setSelection((item) => ({
                          ...item,
                          endCol: newValue,
                        }));
                      } else {
                        setEndColInput(selection?.endCol); // Reset to previous valid value
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      if (value === "") {
                        setEndColInput("");
                      } else {
                        const numericValue = Number(value);
                        setEndColInput(numericValue);
                        // setMaximumMark(numericValue);
                      }
                    }}
                    className="form-control"
                  />
                </div>

                {/* Total Column */}
                <label
                  htmlFor="totalCol"
                  className="col-2 col-form-label"
                  style={{ fontSize: "0.8rem" }}
                >
                  Total Column
                </label>
                <div className="col-2">
                  <input
                    id="totalCol"
                    value={numCols}
                    readOnly
                    className="form-control"
                  />
                </div>
              </Row>
              <Row className="mb-2">
                <label
                  htmlFor="example-select-input"
                  className="col-2 col-form-label"
                  style={{ fontSize: "0.8rem" }}
                >
                  Steps In Column
                </label>
                <div className="col-4">
                  <BootstrapNumberInput
                    value={noOfStepInCol}
                    setValue={setNoOfStepInCol}
                    start={startColInput}
                    end={endColInput}
                    // setDerivedValue={setNoInCol}
                    id="step-in-col"
                  />
                </div>
                <label
                  htmlFor="example-select-input"
                  className="col-2 col-form-label"
                  style={{ fontSize: "0.8rem" }}
                >
                  Total Per Column
                </label>
                <div className="col-4">
                  <input
                    type="number"
                    className="form-control"
                    value={noInCol}
                    onChange={(e) => setNoInCol(e.target.value)}
                    required
                    disabled
                  />
                </div>
              </Row>

              <Row className="mb-2">
                <label
                  htmlFor="example-text-input"
                  className="col-md-2 col-form-label"
                  style={{ fontSize: "0.8rem" }}
                >
                  Read Direction
                </label>
                <div className="col-10">
                  <select
                    className="form-control"
                    value={readingDirectionOption}
                    onChange={(e) => {
                      if (e.target.value == 0 || e.target.value == 2) {
                        const sum = (+endRowInput - +startRowInput) / noInRow;
                        // console.log(sum);
                        setNumberOfField(
                          Math.ceil(
                            (+endRowInput - +startRowInput + 1) / noOfStepInRow,
                          ),
                        );
                        setMaximumMark( Math.ceil(
                            (+endRowInput - +startRowInput + 1) / noOfStepInRow,
                          ),)
                      } else {
                        setNumberOfField(
                          Math.ceil(
                            (+endColInput - +startColInput + 1) / noOfStepInCol,
                          ),
                        );
                        setMaximumMark(
                          Math.ceil(
                            (+endColInput - +startColInput + 1) / noOfStepInCol,
                          ),
                        )
                      }
                      setReadingDirectionOption(e.target.value);
                    }}
                    defaultValue={""}
                  >
                    <option value="" disabled hidden>
                      Select Reading Direction...{" "}
                    </option>
                    <option value="0">From Top To Bottom</option>
                    <option value="2">From Bottom To Top</option>
                    <option value="4">From Left To Right</option>
                    <option value="5">From Right To Left</option>
                  </select>
                </div>
              </Row>

              {(selectedFieldType === "questionField" ||
                selectedFieldType === "formField") && (
                <Row className="mb-2">
                  <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label "
                    style={{ fontSize: "0.8rem" }}
                  >
                    Total Fields
                  </label>
                  <div className="col-4 ">
                    <input
                      type="text"
                      className="form-control"
                      value={numberOfField}
                      onChange={(e) => {
                        // Allow only numeric input (including empty input)
                        const numericValue = e.target.value.replace(
                          /[^0-9]/g,
                          "",
                        );
                        setNumberOfField(numericValue);
                        
                      }}
                      required
                    />
                  </div>
                  <label
                    htmlFor="example-text-input"
                    className="col-md-2 col-form-label "
                    style={{ fontSize: "0.8rem" }}
                  >
                    Field Type
                  </label>
                  <div className="col-4 ">
                    <select
                      className="form-control"
                      value={fieldType}
                      onChange={(e) => {
                        setFieldType(e.target.value);
                      }}
                      defaultValue={""}
                    >
                      <option value="" disabled hidden>
                        Select Field Type...{" "}
                      </option>
                      <option value="numeric">Numeric </option>
                      <option value="alphabet">Alphabet </option>
                      <option value="binary">Litho code</option>
                      <option value="custom">Custom </option>
                    </select>
                  </div>
                </Row>
              )}
              {selectedFieldType === "formField" && (
                <Row className="mb-2">
                  <label
                    htmlFor="field-formatting"
                    className="col-md-2 col-form-label"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Field Formatting
                  </label>
                  <div className="col-10 d-flex align-items-center gap-3">
                    {/* Switch toggle */}
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="enable-formatting"
                        checked={enableFormatting}
                        onChange={(e) => setEnableFormatting(e.target.checked)}
                      />
                      <label
                        className="form-check-label ms-2"
                        htmlFor="enable-formatting"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        Enable
                      </label>
                    </div>

                    {/* Show input ONLY if enabled */}
                    {enableFormatting && (
                      <input
                        id="field-formatting"
                        type="text"
                        className="form-control"
                        value={formatting}
                        onChange={(e) => setFormatting(e.target.value)}
                      />
                    )}
                  </div>
                </Row>
              )}
              {(selectedFieldType === "questionField" ||
                selectedFieldType === "formField") &&
                fieldType === "custom" && (
                  <Row>
                    <label htmlFor="example-text-input" className="col-md-2 ">
                      Custom Value :
                    </label>
                    <div className="col-10 ">
                      <input
                        type="text"
                        className="form-control"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        placeholder="Enter value separated by value, For Eg (2,3,4,Feild1, Feild2)"
                      />
                      <small style={{ color: "red" }}>
                        *Custom value should be in the reading direction
                      </small>
                    </div>
                  </Row>
                )}
            </div>
          )}
        </CustomDraggableModal.Body>
        <CustomDraggableModal.Footer
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button
            onClick={() => {
              setModalShow(false);
            }}
            variant="warning"
            className="primary-btn-fcs"
          >
            Hide Modal
          </Button>

          {modalUpdate && (
            <>
              <Tooltip title="Delete" placement="top">
                <IconButton
                  aria-label="delete"
                  onClick={() => {
                    handleCrossClick(selectedField, coordinateIndex);
                    setModalShow(false);
                    setSelection(null);
                  }}
                  color="secondary"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Link" placement="top">
                <IconButton
                  aria-label="delete"
                  onClick={() => {
                    setShowLinkModal(true);
                  }}
                  color="warning"
                >
                  <AddLinkIcon />
                </IconButton>
              </Tooltip>

              <Tooltip
                title="Copy Field"
                placement="top"
                onClick={() => {
                  setShowCopy(true);
                }}
              >
                <IconButton aria-label="copy" color="primary">
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              type="button"
              variant="danger"
              onClick={handleCancel}
              className="waves-effect waves-light primary-btn-fcs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              color="success"
              onClick={handleSave}
              className="waves-effect waves-light secondary-btn-fcs"
            >
              {!modalUpdate ? "Save" : "Update"}
            </Button>
          </div>
        </CustomDraggableModal.Footer>
      </CustomDraggableModal>

      <Modal
        show={imageModalShow}
        size="lg"
        onHide={() => setImageModalShow(false)}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Image Detail
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "60vh" }}>
          {data.images && (
            <EditImagesCropper
              handleImage={handleImage}
              images={data.images}
              selectedCoordinateData={selectedCoordinates}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="danger"
            onClick={() => setImageModalShow(false)}
            className="waves-effect waves-light"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="success"
            onClick={() => setImageModalShow(false)}
            className="waves-effect waves-light"
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
      {detailPage && (
        <EditTemplateModal
          title={dataCtx.allTemplates[0][0]?.layoutParameters?.templateType}
          show={detailPage}
          templateId={data.templateId}
          layoutData={dataCtx.allTemplates[0][0]}
          onHide={() => setDetailPage(false)}
          sensitivityHandler={sensitivityHandler}
          setData={setData}
        />
      )}
      {showLinkModal && (
        <LinkModal
          show={showLinkModal}
          onHide={() => setShowLinkModal(false)}
          selectedCoordinates={selectedCoordinates}
          fieldType={selectedFieldType}
        />
      )}
      {showCopy && (
        <CopyModal
          show={showCopy}
          type="simpleCopy"
          onHide={() => {
            setShowCopy(false);
          }}
          saveRegion={saveRegion}
        />
      )}

      {groupCopy && (
        <CopyModal
          show={groupCopy}
          type="groupCopy"
          onHide={() => {
            setGroupCopy(false);
          }}
          saveGroupRegion={saveGroupRegion}
        />
      )}
      {showFieldDetails && (
        <FieldDetails
          show={showFieldDetails}
          onHide={() => {
            setShowFieldDetails(false);
          }}
          selected={selectedCoordinates}
          linkFields={linkFields}
          editHandler={(item, i) => handleEyeClick(item, i)}
          deleteHandler={(item, i) => handleCrossClick(item, i)}
        />
      )}
      {!showSideBar && (
        <div
          className={classes["sidebar-btn"]}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateX(0)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateX(-10px)")
          }
          onClick={() => {
            setShowSideBar(true);
          }}
        >
          <FiChevronRight size={48} color="white" />
        </div>
      )}
      {!showRightSideBar && (
        <div
          className={classes["right-sidebar-btn"]}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateX(0)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateX(10px)")
          }
          onClick={() => {
            setShowRightSideBar(true);
          }}
        >
          <FiChevronLeft size={48} color="white" />
        </div>
      )}

      <SideBar
        isOpen={showSideBar}
        onClose={() => setShowSideBar(false)}
        selectedWindow={selectedCoordinates}
      />
      <RightSideBar
        isOpen={showRightSideBar}
        onClose={() => setShowRightSideBar(false)}
        selectedWindow={linkFields}
        setCurrentLinkField={setCurrentLinkField}
        currentLinkField={currentLinkField}
      />
    </>
  );
};
export default EditDesignTemplate;
