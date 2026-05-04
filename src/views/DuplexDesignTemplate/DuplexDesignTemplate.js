import React, { useContext, useEffect, useRef, useState } from "react";
import { Modal, Button, Col, Badge, Container } from "react-bootstrap";
import { Row } from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";
import classes from "./DesignTemplate.module.css";
import DataContext from "store/DataContext";
import { MultiSelect } from "react-multi-select-component";
import SmallHeader from "components/Headers/SmallHeader";
import { toast } from "react-toastify";
import isEqual from "lodash/isEqual";
import LayoutDetailModal from "ui/LayoutDetailModal";
import TextLoader from "loaders/TextLoader";
import processDirection from "data/processDirection";
import deepcopy from "deepcopy";
import resetJson from "data/resetJson";
import { useWindowSize } from "react-use";
import ImagesCropper from "modals/ImagesCropper";
import { getUrls } from "helper/url_helper";
import { calculateTotalRow } from "services/HelperFunctions";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import SideBar from "components/SideBar";
import CopyModal from "modals/CopyModal/CopyModal";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IconButton from "@mui/material/IconButton";
import { Button as Muibtn, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import questionNameGenerator from "helper/questionNameGenerator";
import FieldDetails from "modals/FieldDetails";
import AddLinkIcon from "@mui/icons-material/AddLink";
import LinkModal from "modals/LinkModal/LinkModal";
import RightSideBar from "components/RightSideBar/RightSideBar";
import BootstrapNumberInput from "ui/BootstrapNumber";
import Draggable from "react-draggable";
import ExcelLikeTable from "components/ExcellLike";
import groupQuestionNameGenerator from "helper/groupQuestionGenerator";
import CustomDraggableModal from "views/test";
import skewQuestionNameGenerator from "helper/skewQuestionNameGenerator";
import _ from "lodash";

function updateFormFieldCoordinates(data, num) {
  // Helper to update a field list
  function updateFields(fields) {
    if (!Array.isArray(fields)) return fields;

    return fields.map((field) => {
      if (field.side === "back") {
        return {
          ...field,
          rowStart: field.rowStart + num+1,
          formFieldCoordinates: {
            ...field.formFieldCoordinates,
            start: field.formFieldCoordinates.start + num,
            end: field.formFieldCoordinates.end + num,
          },
        };
      }
      return field;
    });
  }

  function updateQuestionFields(fields) {
    if (!Array.isArray(fields)) return fields;

    return fields.map((field) => {
      if (field.side === "back") {
        return {
          ...field,
          rowStart: field.rowStart + num+1,
          questionWindowCoordinates: {
            ...field.questionWindowCoordinates,
            start: field.questionWindowCoordinates.start + num,
            end: field.questionWindowCoordinates.end + num,
          },
        };
      }
      return field;
    });
  }

  // Update both formFieldWindowParameters and questionFieldWindowParameters if present
  if (data) {
    if (Array.isArray(data.formFieldWindowParameters)) {
      data.formFieldWindowParameters = updateFields(
        data.formFieldWindowParameters
      );
    }
    if (Array.isArray(data.questionsWindowParameters)) {
      data.questionsWindowParameters = updateQuestionFields(
        data.questionsWindowParameters
      );
    }
  }

  return data;
}

const DuplexDesignTemplate = () => {
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
  const [maximumMark, setMaximumMark] = useState(1);
  const [noInRow, setNoInRow] = useState();
  const [noOfStepInRow, setNoOfStepInRow] = useState(1);
  const [noInCol, setNoInCol] = useState();
  const [noOfStepInCol, setNoOfStepInCol] = useState();
  const [type, setType] = useState("2");
  const [selectedFieldType, setSelectedFieldType] = useState();
  const [fieldType, setFieldType] = useState();
  const [numberOfField, setNumberOfField] = useState();
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    width: 400,
    height: 400,
  });
  const [detailPage, setDetailPage] = useState(false);
  const dataCtx = useContext(DataContext);
  const [localData, setLocalData] = useState(
    JSON.parse(sessionStorage.getItem("Template"))
  );
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
  const [coordinateIndex, setCoordinateIndex] = useState(-1);
  const [selectionIndex, setSelectionIndex] = useState();
  const [idSelectionCount, setIdSelectionCount] = useState(0);
  const [imageModalShow, setImageModalShow] = useState(false);
  const [imagesSelectedCount, setImagesSelectedCount] = useState(0);
  const [sizes, setSizes] = useState({});
  const [baseUrl, setBaseUrl] = useState(null);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [showSideBar, setShowSideBar] = useState(false);
  const [showRightSideBar, setShowRightSideBar] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const [selectedField, setSelectedField] = useState();
  const [showFieldDetails, setShowFieldDetails] = useState(false);
  const [skewFieldValue, setSkewFieldValue] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkFields, setLinkFields] = useState([]);
  const {
    totalColumns,
    timingMarks,
    images,
    bubbleType,
    key: templateIndex,
    iSensitivity,
    iDifference,
    iReject,
    iFace,
    arr,
    excelJsonFile,
    backExcelJsonFile,
    numberedBackExcelJsonFile,
  } = localData[0].layoutParameters;
  const [currentLinkField, setCurrentLinkField] = useState(null);
  const [groupCopy, setGroupCopy] = useState(false);
  const [filteredSelectedCoordinate, setFilteredSelectedCoordinate] = useState(
    []
  );
  const [oldCoordinates, setOldCoordinates] = useState(null);
  const [currentSelectedCoordinate, setCurrentSelectedCoordinate] =
    useState(null);
  const [activeArea, setActiveArea] = useState({ row: null, col: null });
  const [currentExcelJsonFile, setCurrentExcelJsonFile] =
    useState(excelJsonFile);
  const [numRows, setNumRows] = useState(excelJsonFile.length);
  const [numCols, setNumCols] = useState(Object.keys(excelJsonFile[0]).length);
  const inputRef = useRef(null);
  const divRefs = useRef([]);
  const [highlightField, setHighlightField] = useState(false);
  const [formatting, setFormatting] = useState("");
  const [showFront, setShowFront] = useState(true);
  const [currentSelectedField, setCurrentSelectedField] = useState([]);
  const [enableFormatting, setEnableFormatting] = useState(false);
  const { width } = useWindowSize();
  const isWideScreen = width >= 994;
  const blankRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    if (showFront) {
      setCurrentExcelJsonFile(excelJsonFile);
      setNumCols(Object.keys(excelJsonFile[0]).length);
      setNumRows(excelJsonFile.length);
    } else {
      setCurrentExcelJsonFile(backExcelJsonFile);
      setNumCols(Object.keys(backExcelJsonFile[0]).length);
      setNumRows(backExcelJsonFile.length);
    }
  }, [showFront, excelJsonFile, backExcelJsonFile]);

 
  // useEffect(() => {
  //   const totalVisibleColumn = Math.ceil(noInCol/noOfStepInCol)
  //   setFormatting(totalVisibleColumn === "" ? "" : "X".repeat(totalVisibleColumn));
  // }, [noInCol,noOfStepInCol]);


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

  setFormatting(totalVisibleColumn > 0 ? "X".repeat(totalVisibleColumn) : "");
}, [noInCol, noOfStepInCol, enableFormatting]);

  useEffect(() => {
    if (modalShow) {
      if (startRowInput && endRowInput && modalShow) {
        const total = +endRowInput - +startRowInput + 1;
        setNoInRow(total);
      }
      if (startColInput && endColInput && modalShow) {
        const total = +endColInput - +startColInput + 1;
        setNoInCol(total);
      }
    }
  }, [modalShow]);
  useEffect(() => {
    const template = sessionStorage.getItem("Template");
    if (template) {
      setLocalData(JSON.parse(template));
    }
  }, [dataCtx.allTemplates]);

  useEffect(() => {
    setTimeout(() => {
      if (dataCtx.allTemplates.length > 0) {
        sendHandler();
      }
    }, 500);
  }, [dataCtx.allTemplates]);

  const toggleSelection = (row, col) => {
    const key = `${row},${col}`;
    setSelected((prev) => {
      const newState = { ...prev, [key]: !prev[key] };

      return newState;
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getUrls();
        const GetDataURL = response.MAIN_URL;
        setBaseUrl(GetDataURL);
      } catch (error) {
        console.log("Error", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setLocalData(JSON.parse(sessionStorage.getItem("Template")));
    }, 1000);
  }, [detailPage]);

  useEffect(() => {
    const idFieldCount = selectedCoordinates.filter(
      (item) => item.fieldType === "idField"
    ).length;
    if (idFieldCount > 0) {
      setIdSelectionCount(1);
    } else {
      setIdSelectionCount(0);
    }
  }, [selectedCoordinates, selection]);

  useEffect(() => {
    const templateData = JSON.parse(sessionStorage.getItem("Template"));

    if (templateData) {
      if (dataCtx.allTemplates.length === 0) {
        dataCtx.setNewTemplates([templateData]);
      }
    }
  }, [dataCtx.allTemplates]);

  useEffect(() => {
    const template = dataCtx.allTemplates[0];
    if (template) {
      sessionStorage.setItem("Template", JSON.stringify(template));
    }
  }, [dataCtx.allTemplates]);

  useEffect(() => {
    setStartRowInput(selection?.startRow + 1);
    setEndRowInput(selection?.endRow + 1);
    setStartColInput(selection?.startCol);
    setEndColInput(selection?.endCol);
  }, [selection]);

  useEffect(() => {
    const gridDiv = document.getElementById("grid-div");
    const imgDiv = document.getElementById("imagecontainer");

    if (gridDiv && imgDiv) {
      const gridHeight = gridDiv.clientHeight;
      const gridWidth = gridDiv.clientWidth;
      imgDiv.style.height = `${gridHeight + 250}px`;
      imgDiv.style.width = `${gridWidth + 130}px`; // Adding 50 pixels to the width
      setPosition({
        x: 0,
        y: 0,
        width: `${gridWidth}px`,
        height: `${gridHeight}px`,
      });
    }
  }, []);
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
  // console.log(currentSelectedField)
  // useEffect(() => {
  //   currentSelectedField.forEach((item) => {
  //     const isQuestionField = item?.fieldType === "questionField";
  //     const isFormField = item?.fieldType === "formField";

  //     if (isQuestionField || isFormField) {
  //       const template = dataCtx.allTemplates.find((item) => {
  //         return item[0].layoutParameters?.key ?? "" === templateIndex;
  //       });
  //       const parameters = isQuestionField
  //         ? template[0].questionsWindowParameters
  //         : template[0].formFieldWindowParameters;

  //       // Format the selected file for comparison
  //       const formattedSelectedFile = {
  //         "End Col": item.endCol,
  //         "End Row": item.endRow + 1,
  //         "Start Col": item.startCol,
  //         "Start Row": item.startRow + 1,
  //         fieldType: item.fieldType,
  //         name: item.name,
  //       };
  //       if (parameters) {
  //         // Find the index of the matched object
  //         const index = parameters.findIndex((param) =>
  //           isEqual(param.Coordinate, formattedSelectedFile)
  //         );

  //         // Get the matched object
  //         const data2 = index !== -1 ? parameters[index] : null;

  //         if (data2) {
  //           // Determine the reading direction
  //           const directionMapping = {
  //             0: "topToBottom",
  //             1: "topToBottom",
  //             2: "bottomToTop",
  //             3: "bottomToTop",
  //             4: "leftToRight",
  //             5: "rightToLeft",
  //             6: "leftToRight",
  //             7: "rightToLeft",
  //           };
  //           const readingDirection =
  //             directionMapping[data2.iDirection] || "rightToLeft";
  //           const type = data2.numericOrAlphabets;
  //           // Process the data with the determined direction
  //           const stepInRow = data2.rowStep;
  //           const stepInCol = data2.columnStep;
  //           const customRawValue = data2?.customFieldValue
  //             ? data2.customFieldValue.split(",")
  //             : [""];
  //           const customValue = customRawValue.map((item) =>
  //             item.slice(0, 2).toUpperCase()
  //           );
  //           const numberedJsonFile = showFront
  //             ? template[0].layoutParameters.numberedExcelJsonFile
  //             : template[0].layoutParameters.numberedBackExcelJsonFile;
  //           const data = processDirection(
  //             readingDirection,
  //             item.startRow,
  //             item.endRow,
  //             item.startCol,
  //             item.endCol,
  //             numberedJsonFile,
  //             type,
  //             stepInRow,
  //             stepInCol,
  //             customValue
  //           );
  //           if (showFront) {
  //             const template =dataCtx.allTemplates[0][0]
  //             const copiedObject = deepcopy(template);
  //             delete copiedObject.layoutParameters.numberedExcelJsonFile;
  //             copiedObject.layoutParameters = {
  //               ...copiedObject.layoutParameters,
  //               numberedExcelJsonFile: data,
  //             };
  //             // console.log(copiedObject)

  //             dataCtx.setNewTemplates([[copiedObject]])
  //           } else {
  //           const template =dataCtx.allTemplates[0][0]
  //             const copiedObject = deepcopy(template);
  //             delete copiedObject.layoutParameters.numberedBackExcelJsonFile;
  //             copiedObject.layoutParameters = {
  //               ...copiedObject.layoutParameters,
  //               numberedBackExcelJsonFile: data,
  //             };
  //             // dataCtx.setNewTemplates([[copiedObject]])
  //           }
  //         }
  //       }
  //     }
  //   });
  // }, [currentSelectedField]);
  // console.log(dataCtx.allTemplates)

  // useEffect(()=>{
  //   processFields()
  // },[])

  const processFieldsWithCurrentField = (currentFields) => {
    currentFields.forEach((item) => {
      const isQuestionField = item?.fieldType === "questionField";
      const isFormField = item?.fieldType === "formField";

      if (!isQuestionField && !isFormField) return;

      const templateGroup = dataCtx.allTemplates.find(
        (tpl) => (tpl[0]?.layoutParameters?.key ?? "") === templateIndex
      );
      const template = templateGroup?.[0];
      if (!template) return;

      const parameters = isQuestionField
        ? template.questionsWindowParameters
        : template.formFieldWindowParameters;

      if (!parameters) return;

      const formattedSelectedFile = {
        "End Col": item.endCol,
        "End Row": item.endRow + 1,
        "Start Col": item.startCol,
        "Start Row": item.startRow + 1,
        fieldType: item.fieldType,
        name: item.name,
      };

      const index = parameters.findIndex((param) =>
        isEqual(param.Coordinate, formattedSelectedFile)
      );
      const data2 = index !== -1 ? parameters[index] : null;
      if (!data2) return;

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
      const readingDirection =
        directionMapping[data2.iDirection] || "rightToLeft";
      const type = data2.numericOrAlphabets;
      const stepInRow = data2.rowStep;
      const stepInCol = data2.columnStep;

      const customRawValue = data2?.customFieldValue
        ? data2.customFieldValue.split(",")
        : [""];
      const customValue = customRawValue.map((val) =>
        val.slice(0, 2).toUpperCase()
      );

      const numberedJsonFile = showFront
        ? template.layoutParameters.numberedExcelJsonFile
        : template.layoutParameters.numberedBackExcelJsonFile;

      const data = processDirection(
        readingDirection,
        item.startRow,
        item.endRow,
        item.startCol,
        item.endCol,
        numberedJsonFile,
        type,
        stepInRow,
        stepInCol,
        customValue
      );
      // console.log(data)
      // Clone and update template
      const copiedObject = deepcopy(template);
      // const onceParsed = JSON.parse(data);       // Still a string (but with valid JSON inside)
      // const finalData = JSON.parse(onceParsed);
      // const tripleParse = JSON.parse(finalData); // Now a string with valid JSON inside
      // console.log(tripleParse)
      // return
      if (showFront) {
        copiedObject.layoutParameters.numberedExcelJsonFile = data;
      } else {
        copiedObject.layoutParameters.numberedBackExcelJsonFile = data;
      }
      // console.log(copiedObject)
      // Replace template in context
      // dataCtx.setNewTemplates([[copiedObject]]);
    });
  };

  const processFields = () => {
    currentSelectedField.forEach((item) => {
      const isQuestionField = item?.fieldType === "questionField";
      const isFormField = item?.fieldType === "formField";

      if (isQuestionField || isFormField) {
        const template = dataCtx.allTemplates.find((item) => {
          return item[0].layoutParameters?.key ?? "" === templateIndex;
        });
        const parameters = isQuestionField
          ? template[0].questionsWindowParameters
          : template[0].formFieldWindowParameters;

        // Format the selected file for comparison
        const formattedSelectedFile = {
          "End Col": item.endCol,
          "End Row": item.endRow + 1,
          "Start Col": item.startCol,
          "Start Row": item.startRow + 1,
          fieldType: item.fieldType,
          name: item.name,
        };
        if (parameters) {
          // Find the index of the matched object
          const index = parameters.findIndex((param) =>
            isEqual(param.Coordinate, formattedSelectedFile)
          );

          // Get the matched object
          const data2 = index !== -1 ? parameters[index] : null;

          if (data2) {
            // Determine the reading direction
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
            const readingDirection =
              directionMapping[data2.iDirection] || "rightToLeft";
            const type = data2.numericOrAlphabets;
            // Process the data with the determined direction
            const stepInRow = data2.rowStep;
            const stepInCol = data2.columnStep;
            const customRawValue = data2?.customFieldValue
              ? data2.customFieldValue.split(",")
              : [""];
            const customValue = customRawValue.map((item) =>
              item.slice(0, 2).toUpperCase()
            );
            const numberedJsonFile = showFront
              ? template[0].layoutParameters.numberedExcelJsonFile
              : template[0].layoutParameters.numberedBackExcelJsonFile;
            const data = processDirection(
              readingDirection,
              item.startRow,
              item.endRow,
              item.startCol,
              item.endCol,
              numberedJsonFile,
              type,
              stepInRow,
              stepInCol,
              customValue
            );
            if (showFront) {
              const template = dataCtx.allTemplates[0][0];
              const copiedObject = deepcopy(template);
              delete copiedObject.layoutParameters.numberedExcelJsonFile;
              copiedObject.layoutParameters = {
                ...copiedObject.layoutParameters,
                numberedExcelJsonFile: data,
              };
              // console.log(copiedObject)

              dataCtx.setNewTemplates([[copiedObject]]);
            } else {
              const template = dataCtx.allTemplates[0][0];
              const copiedObject = deepcopy(template);
              delete copiedObject.layoutParameters.numberedBackExcelJsonFile;
              copiedObject.layoutParameters = {
                ...copiedObject.layoutParameters,
                numberedBackExcelJsonFile: data,
              };
              // dataCtx.setNewTemplates([[copiedObject]])
            }
          }
        }
      }
    });
  };

  useEffect(() => {
    const arr = dataCtx.allTemplates[0];
    const parameter = showFront ? "front" : "back";

    if (arr) {
      // Extract parameters from the first element of the array
      const formFieldData = arr[0]?.formFieldWindowParameters?.filter(
        (item) => item.side === parameter
      );
      const questionField = arr[0]?.questionsWindowParameters?.filter(
        (item) => item.side === parameter
      );
      const skewField = arr[0]?.skewMarksWindowParameters?.filter(
        (item) => item.side === parameter
      );

      const idField = arr[0]?.layoutParameters;
      const coordinateOfIdField =
        idField?.side === parameter && idField?.Coordinate
          ? [idField.Coordinate]
          : [];

      // Map each set of filtered parameters to their coordinates or default to an empty array
      const coordinateOfFormData =
        formFieldData?.map((item) => item.Coordinate) ?? [];
      const coordinateOfQuestionField =
        questionField?.map((item) => item.Coordinate) ?? [];
      const coordinateOfSkewField =
        skewField?.map((item) => item.Coordinate) ?? [];

      // Combine all coordinates into a single array
      const allCoordinates = [
        ...coordinateOfFormData,
        ...coordinateOfQuestionField,
        ...coordinateOfSkewField,
        ...coordinateOfIdField,
      ];

      // Map each coordinate to the expected structure
      const newSelectedFields = allCoordinates?.map((item) => {
        const {
          "Start Row": startRow,
          "Start Col": startCol,
          "End Row": endRow,
          "End Col": endCol,
          name,
          fieldType,
        } = item;

        return {
          startRow: startRow - 1,
          startCol,
          endRow: endRow - 1,
          endCol,
          name,
          fieldType,
        };
      });

      // Update state
      processFieldsWithCurrentField(newSelectedFields);
      setCurrentSelectedField(newSelectedFields);
      // setLinkFields(arr[0]?.linkedCoordinates || []);
    }
  }, [dataCtx, localData, showFront]);

  useEffect(() => {
    const arr = dataCtx.allTemplates[0];
    if (arr) {
      // Extract parameters from the first element of the array (if it exists)
      const formFieldData = arr[0]?.formFieldWindowParameters;
      const questionField = arr[0]?.questionsWindowParameters;
      const skewField = arr[0]?.skewMarksWindowParameters;
      const idField = arr[0]?.layoutParameters;

      // Map each set of parameters to their coordinates or default to an empty array
      const coordinateOfFormData =
        formFieldData?.map((item) => item.Coordinate) ?? [];
      const coordinateOfQuestionField =
        questionField?.map((item) => item.Coordinate) ?? [];
      const coordinateOfSkewField =
        skewField?.map((item) => item.Coordinate) ?? [];
      const coordinateOfIdField = idField?.Coordinate
        ? [idField?.Coordinate]
        : [];
      // Combine all coordinates into a single array
      const allCoordinates = [
        ...coordinateOfFormData,
        ...coordinateOfQuestionField,
        ...coordinateOfSkewField,
        ...coordinateOfIdField,
      ];

      // Map each coordinate to a new format
      const newSelectedFields = allCoordinates?.map((item) => {
        const {
          "Start Row": startRow,
          "Start Col": startCol,
          "End Row": endRow,
          "End Col": endCol,

          name,
          fieldType,
        } = item;

        return {
          startRow: startRow - 1,
          startCol,
          endRow: endRow - 1,
          endCol,
          name,
          fieldType,
        };
      });

      // Update the state with the new coordinates and image structure data
      setSelectedCoordinates(newSelectedFields);

      setLinkFields(arr[0]?.linkedCoordinates || []);
    }
  }, [dataCtx, localData]);

  useEffect(() => {
    const template = dataCtx.allTemplates[0];

    if (template) {
      setLayoutFieldData(template[0]);
    }
  }, [dataCtx.allTemplates]);

  useEffect(() => {
    // Create an array to hold the options
    const options = Array.from({ length: +totalColumns }, (v, i) => ({
      label: `${idType} ${i + 1}`, // Set the label as 'Col X' where X is the column number
      value: i, // Set the value as the index
    }));

    // Update the state with the new options array
    setOptions(options);
  }, [totalColumns, idType]);

  useEffect(() => {
    if (selectedCol.length > 0) {
      const value = selectedCol.map((item) => item.value);
      const arr = Array(+totalColumns).fill(0);
      for (let j = 0; j < value.length; j++) {
        arr[value[j]] = 1;
      }
      setIdNumber(arr.join("").toString());
    }
  }, [options, selectedCol]);

  const handleMouseDown = (e) => {
    const boundingRect = imageRef.current.getBoundingClientRect();
    const col = Math.floor(
      (e.clientX - boundingRect.left) / (boundingRect.width / numCols)
    );
    const row = Math.floor(
      (e.clientY - boundingRect.top) / (boundingRect.height / numRows)
    );

    // Check if the clicked cell is a timing mark or already selected (a circle)
    if (col === 0 || selected[`${row},${col}`]) return;
    setDragStart({ row, col });
  };

  const handleMouseMove = (e) => {
    if (!e.buttons || !dragStart) return;
    const boundingRect = imageRef.current.getBoundingClientRect();
    const col = Math.floor(
      (e.clientX - boundingRect.left) / (boundingRect.width / numCols)
    );
    const row = Math.floor(
      (e.clientY - boundingRect.top) / (boundingRect.height / numRows)
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
    if (!selection) {
      return;
    }
    // e.preventDefault()
    const filteredCoordinates = selectedCoordinates.filter((coord) => {
      const isFullyInside =
        coord.startRow >= selection.startRow &&
        coord.endRow <= selection.endRow &&
        coord.startCol >= selection.startCol &&
        coord.endCol <= selection.endCol;

      return isFullyInside;
    });

    if (dragStart && selection && !(e.ctrlKey || e.metaKey)) {
      // Handle selection via drag
      setDragStart(null);
      setModalShow(true);
      setSelectedFieldType(null);
    } else if ((e.ctrlKey || e.metaKey) && filteredCoordinates.length > 0) {
      // Handle copy with Ctrl/Cmd key
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
    setNoInRow();
    setNoOfStepInRow(1);
    setNoInCol();
    setNoOfStepInCol(1);
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
      maximumMark: "Maximum mark cannot be empty",
      noInRow: "Total number in row cannot be empty",
      noOfStepInRow: "Total number of step in a row cannot be empty",
      noInCol: "Total number in col cannot be empty",
      noOfStepInCol: "Total number of step in a col cannot be empty",
      readingDirectionOption: "Please select reading direction",
      type: "Please select type",
      // option: "Please select option",
      numberOfField: "Total field cannot be empty",
      fieldType: "Please select field type",
    };

    for (let [field, errorMsg] of Object.entries(errors)) {
      if (!eval(field)) {
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
    let newData = {};
    // if (!modalUpdate) {
    if (selectedFieldType === "idField") {
      newData = {
        Coordinate: {
          "Start Row": selection?.startRow + 1,
          "Start Col": selection?.startCol,
          "End Row": selection?.endRow + 1,
          "End Col": selection?.endCol,
          name: "Id Field",
          fieldType: selectedFieldType,
        },
        imageStructureData: position,
        columnStart: +selection?.startCol,
        columnNumber: +noInCol,
        columnStep: +noOfStepInCol,
        rowStart: +selection?.startRow + 1,
        rowNumber: +noInRow,
        rowStep: +noOfStepInRow,
        iDirection: +readingDirectionOption,
        idMarksPattern: idNumber.toString(),
        side: showFront ? "front" : "back",
      };
    } else if (selectedFieldType === "skewMarkField") {
      newData = {
        iFace: +iFace,
        columnStart: +selection?.startCol,
        columnNumber: +noInCol,
        columnStep: +noOfStepInCol,
        rowStart: +selection?.startRow + 1,
        rowNumber: +noInRow,
        rowStep: +noOfStepInRow,
        iSensitivity: +iSensitivity,
        iDifference: +iDifference,
        iOption: 1,
        iReject: +iReject,
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
        side: showFront ? "front" : "back",
      };
    } else {
      newData = {
        iFace: +iFace,
        windowName: name,
        columnStart: +selection?.startCol,
        columnNumber: +noInCol,
        columnStep: +noOfStepInCol,
        rowStart: +selection?.startRow + 1,
        rowNumber: +noInRow,
        rowStep: +noOfStepInRow,
        iDirection: +readingDirectionOption,
        iSensitivity: +iSensitivity,
        iDifference: +iDifference,
        iOption: selectedFieldType === "formField" ? 1 : 0,
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
          name: name,
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
        side: showFront ? "front" : "back",
      };
      const template = dataCtx.allTemplates.find((item) => {
        return item[0].layoutParameters?.key ?? "" === templateIndex;
      });

      if (modalUpdate) {
        resetJson(
          template[0].layoutParameters.numberedExcelJsonFile,
          oldCoordinates["Start Row"] - 1,
          oldCoordinates["End Row"] - 1,
          oldCoordinates["Start Col"],
          oldCoordinates["End Col"]
        );
      }
    }

    setModalShow(false);
    if (!modalUpdate) {
      dataCtx.modifyTemplateWithUUID(templateIndex, newData, selectedFieldType);
      const newSelected = {
        ...selection,
        name: selectedFieldType !== "idField" ? name : "Id Field",
        fieldType: selectedFieldType,
      };
      setSelectedCoordinates((prev) => [...prev, newSelected]);
      setSelection(null);
    } else {
      setSelectedCoordinates((item) => {
        // Ensure item is defined and coordinateIndex is valid
        if (!item || coordinateIndex < 0 || coordinateIndex >= item.length) {
          console.error("Invalid coordinate index or item array");
          return item; // Return the unchanged state if validation fails
        }
        const arr = dataCtx.allTemplates.find((item) => {
          console.log(item);
          return item[0].layoutParameters?.key ?? "" === templateIndex;
        });
        const formFieldData = arr[0]?.formFieldWindowParameters;
        const questionField = arr[0]?.questionsWindowParameters;
        const skewField = arr[0]?.skewMarksWindowParameters;
        const idField = arr[0]?.layoutParameters;

        // Map each set of parameters to their coordinates or default to an empty array
        const coordinateOfFormData =
          formFieldData?.map((item) => item.Coordinate) ?? [];
        const coordinateOfQuestionField =
          questionField?.map((item) => item.Coordinate) ?? [];
        const coordinateOfSkewField =
          skewField?.map((item) => item.Coordinate) ?? [];
        const coordinateOfIdField = idField?.Coordinate ?? {};

        // Combine all coordinates into a single array
        const allCoordinates = [
          ...coordinateOfFormData,
          ...coordinateOfQuestionField,
          ...coordinateOfSkewField,
          ...[coordinateOfIdField],
        ];
        const filteredCoordinates = allCoordinates.filter(
          (item) => Object.keys(item).length > 0
        );
        console.log(filteredCoordinates);
        // Map each coordinate to a new format
        const newSelectedFields = filteredCoordinates?.map((item) => {
          const {
            "Start Row": startRow,
            "Start Col": startCol,
            "End Row": endRow,
            "End Col": endCol,
            name,
            fieldType,
          } = item;

          return {
            startRow: startRow - 1,
            startCol,
            endRow: endRow - 1,
            endCol,
            name,
            fieldType,
          };
        });

        return newSelectedFields;
      });

      dataCtx.modifyRegionWithUUID(
        templateIndex,
        newData,
        selectedFieldType,
        coordinateIndex
      );
      setSelection(null);
    }

    setTimeout(() => {
      sendHandler();
    }, 500);
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
    setOldCoordinates({ ...formattedSelectedFile });
    setSelectionIndex(index);
    const template = dataCtx.allTemplates.find((item) => {
      return item[0].layoutParameters?.key ?? "" === templateIndex;
    });
    // console.log(template);
    if (selectedField?.fieldType === "idField") {
      const data = template[0].layoutParameters;

      setSelectedFieldType("idField");
      setWindowNgOption(data?.ngAction);
      setMinimumMark(data?.minimumMark);
      setMaximumMark(data?.maximumMark);
      setReadingDirectionOption(data?.iDirection);
      setNoInRow(data?.rowNumber);
      setNoInCol(data?.columnNumber);
      setNoOfStepInRow(data?.rowStep);
      setNoOfStepInCol(data?.columnStep);
      setStartRowInput(formattedSelectedFile["Start Row"]);
      setEndRowInput(formattedSelectedFile["End Row"]);
      setStartColInput(formattedSelectedFile["Start Col"]);
      setEndColInput(formattedSelectedFile["End Col"]);
      setCoordinateIndex(index);
      setModalUpdate(true);
      setModalShow(true);
    } else if (selectedField?.fieldType === "questionField") {
      const parameters = template[0].questionsWindowParameters;

      // Find the index of the matched object
      const index = parameters.findIndex((item) =>
        isEqual(item.Coordinate, formattedSelectedFile)
      );
      if (index === -1) {
        alert("Coordinate Not Found");
      }

      // Get the matched object
      const data = index !== -1 ? parameters[index] : null;

      setCoordinateIndex(index);
      setModalUpdate(true);
      setModalShow(true);
      setName(data?.windowName);
      setSelectedFieldType("questionField");
      setWindowNgOption(data?.ngAction);
      setMinimumMark(data?.iMaximumMarks);
      setMaximumMark(data?.iMinimumMarks);
      setNoInRow(data?.rowNumber);
      setNoInCol(data?.columnNumber);
      setStartRowInput(formattedSelectedFile["Start Row"]);
      setEndRowInput(formattedSelectedFile["End Row"]);
      setStartColInput(formattedSelectedFile["Start Col"]);
      setEndColInput(formattedSelectedFile["End Col"]);
      setReadingDirectionOption(data?.iDirection);
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
    } else if (selectedField?.fieldType === "formField") {
      const parameters = template[0].formFieldWindowParameters;

      const index = parameters.findIndex((item) => {
        return isEqual(item.Coordinate, formattedSelectedFile);
      });

      if (index === -1) {
        alert("Coordinate Not Found");
      }

      // Get the matched object
      const data = index !== -1 ? parameters[index] : null;

      setCoordinateIndex(index);

      setModalUpdate(true);
      setModalShow(true);
      setSelectedFieldType("formField");
      setName(data?.windowName);
      setWindowNgOption(data?.ngAction);
      setMinimumMark(data?.iMaximumMarks);

      setMaximumMark(data?.iMinimumMarks);
      setNoInRow(data?.rowNumber);
      setNoInCol(data?.columnNumber);
      setStartRowInput(formattedSelectedFile["Start Row"] - 1);
      setEndRowInput(formattedSelectedFile["End Row"] - 1);
      setStartColInput(formattedSelectedFile["Start Col"]);
      setEndColInput(formattedSelectedFile["End Col"]);
      setReadingDirectionOption(data?.iDirection);
      setType(data?.iType);
      // setOption(data?.iOption);
      setNumberOfField(data?.totalNumberOfFields);
      setFieldType(data?.numericOrAlphabets);
      setMultiple(data?.multipleAllow);
      setMultipleValue(data?.multipleValue);
      setBlank(data?.blankAllow);
      setBlankValue(data?.blankValue);
      setSuffix(data?.suffix);
      setPrefix(data?.prefix);
      setNoOfStepInRow(data?.rowStep);
      setNoOfStepInCol(data?.columnStep);
      setCustomValue(data?.customFieldValue);
      setFormatting(data?.formatting);
    } else if (selectedField?.fieldType === "skewMarkField") {
      const parameters = template[0].skewMarksWindowParameters;
      const index = parameters.findIndex((item) =>
        isEqual(item.Coordinate, formattedSelectedFile)
      );

      // Get the matched object
      const data = index !== -1 ? parameters[index] : null;
      setCoordinateIndex(index);
      setModalUpdate(true);
      setModalShow(true);
      setSelectedFieldType("skewMarkField");
      setStartRowInput(formattedSelectedFile["Start Row"]);
      setEndRowInput(formattedSelectedFile["End Row"]);
      setStartColInput(formattedSelectedFile["Start Col"]);
      setEndColInput(formattedSelectedFile["End Col"]);
      setNumberOfField(data?.totalNumberOfFields);
      setNoOfStepInRow(data?.rowStep);
      setNoOfStepInCol(data?.columnStep);
      setName(data?.windowName);
      setWindowNgOption(data?.ngAction);
      setMinimumMark(data?.iMaximumMarks);
      setMaximumMark(data?.iMinimumMarks);
      setType(data?.iType);
      setReadingDirectionOption(data?.iDirection);
      setNoInRow(data?.rowNumber);
      setNoInCol(data?.columnNumber);
      setSkewOption(data?.dataRejection);
      setSkewFieldValue(data?.skewFieldValue);
    }
  };
  const handleFillData = (selectedField, index) => {
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
      setMaximumMark(data?.maximumMark);
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
        isEqual(item?.Coordinate, formattedSelectedFile)
      );
      const data = parameters[index];

      setName(data?.windowName);
      setSelectedFieldType("questionField");
      setWindowNgOption(data?.ngAction);
      setMinimumMark(data?.iMaximumMarks);
      setMaximumMark(data?.iMinimumMarks);
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
    } else if (selectedField?.fieldType === "formField") {
      const parameters = template[0].formFieldWindowParameters;
      const index = parameters.findIndex((item) =>
        isEqual(item?.Coordinate, formattedSelectedFile)
      );

      if (index === -1) {
        alert("No data found");
      }
      const data = parameters[index];
      // Get the matched object

      setSelectedFieldType("formField");
      setName(data?.windowName);
      setWindowNgOption(data?.ngAction);
      setMinimumMark(data?.iMaximumMarks);
      setNoOfStepInRow(data?.rowStep);
      setNoOfStepInCol(data?.columnStep);
      setMaximumMark(data?.iMinimumMarks);
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
    } else if (selectedField?.fieldType === "skewMarkField") {
      const parameters = template[0].skewMarksWindowParameters;
      const index = parameters.findIndex((item) =>
        isEqual(item?.Coordinate, formattedSelectedFile)
      );

      if (index === -1) {
        alert("No data found");
      }
      const data = parameters[index];
      setName(data?.windowName);
      setMinimumMark(data?.iMaximumMarks);
      setNoOfStepInRow(data?.rowStep);
      setNoOfStepInCol(data?.columnStep);
      setMaximumMark(data?.iMinimumMarks);
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
    }
  };

  const handleMoveIndexClick = (selectedField, index) => {
    // setCurrentSelectedCoordinate(selectedField);
    // setSelectedField(selectedField);
    setHighlightField(true);
    // setSelection(() => ({
    //   startRow: selectedField.startRow,
    //   startCol: selectedField.startCol,
    //   endRow: selectedField.endRow,
    //   endCol: selectedField.endCol,
    // }));
    const formattedSelectedFile = {
      "End Col": selectedField.endCol,
      "End Row": selectedField.endRow + 1,
      "Start Col": selectedField.startCol,
      "Start Row": selectedField.startRow + 1,
      fieldType: selectedField.fieldType,
      name: selectedField.name,
    };
    // setOldCoordinates({ ...formattedSelectedFile });
    // setSelectionIndex(index);
    const template = dataCtx.allTemplates.find((item) => {
      return item[0].layoutParameters?.key ?? "" === templateIndex;
    });
    // console.log(template);
    if (selectedField?.fieldType === "idField") {
      const data = template[0].layoutParameters;

      // setSelectedFieldType("idField");
      // setWindowNgOption(data?.ngAction);
      // setMinimumMark(data?.minimumMark);
      // setMaximumMark(data?.maximumMark);
      // setReadingDirectionOption(data?.iDirection);
      // setNoInRow(data?.rowNumber);
      // setNoInCol(data?.columnNumber);
      // setNoOfStepInRow(data?.rowStep);
      // setNoOfStepInCol(data?.columnStep);
      // setStartRowInput(formattedSelectedFile["Start Row"]);
      // setEndRowInput(formattedSelectedFile["End Row"]);
      // setStartColInput(formattedSelectedFile["Start Col"]);
      // setEndColInput(formattedSelectedFile["End Col"]);
      // setCoordinateIndex(index);
    } else if (selectedField?.fieldType === "questionField") {
      const parameters = template[0].questionsWindowParameters;

      // Find the index of the matched object
      const index = parameters.findIndex((item) =>
        isEqual(item.Coordinate, formattedSelectedFile)
      );
      if (index === -1) {
        alert("Coordinate Not Found");
      }

      // Get the matched object
      const data = index !== -1 ? parameters[index] : null;

      // setCoordinateIndex(index);

      // setName(data?.windowName);
      // setSelectedFieldType("questionField");
      // setWindowNgOption(data?.ngAction);
      // setMinimumMark(data?.iMaximumMarks);
      // setMaximumMark(data?.iMinimumMarks);
      // setNoInRow(data?.rowNumber);
      // setNoInCol(data?.columnNumber);
      // setStartRowInput(formattedSelectedFile["Start Row"]);
      // setEndRowInput(formattedSelectedFile["End Row"]);
      // setStartColInput(formattedSelectedFile["Start Col"]);
      // setEndColInput(formattedSelectedFile["End Col"]);
      // setReadingDirectionOption(data?.iDirection);
      // setType(data?.iType);
      // setNumberOfField(data?.totalNumberOfFields);
      // setFieldType(data?.numericOrAlphabets);
      // setMultiple(data?.multipleAllow);
      // setMultipleValue(data?.multipleValue);
      // setBlank(data?.blankAllow);
      // setBlankValue(data?.blankValue);
      // setNoOfStepInRow(data?.rowStep);
      // setNoOfStepInCol(data?.columnStep);
      // setCustomValue(data?.customFieldValue);
      setShowFront(data?.side === "front" ? true : false);
    } else if (selectedField?.fieldType === "formField") {
      const parameters = template[0].formFieldWindowParameters;

      const index = parameters.findIndex((item) => {
        return isEqual(item.Coordinate, formattedSelectedFile);
      });

      if (index === -1) {
        alert("Coordinate Not Found");
      }

      // Get the matched object
      const data = index !== -1 ? parameters[index] : null;

      // setCoordinateIndex(index);
      // setSelectedFieldType("formField");
      // setName(data?.windowName);
      // setWindowNgOption(data?.ngAction);
      // setMinimumMark(data?.iMaximumMarks);

      // setMaximumMark(data?.iMinimumMarks);
      // setNoInRow(data?.rowNumber);
      // setNoInCol(data?.columnNumber);
      // setStartRowInput(formattedSelectedFile["Start Row"] - 1);
      // setEndRowInput(formattedSelectedFile["End Row"] - 1);
      // setStartColInput(formattedSelectedFile["Start Col"]);
      // setEndColInput(formattedSelectedFile["End Col"]);
      // setReadingDirectionOption(data?.iDirection);
      // setType(data?.iType);
      // // setOption(data?.iOption);
      // setNumberOfField(data?.totalNumberOfFields);
      // setFieldType(data?.numericOrAlphabets);
      // setMultiple(data?.multipleAllow);
      // setMultipleValue(data?.multipleValue);
      // setBlank(data?.blankAllow);
      // setBlankValue(data?.blankValue);
      // setSuffix(data?.suffix);
      // setPrefix(data?.prefix);
      // setNoOfStepInRow(data?.rowStep);
      // setNoOfStepInCol(data?.columnStep);
      // setCustomValue(data?.customFieldValue);
      // setFormatting(data?.formatting);
      setShowFront(data?.side === "front" ? true : false);
    } else if (selectedField?.fieldType === "skewMarkField") {
      const parameters = template[0].skewMarksWindowParameters;
      const index = parameters.findIndex((item) =>
        isEqual(item.Coordinate, formattedSelectedFile)
      );

      // Get the matched object
      const data = index !== -1 ? parameters[index] : null;
      // setCoordinateIndex(index);
      // setModalUpdate(true);
      // setModalShow(true);
      // setSelectedFieldType("skewMarkField");
      // setStartRowInput(formattedSelectedFile["Start Row"]);
      // setEndRowInput(formattedSelectedFile["End Row"]);
      // setStartColInput(formattedSelectedFile["Start Col"]);
      // setEndColInput(formattedSelectedFile["End Col"]);
      // setNumberOfField(data?.totalNumberOfFields);
      // setNoOfStepInRow(data?.rowStep);
      // setNoOfStepInCol(data?.columnStep);
      // setName(data?.windowName);
      // setWindowNgOption(data?.ngAction);
      // setMinimumMark(data?.iMaximumMarks);
      // setMaximumMark(data?.iMinimumMarks);
      // setType(data?.iType);
      // setReadingDirectionOption(data?.iDirection);
      // setNoInRow(data?.rowNumber);
      // setNoInCol(data?.columnNumber);
      // setSkewOption(data?.dataRejection);
      // setSkewFieldValue(data?.skewFieldValue);
      setShowFront(data?.side === "front" ? true : false);
    }
  };

  const handleCrossClick = (selectedField, index) => {
    const response = window.confirm(
      "Are you sure you want to delete the selected field ?"
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
    const template = dataCtx.allTemplates.find((item) => {
      return item[0].layoutParameters?.key ?? "" === templateIndex;
    });
    dataCtx.deleteFieldTemplateWithUUID(templateIndex, formattedSelectedFile);
    const jsonFile = showFront
      ? template[0].layoutParameters.numberedExcelJsonFile
      : template[0].layoutParameters.numberedBackExcelJsonFile;

    resetJson(
      jsonFile,
      formattedSelectedFile["Start Row"] - 1,
      formattedSelectedFile["End Row"] - 1,
      formattedSelectedFile["Start Col"],
      formattedSelectedFile["End Col"]
    );
  };

  const handleIconMouseUp = (event) => {
    event.stopPropagation();
  };

  const sendHandler = async () => {
    // Retrieve the selected template
    const template = dataCtx.allTemplates.find((item) => {
      return item[0].layoutParameters?.key ?? "" === templateIndex;
    });

    // const template = dataCtx.allTemplates[templateIndex];

    // Extract layout parameters and its coordinates
    const layoutParameters = template[0].layoutParameters;

    const idpatttern = "000000000000000000000000";
    if (layoutParameters.idMarksPattern === idpatttern) {
      layoutParameters.columnNumber = 1;
      layoutParameters.columnStart = 3;
      layoutParameters.columnStep = 1;
      layoutParameters.rowNumber = 1;
      layoutParameters.rowStart = 1;
      layoutParameters.rowStep = 1;
    }

    const Coordinate = layoutParameters.Coordinate;
    let layoutCoordinates = {};
    // Transform layout coordinates into the required format
    if (Coordinate) {
      layoutCoordinates = {
        right: Coordinate["End Col"],
        end: Coordinate["End Row"],
        left: Coordinate["Start Col"],
        start: Coordinate["Start Row"],
        name: Coordinate["name"],
        fieldType: Coordinate["fieldType"],
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
    if (updatedLayout.idStatus === "not present") {
      updatedLayout.iDirection = 4;
    }
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
              name: Coordinate["name"],
              fieldType: Coordinate["fieldType"],
            }
          : {};
        return { ...rest, questionWindowCoordinates };
      });

    // Transform skew marks window parameters into the required format
    const skewMarksWindowParameters = template[0].skewMarksWindowParameters
      ? template[0].skewMarksWindowParameters.map((item) => {
          const { Coordinate, ...rest } = item;
          const layoutWindowCoordinates = Coordinate
            ? {
                right: Coordinate["End Col"],
                end: Coordinate["End Row"],
                left: Coordinate["Start Col"],
                start: Coordinate["Start Row"],
                name: Coordinate["name"],
                fieldType: Coordinate["fieldType"],
              }
            : {};
          return { ...rest, layoutWindowCoordinates };
        })
      : [];

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
              name: Coordinate["name"],
              fieldType: Coordinate["fieldType"],
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
      questionsWindowParameters,
      skewMarksWindowParameters,
      formFieldWindowParameters,
      imageCroppingDTO: imageCroppingDTO ? imageCroppingDTO : [],
      linkedCoordinates,
    };
// console.log(fullRequestData)
// return
    const formattedData = updateFormFieldCoordinates(
      fullRequestData,
      backExcelJsonFile.length
    );
    // console.log(fullRequestData);

    handleCancel();
    sessionStorage.setItem("StructuredTemplate", JSON.stringify(formattedData));
  };
  const handleImage = (images) => {
    setImagesSelectedCount(images.length);
    if (images.length > 0) {
      dataCtx.addImageCoordinate(templateIndex, images);
    }
  };
  const saveRegion = (pitchValue, value, copiedNumber) => {
    try {
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
            iOption: selectedFieldType === "formField" ? 1 : 0,
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
            side: showFront ? "front" : "back",
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
            iOption: selectedFieldType === "formField" ? 1 : 0,
            iMinimumMarks: 1,
            iMaximumMarks: 1,
            iType: type,
            ngAction: windowNgOption,
            skewMark: +skewoption,
            dataRejection: skewoption,
            skewFieldValue: skewFieldValue,
            side: showFront ? "front" : "back",
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

            imageStructureData: position,
            columnStart: +newObject?.startCol,
            columnNumber: +noInCol,
            columnStep: +noOfStepInCol,
            rowStart: +newObject?.startRow + 1,
            rowNumber: +noInRow,
            rowStep: +noOfStepInRow,
            iDirection: +readingDirectionOption,
            idMarksPattern: idNumber.toString(),
            side: showFront ? "front" : "back",
          };
        }

        dataCtx.modifyAllTemplate(0, newData, selectedField.fieldType);
      }

      setSelectedCoordinates((prev) => [...prev, ...newCoordinates]);
    } catch (err) {
      console.log(err);
    }
  };

  const saveGroupRegion = (pitchValue, value, copiedNumber) => {
    try {
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
        ...filteredSelectedCoordinate.map((f) => f.endCol)
      );
      const minStartCol = Math.min(
        ...filteredSelectedCoordinate.map((f) => f.startCol)
      );
      const maxEndRow = Math.max(
        ...filteredSelectedCoordinate.map((f) => f.endRow)
      );
      const minStartRow = Math.min(
        ...filteredSelectedCoordinate.map((f) => f.startRow)
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
              runningQuestionNumber
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
              iOption: field.fieldType === "formField" ? 1 : 0,
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
              side: showFront ? "front" : "back",
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
              iOption: 0,
              iMinimumMarks: 1,
              iMaximumMarks: 1,
              iType: type,
              ngAction: windowNgOption,
              skewMark: +skewoption,
              dataRejection: skewoption,
              skewFieldValue: skewFieldValue,
              side: showFront ? "front" : "back",
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
              side: showFront ? "front" : "back",
            };
          }

          dataCtx.modifyAllTemplate(0, newData, field.fieldType);
          setSelectedCoordinates((prev) => [...prev, newField]);
        }
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.log(err);
    }
  };

  if (dataCtx.allTemplates.length === 0) {
    return <div>Loading</div>;
  }

  if (currentExcelJsonFile.length === 0) {
    return <div>Loading</div>;
  }

  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 99 }}>
        <SmallHeader />
      </div>
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
        {/* Dropdown on the right */}
      </div>

      <div
        style={{
          position: isWideScreen ? "fixed" : "absolute",
          top: "5px",
          left: "280px", // Adjust this if needed
          marginTop: "8px",
          zIndex: 999,
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          border: "1px solid #ced4da",
          padding: "6px 12px",
        }}
      >
        <select
          style={{
            fontSize: "0.9rem",
            border: "none",
            background: "transparent",
            outline: "none",
            color: "#212529",
          }}
          defaultValue="Front"
          onChange={(e) => {
            if (e.target.value === "Front") {
              setShowFront(true);
            } else {
              setShowFront(false);
            }
          }}
        >
          <option value="Front">Front Side</option>
          <option value="Back">Back Side</option>
        </select>
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
                style={{ position: "relative" }}
              >
                Image Area
                <Badge
                  pill
                  variant="light"
                  style={{
                    position: "absolute",
                    top: "-5px", // Adjust this value to position the badge correctly
                    right: "-5px", // Adjust this value to position the badge correctly
                    transform: "translate(50%, -50%)",
                    zIndex: "1000",
                  }}
                >
                  {imagesSelectedCount}{" "}
                  {/* Replace this with your dynamic number */}
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
                Layout Details
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
          <div className="main-container" style={{ marginTop: "0.5rem" }}>
            <div className="containers">
              <div
                className={`d-flex ${
                  !showFront ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div style={{ marginRight: "1rem", marginLeft: "1rem" }}>
                  <div className="top"></div>
                  {Array.from({ length: numRows }).map((_, rowIndex) => (
                    <div
                      key={rowIndex}
                      className={`row d-flex ${
                        activeArea.row === rowIndex ? "rowactive" : ""
                      } ${!showFront ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={
                          bubbleType === "circle"
                            ? "left-nums-circle"
                            : "left-nums"
                        }
                      >
                        {rowIndex + 1}
                      </div>

                      <div
                        className={
                          bubbleType === "circle"
                            ? "left-num-circle"
                            : "left-num"
                        }
                      >
                        <div className="timing-mark "></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="top-row">
                    <div className="corner"></div>
                    {Array.from({ length: numCols }).map((_, index) => (
                      <div
                        key={index}
                        className={`top-num ${
                          activeArea.col === index ? "colactive" : ""
                        }`}
                      >
                        {index + 1}
                      </div>
                    ))}
                  </div>
                  <div
                    id="grid-div"
                    // style={{
                    //   border: "2px solid black",
                    //   paddingTop: "1rem",
                    //   paddingRight: "1.2rem",
                    //   paddingLeft: "1rem",
                    //   overflowY: "auto",
                    //   // marginRight: "1rem"
                    //   width: "max-content",
                    // }}

                    onMouseLeave={() => {
                      setActiveArea({ row: null, col: null });
                    }}
                    className="grid-container"
                  >
                    <div
                      className="grid"
                      ref={imageRef}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}
                    >
                      {/* {Array.from({ length: numRows }).map((_, rowIndex) => {
                        const result = [
                          ...currentExcelJsonFile.map(Object.values),
                        ];
                        console.log(result);
                        const templates = dataCtx.allTemplates[0];
                        let numberedJson = [];
                        if (showFront) {
                          numberedJson = templates
                            ? [
                                ...templates[0]?.layoutParameters?.numberedExcelJsonFile.map(
                                  Object.values
                                ),
                              ]
                            : [];
                        } else {
                          numberedJson = templates
                            ? [
                                ...templates[0]?.layoutParameters?.numberedBackExcelJsonFile.map(
                                  Object.values
                                ),
                              ]
                            : [];
                        }

                        return (
                          <div key={rowIndex} className="row">
                            <div
                              className={
                                bubbleType === "circle"
                                  ? "left-num-circle"
                                  : "left-num"
                              }
                              style={{ visibility: "hidden" }}
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
                                let bgColor =
                                  +result[rowIndex][colIndex] >=
                                    +templates[0]?.layoutParameters
                                      ?.iSensitivity &&
                                  result[rowIndex][colIndex] !== undefined
                                    ? "black"
                                    : "";

                                if (num || num === 0) {
                                  bgColor = "lightgreen";
                                }
                                let fontColor =
                                  rowIndex < result.length &&
                                  colIndex < result[rowIndex].length &&
                                  result[rowIndex][colIndex] != 0 &&
                                  result[rowIndex][colIndex] !== undefined
                                    ? "lightgray"
                                    : "black";
                                if (num || num === 0) {
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
                                        bubbleType === "circle"
                                          ? "12px"
                                          : "8px",
                                      color: fontColor,
                                      userSelect: "none",
                                    }}
                                    onMouseEnter={(e) => {
                                      setActiveArea({
                                        row: rowIndex,
                                        col: colIndex,
                                      });
                                    }}
                                    onMouseLeave={(e) => {
                                      // setActiveArea({row: null, col: null})
                                    }}
                                    // style={{
                                    //     backgroundColor:
                                    //         result[rowIndex][colIndex] != 0 ? "black" : "",
                                    // }}
                                    className={`${bubbleType}
                                   ${
                                     selected[`${rowIndex},${colIndex}`]
                                       ? "selected"
                                       : ""
                                   }
                                  `}
                                  >
                                    {numberedJson.length > 0 &&
                                      numberedJson[rowIndex][colIndex]}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        );
                      })} */}

                      {Array.from({ length: numRows }).map((_, rowIndex) => {
                        const result = currentExcelJsonFile.map(Object.values);
                        const templates = dataCtx.allTemplates?.[0];
                        const layoutParams = templates[0]?.layoutParameters;
                        const fileData = showFront
                          ? layoutParams?.numberedExcelJsonFile
                          : layoutParams?.numberedBackExcelJsonFile;

                        const numberedJson = Array.isArray(fileData)
                          ? fileData.map(Object.values)
                          : typeof fileData === "object" && fileData !== null
                          ? Object.values(fileData).map(Object.values)
                          : [];

                        // const numberedJson = showFront
                        //   ? templates[0]?.layoutParameters?.numberedExcelJsonFile?.map(Object.values) ?? []
                        //   : templates[0]?.layoutParameters?.numberedBackExcelJsonFile?.map(Object.values) ?? [];
                        // console.log(templates[0]?.layoutParameters?.numberedExcelJsonFile?.map(Object.values) )
                        return (
                          <div key={rowIndex} className="row">
                            <div
                              className={
                                bubbleType === "circle"
                                  ? "left-num-circle"
                                  : "left-num"
                              }
                              style={{ visibility: "hidden" }}
                            >
                              <div className="timing-mark "></div>
                            </div>

                            {Array.from({ length: numCols }).map(
                              (_, colIndex) => {
                                const num =
                                  numberedJson?.[rowIndex]?.[colIndex] ?? null;
                                let bgColor =
                                  +result?.[rowIndex]?.[colIndex] >=
                                    +templates[0]?.layoutParameters
                                      ?.iSensitivity &&
                                  result?.[rowIndex]?.[colIndex] !== undefined
                                    ? "black"
                                    : "";

                                //   let bgColor =
                                //  Number(result?.[rowIndex]?.[colIndex]) >= templates[0].layoutParameters.iSensitivity

                                //   ? "black"
                                //   : "";
                                // console.log(bgColor)
                                if (num || num === 0) {
                                  bgColor = "lightgreen";
                                }

                                let fontColor =
                                  result?.[rowIndex]?.[colIndex] != 0 &&
                                  result?.[rowIndex]?.[colIndex] !== undefined
                                    ? "lightgray"
                                    : "black";

                                if (num || num === 0) {
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
                                        bubbleType === "circle"
                                          ? "12px"
                                          : "8px",
                                      color: fontColor,
                                      userSelect: "none",
                                    }}
                                    onMouseEnter={() => {
                                      setActiveArea({
                                        row: rowIndex,
                                        col: colIndex,
                                      });
                                    }}
                                    className={`${bubbleType} ${
                                      selected[`${rowIndex},${colIndex}`]
                                        ? "selected"
                                        : ""
                                    }`}
                                  >
                                    {num}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        );
                      })}

                      {currentSelectedField.map((data, index) => {
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
                          currentSelectedCoordinate
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
            position: "sticky",
            bottom: 0,
            marginTop: "10px",
            zIndex: "998",
          }}
        >
          <ExcelLikeTable
            handleEyeClick={handleEyeClick}
            linkFields={linkFields}
            selected={selectedCoordinates}
            handleSingleSelect={(item, indexOfField) => {
              // console.log(selectedCoordinates)
              handleMoveIndexClick(item, indexOfField);
              setCurrentSelectedCoordinate(item);
            }}
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
            <>
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
                      onBlur={(e) => {
                        const value = e.target.value;

                        if (selectedFieldType === "questionField") {
                          const isValid = /^Q\d+\s*[-–]\s*Q\d+$/i.test(value);

                          if (!isValid && value.trim() !== "") {
                            toast.warn(
                              "Invalid format. Please enter in Q1–Q2 format."
                            );
                            inputRef.current?.focus();
                          }
                        }
                      }}
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
                selectedFieldType === "formField") && (
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
                      <option value="0">No Action</option>
                    </select>
                  </div>
                </Row>
              )}

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
                      console.log(newValue);

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
                      console.log(typeof numericValue); // This will now always be 'number'
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
                        ""
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
                        setMaximumMark(numericValue);
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
                    value={[noOfStepInCol]}
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
                        console.log(sum);
                        setNumberOfField(
                          Math.ceil(
                            (+endRowInput - +startRowInput + 1) / noOfStepInRow
                          )
                        );
                      } else {
                        setNumberOfField(
                          Math.ceil(
                            (+endColInput - +startColInput + 1) / noOfStepInCol
                          )
                        );
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
                          ""
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
            </>
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
        aria-labelledby="contained-modal-title-vcenter"
        centered
        onHide={() => setImageModalShow(false)}
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Image Detail
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "60vh" }}>
          <ImagesCropper
            handleImage={handleImage}
            images={images}
            selectedCoordinateData={selectedCoordinates}
          />
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
        <LayoutDetailModal
          show={detailPage}
          layoutData={layoutFieldData}
          onHide={() => setDetailPage(false)}
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
          linkFields={linkFields}
          onHide={() => {
            setShowFieldDetails(false);
          }}
          selected={selectedCoordinates}
          editHandler={(item, i) => handleEyeClick(item, i)}
          deleteHandler={(item, i) => handleCrossClick(item, i)}
        />
      )}

      {!showSideBar && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "0",
            width: "50px",
            height: "100px",
            backgroundColor: "gray",
            borderTopRightRadius: "50px",
            borderBottomRightRadius: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 1050,
            transition: "all 0.3s ease",
            transform: "translateX(-10px)",
          }}
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

      <RightSideBar
        isOpen={showRightSideBar}
        onClose={() => setShowRightSideBar(false)}
        selectedWindow={linkFields}
        setCurrentLinkField={setCurrentLinkField}
        currentLinkField={currentLinkField}
      />

      <SideBar
        isOpen={showSideBar}
        onClose={() => setShowSideBar(false)}
        selectedWindow={selectedCoordinates}
      />
    </>
  );
};

export default DuplexDesignTemplate;
