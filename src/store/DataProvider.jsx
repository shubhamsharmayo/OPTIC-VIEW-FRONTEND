import React, { useEffect, useState } from "react";
import DataContext from "./DataContext"; // Assuming you have a DataContext
import { isEqual } from "lodash";
import convertToCamelCase from "services/lowerLetter";
import StructureData from "services/dataSrtucture";
import _ from "lodash";
import resetJson from "data/resetJson";
import { useLocation } from "react-router-dom";

function updateCoordinates(data) {
  // ✅ Deep copy using JSON
  const copiedData = JSON.parse(JSON.stringify(data));

  if (!copiedData?.layoutParameters?.backExcelJsonFile) {
    return copiedData;
  }
  const num = copiedData.layoutParameters.backExcelJsonFile.length;

  function updateFields(fields) {
    if (!Array.isArray(fields)) return fields;

    return fields.map((field) => {
      if (field.side === "back") {
        return {
          ...field,
          rowStart: field.rowStart - num - 1,
          Coordinate: {
            ...field.Coordinate,
            "Start Row": field.Coordinate["Start Row"] - num,
            "End Row": field.Coordinate["End Row"] - num,
          },
        };
      }
      return field;
    });
  }

  // ✅ Update both formFieldWindowParameters and questionsWindowParameters
  if (copiedData) {
    if (Array.isArray(copiedData.formFieldWindowParameters)) {
      copiedData.formFieldWindowParameters = updateFields(
        copiedData.formFieldWindowParameters,
      );
    }
    if (Array.isArray(copiedData.questionsWindowParameters)) {
      copiedData.questionsWindowParameters = updateFields(
        copiedData.questionsWindowParameters,
      );
    }
  }

  return copiedData;
}

const initialData = {
  allTemplates: [],
  backendIP: "localhost",
}; // Initial data if localStorage is empty
function getBoundingBox(fields) {
  let minStartRow = Infinity;
  let minStartCol = Infinity;
  let maxEndRow = -Infinity;
  let maxEndCol = -Infinity;

  for (const field of fields) {
    if (field.startRow < minStartRow) minStartRow = field.startRow;
    if (field.startCol < minStartCol) minStartCol = field.startCol;
    if (field.endRow > maxEndRow) maxEndRow = field.endRow;
    if (field.endCol > maxEndCol) maxEndCol = field.endCol;
  }

  return {
    minStartRow,
    minStartCol,
    maxEndRow,
    maxEndCol,
  };
}
const DataProvider = (props) => {
  // Initialize dataState from localStorage if it exists, otherwise use initialData
  const [dataState, setDataState] = useState(initialData);
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.includes("edit")) {
      const timer = setTimeout(() => {
        const storedData = sessionStorage.getItem("Template");
        if (!storedData) return;

        const parsedData = JSON.parse(storedData);

        if (Array.isArray(parsedData)) {
          const extractedObj = parsedData[0];

          // console.log(updateCoordinates(StructureData(convertToCamelCase(extractedObj))));
          const obj = StructureData(convertToCamelCase(extractedObj));
          const deepCopy = JSON.parse(JSON.stringify(obj));

          const temp = [[updateCoordinates(deepCopy)]];
          const sessionStorageData = [updateCoordinates(deepCopy)];
          // console.log(updateCoordinates(StructureData(convertToCamelCase(extractedObj))));
          setDataState({
            allTemplates: temp,
            backendIP: "localhost",
          });
          sessionStorage.setItem(
            "Template",
            JSON.stringify(sessionStorageData),
          );
        } else {
          const obj = StructureData(convertToCamelCase(parsedData));
          const deepCopy = JSON.parse(JSON.stringify(obj));

          const temp = [[updateCoordinates(deepCopy)]];
          setDataState({
            allTemplates: temp,
            backendIP: "localhost",
          });
        }
      }, 1000);

      return () => clearTimeout(timer); // Cleanup timeout
    }
  }, [location.pathname]);
  const templateHandler = (template) => {
    let newIndex;
    setDataState((prevState) => {
      // Ensure prevState.allTemplates is always an array
      const allTemplates = Array.isArray(prevState.allTemplates)
        ? prevState.allTemplates
        : [];
      newIndex = allTemplates.length; // Calculate the new index
      return {
        ...prevState,
        allTemplates: [...allTemplates, template],
      };
    });
    return newIndex; // Return the new index
  };

  const modifyTemplateHandler = (index, regionData, fieldType) => {
    setDataState((item) => {
      const copiedData = [...item.allTemplates];
      const currentTemplate = copiedData[index];
      console.log(regionData);
      switch (fieldType) {
        case "skewMarkField":
          currentTemplate[0].skewMarksWindowParameters = currentTemplate[0]
            .skewMarksWindowParameters
            ? [...currentTemplate[0]?.skewMarksWindowParameters, regionData]
            : [regionData];
          break;
        case "formField":
          currentTemplate[0].formFieldWindowParameters = currentTemplate[0]
            .formFieldWindowParameters
            ? [...currentTemplate[0].formFieldWindowParameters, regionData]
            : [regionData];
          break;
        case "questionField":
          // console.log([...currentTemplate[0].questionsWindowParameters, regionData])
          currentTemplate[0].questionsWindowParameters = currentTemplate[0]
            .questionsWindowParameters
            ? [...currentTemplate[0].questionsWindowParameters, regionData]
            : [regionData];
          break;
        default:
          currentTemplate[0].layoutParameters = {
            ...currentTemplate[0].layoutParameters,
            ...regionData,
          };
          break;
      }

      return {
        ...item,
        allTemplates: copiedData,
      };
    });
  };

  const modifyTemplateWithUUIDHandler = (uuid, regionData, fieldType) => {
    setDataState((prevState) => {
      const copiedData = [...prevState.allTemplates];

      // Find the current template instead of filtering
      const currentTemplate = copiedData.find((item) => {
        return item[0].layoutParameters?.key ?? "" === uuid;
      });

      // Ensure currentTemplate is found
      if (currentTemplate) {
        switch (fieldType) {
          case "skewMarkField":
            currentTemplate[0].skewMarksWindowParameters = currentTemplate[0]
              .skewMarksWindowParameters
              ? [...currentTemplate[0].skewMarksWindowParameters, regionData]
              : [regionData];
            break;
          case "formField":
            currentTemplate[0].formFieldWindowParameters = currentTemplate[0]
              .formFieldWindowParameters
              ? [...currentTemplate[0].formFieldWindowParameters, regionData]
              : [regionData];
            break;
          case "questionField":
            currentTemplate[0].questionsWindowParameters = currentTemplate[0]
              .questionsWindowParameters
              ? [...currentTemplate[0].questionsWindowParameters, regionData]
              : [regionData];
            break;
          default:
            currentTemplate[0].layoutParameters = {
              ...currentTemplate[0].layoutParameters,
              ...regionData,
            };
            break;
        }
      }

      return {
        ...prevState,
        allTemplates: copiedData,
      };
    });
  };

  const deleteTemplateHandler = (index) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this item?",
    );

    if (isConfirmed) {
      setDataState((prevState) => {
        const updatedTemplates = prevState.allTemplates.filter(
          (_, i) => i !== index,
        );
        return {
          ...prevState,
          allTemplates: updatedTemplates,
        };
      });
    }
  };
  const addToAllTemplateHandler = (template) => {
    setDataState((prevState) => {
      return {
        ...prevState,
        allTemplates: template,
      };
    });
  };

  const addFieldToTemplateHandler = (regionData, index) => {
    const {
      formFieldWindowParameters,
      imageData,
      printingData,
      questionsWindowParameters,
      skewMarksWindowParameters,
      barcodeData,
      layoutParameters,
      imageCroppingDTO,
    } = regionData;

    const imageCoordinates = layoutParameters.imageCoordinates;
    const imageStructureData = {
      height: imageCoordinates?.height,
      x: imageCoordinates?.x,
      y: imageCoordinates?.y,
      width: imageCoordinates?.width,
    };

    const layoutCoordinates = layoutParameters.layoutCoordinates;
    console.log(layoutCoordinates);
    const Coordinate = {
      "End Col": layoutCoordinates["right"],
      "End Row": layoutCoordinates["end"],
      "Start Col": layoutCoordinates["left"],
      "Start Row": layoutCoordinates["start"],
      name: layoutCoordinates["name"],
      fieldType: layoutCoordinates["fieldType"],
    };

    const updatedLayoutParameter = {
      ...layoutParameters,
      Coordinate,
      imageStructureData,
    };
    delete updatedLayoutParameter.imageCoordinates;
    delete updatedLayoutParameter.layoutCoordinates;

    const updateCoordinates = (items, coordKey) =>
      items?.map((item) => {
        const coordinates = item[coordKey];
        console.log(coordinates)
        const newCoordinates = coordinates
          ? {
              "End Col": coordinates["right"],
              "End Row": coordinates["end"],
              "Start Col": coordinates["left"],
              "Start Row": coordinates["start"],
              name: coordinates["name"],
              fieldType: coordinates["fieldType"],
            }
          : {};
        return { ...item, Coordinate: newCoordinates };
      });

    const updatedFormField = updateCoordinates(
      formFieldWindowParameters,
      "formFieldCoordinates",
    );
    const updatedSkewField = updateCoordinates(
      skewMarksWindowParameters,
      "layoutWindowCoordinates",
    );
    const updatedQuestionField = updateCoordinates(
      questionsWindowParameters,
      "questionWindowCoordinates",
    );

    setDataState((prevState) => {
      const copiedData = JSON.parse(JSON.stringify(prevState.allTemplates)); // Deep copy to avoid mutation
      if (!copiedData[index]) {
        console.error(`Invalid index: ${index}`);
        return prevState;
      }

      const currentTemplate = copiedData[index];
      currentTemplate[0] = {
        ...currentTemplate[0],
        skewMarksWindowParameters: updatedSkewField,
        formFieldWindowParameters: updatedFormField,
        questionsWindowParameters: updatedQuestionField,
        imageData: imageData,
        printingData: printingData,
        barcodeData: barcodeData,
        layoutParameters: updatedLayoutParameter,
        imageCroppingDTO: imageCroppingDTO,
      };

      console.log(copiedData);
      return {
        ...prevState,
        allTemplates: copiedData,
      };
    });
  };

  const modifyRegionWithUUIDHandler = (
    uuid,
    regionData,
    fieldType,
    coordinateIndex,
  ) => {
    setDataState((item) => {
      const copiedData = [...item.allTemplates];

      // Find the current template instead of filtering
      const currentTemplate = copiedData.find((item) => {
        console.log(item);
        return item[0].layoutParameters?.key ?? "" === uuid;
      });
      if (!currentTemplate || currentTemplate.length === 0) {
        console.error("Invalid template index or empty template");
        return item;
      }

      const updateField = (fieldArray) => {
        if (
          fieldArray &&
          coordinateIndex >= 0 &&
          coordinateIndex < fieldArray.length
        ) {
          fieldArray[coordinateIndex] = regionData;
        } else {
          console.error("Invalid coordinate index");
        }
      };

      switch (fieldType) {
        case "skewMarkField":
          updateField(currentTemplate[0]?.skewMarksWindowParameters);
          break;
        case "formField":
          updateField(currentTemplate[0]?.formFieldWindowParameters);
          break;
        case "questionField":
          updateField(currentTemplate[0]?.questionsWindowParameters);
          break;
        default:
          currentTemplate[0].layoutParameters = {
            ...currentTemplate[0].layoutParameters,
            ...regionData,
          };
          break;
      }
      console.log(copiedData);
      return {
        ...item,
        allTemplates: copiedData,
      };
    });
  };
  const modifyWithRegionHandler = (
    templateIndex,
    regionData,
    fieldType,
    coordinateIndex,
  ) => {
    console.log(coordinateIndex);
    if (coordinateIndex === -1) {
      alert("Coordinate index cannot be -1");
      return;
    }

    setDataState((item) => {
      const copiedData = [...item.allTemplates];
      const currentTemplate = copiedData[templateIndex];

      if (!currentTemplate || currentTemplate.length === 0) {
        console.error("Invalid template index or empty template");
        return item;
      }

      const updateField = (fieldArray) => {
        if (
          fieldArray &&
          coordinateIndex >= 0 &&
          coordinateIndex < fieldArray.length
        ) {
          fieldArray[coordinateIndex] = regionData;
        } else {
          console.error("Invalid coordinate index");
        }
      };

      switch (fieldType) {
        case "skewMarkField":
          updateField(currentTemplate[0]?.skewMarksWindowParameters);
          break;
        case "formField":
          updateField(currentTemplate[0]?.formFieldWindowParameters);
          break;
        case "questionField":
          updateField(currentTemplate[0]?.questionsWindowParameters);
          break;
        default:
          currentTemplate[0].layoutParameters = {
            ...currentTemplate[0].layoutParameters,
            ...regionData,
          };
          break;
      }

      return {
        ...item,
        allTemplates: copiedData,
      };
    });
  };

  const deleteFieldTemplateHandler = (templateIndex, selectedFieldData) => {
    const fieldType = selectedFieldData.fieldType;
    setDataState((item) => {
      const copiedData = [...item.allTemplates];
      const currentTemplate = copiedData[templateIndex][0];
      switch (fieldType) {
        case "skewMarkField":
          const parameters = currentTemplate?.skewMarksWindowParameters;

          const updatedSkew = parameters.filter(
            (item) => !isEqual(item.Coordinate, selectedFieldData),
          );

          currentTemplate.skewMarksWindowParameters = updatedSkew;
          break;
        case "formField":
          const formparameters = currentTemplate?.formFieldWindowParameters;

          const updatedForm = formparameters.filter(
            (item) => !isEqual(item.Coordinate, selectedFieldData),
          );

          currentTemplate.formFieldWindowParameters = updatedForm;
          break;
        case "questionField":
          const questionparameters = currentTemplate?.questionsWindowParameters;

          const questionForm = questionparameters.filter(
            (item) => !isEqual(item.Coordinate, selectedFieldData),
          );

          currentTemplate.questionsWindowParameters = questionForm;
          break;
        default:
          const copiedLayout = { ...currentTemplate.layoutParameters };
          delete copiedLayout.Coordinate;
          copiedLayout.idMarksPattern = "000000000000000000000000000";
          copiedLayout.columnNumber = 3;
          copiedLayout.columnStart = 1;
          copiedLayout.columnStep = 1;
          copiedLayout.rowNumber = 1;
          copiedLayout.rowStart = 1;
          copiedLayout.rowStep = 1;
          copiedLayout.ngAction = "0x00000001";
          copiedLayout.layoutCoordinates = {};
          currentTemplate.layoutParameters = copiedLayout;

          break;
      }
      console.log(copiedData);
      return {
        ...item,
        allTemplates: copiedData,
      };
    });
  };

  const deleteFieldTemplateWithUUIDHandler = (uuid, selectedFieldData) => {
    const fieldType = selectedFieldData.fieldType;
    setDataState((item) => {
      const copiedData = [...item.allTemplates];

      // Find the current template instead of filtering
      const currentTemplate = copiedData.find((item) => {
        console.log(item);
        return item[0].layoutParameters?.key ?? "" === uuid;
      })[0];
      console.log(currentTemplate);

      switch (fieldType) {
        case "skewMarkField":
          const parameters = currentTemplate?.skewMarksWindowParameters;

          const updatedSkew = parameters.filter(
            (item) => !isEqual(item.Coordinate, selectedFieldData),
          );

          currentTemplate.skewMarksWindowParameters = updatedSkew;
          break;
        case "formField":
          const formparameters = currentTemplate?.formFieldWindowParameters;
          console.log(formparameters);
          const updatedForm = formparameters.filter(
            (item) => !isEqual(item.Coordinate, selectedFieldData),
          );

          currentTemplate.formFieldWindowParameters = updatedForm;
          break;
        case "questionField":
          const questionparameters = currentTemplate?.questionsWindowParameters;

          const questionForm = questionparameters.filter(
            (item) => !isEqual(item.Coordinate, selectedFieldData),
          );

          currentTemplate.questionsWindowParameters = questionForm;
          break;
        default:
          const copiedLayout = { ...currentTemplate.layoutParameters };
          delete copiedLayout.Coordinate;
          copiedLayout.idMarksPattern = "000000000000000000000000000";
          copiedLayout.columnNumber = 3;
          copiedLayout.columnStart = 1;
          copiedLayout.columnStep = 1;
          copiedLayout.rowNumber = 1;
          copiedLayout.rowStart = 1;
          copiedLayout.rowStep = 1;
          copiedLayout.ngAction = "0x00000001";
          copiedLayout.layoutCoordinates = {};
          currentTemplate.layoutParameters = copiedLayout;
          break;
      }
      return {
        ...item,
        allTemplates: copiedData,
      };
    });
  };

  const addRegionDataHandler = (index, regionData, fieldType) => {
    setDataState((item) => {
      const copiedData = [...item.allTemplates];
      const currentTemplate = copiedData[index];

      switch (fieldType) {
        case "skewMarkField":
          currentTemplate[0].skewMarksWindowParameters = currentTemplate[0]
            .skewMarksWindowParameters
            ? [...currentTemplate[0]?.skewMarksWindowParameters, regionData]
            : [regionData];
          break;
        case "formField":
          currentTemplate[0].formFieldWindowParameters = currentTemplate[0]
            .formFieldWindowParameters
            ? [...currentTemplate[0].formFieldWindowParameters, regionData]
            : [regionData];
          break;
        case "questionField":
          currentTemplate[0].questionsWindowParameters = currentTemplate[0]
            .questionsWindowParameters
            ? [...currentTemplate[0].questionsWindowParameters, regionData]
            : [regionData];
          break;
        default:
          currentTemplate[0].layoutParameters = {
            ...currentTemplate[0].layoutParameters,
            ...regionData,
          };
          break;
      }

      return {
        ...item,
        allTemplates: copiedData,
      };
    });
  };
  const addImageCoordinateWithIndexHandler = (
    templateIndex,
    imageCoordinates,
  ) => {
    setDataState((prevState) => {
      // Create a deep copy of the current state to avoid direct mutation
      const copiedData = [...prevState.allTemplates];

      // If a matching template is found, update its imageCroppingDTO
      if (templateIndex !== -1) {
        copiedData[templateIndex][0].imageCroppingDTO = imageCoordinates;
      }

      // Return the new state
      return {
        ...prevState,
        allTemplates: copiedData,
      };
    });
  };
  const addImageCoordinateHandler = (uuid, imageCoordinates) => {
    setDataState((prevState) => {
      // Create a deep copy of the current state to avoid direct mutation
      const copiedData = [...prevState.allTemplates];

      // Find the index of the current template
      const templateIndex = copiedData.findIndex((template) => {
        return template[0].layoutParameters?.key ?? "" === uuid;
      });
      console.log(templateIndex);
      // If a matching template is found, update its imageCroppingDTO
      if (templateIndex !== -1) {
        copiedData[templateIndex][0].imageCroppingDTO = imageCoordinates;
      }

      // Return the new state
      return {
        ...prevState,
        allTemplates: copiedData,
      };
    });
  };

  const updateLayoutParameterHandler = (templateIndex, dataField) => {
    setDataState((prevState) => {
      // Make sure the index is valid
      if (templateIndex < 0 || templateIndex >= prevState.allTemplates.length) {
        console.warn("Invalid templateIndex:", templateIndex);
        return prevState; // or handle the error as needed
      }
      console.log(dataField);
      // Destructure dataField
      const { layoutParameters, imageData, printingData, barcodeData } =
        dataField;

      // Clone the previous state
      const copiedData = [...prevState.allTemplates];
      const currentTemplate = copiedData[templateIndex][0];
      const iDifference = layoutParameters.iDifference;
      const iSensitivity = layoutParameters.iSensitivity;

      // Update the fields in the current template
      currentTemplate.layoutParameters = {
        ...currentTemplate.layoutParameters,
        ...layoutParameters, // Assuming you want to merge with existing layoutParameters
      };
      currentTemplate.imageData = {
        ...currentTemplate.imageData,
        ...imageData, // Assuming you want to merge with existing imageData
      };
      currentTemplate.printingData = {
        ...currentTemplate.printingData,
        ...printingData, // Assuming you want to merge with existing printingData
      };
      currentTemplate.barcodeData = {
        ...currentTemplate.barcodeData,
        ...barcodeData, // Assuming you want to merge with existing barcodeData
      };
      const skewFields = currentTemplate.skewMarksWindowParameters ?? [];
      skewFields.forEach((field) => {
        field.iSensitivity = iSensitivity;
        field.iDifference = iDifference;
      });
      const formFields = currentTemplate.formFieldWindowParameters ?? [];
      formFields.forEach((field) => {
        field.iSensitivity = iSensitivity;
        field.iDifference = iDifference;
      });
      const questionFields = currentTemplate.questionsWindowParameters ?? [];
      questionFields.forEach((field) => {
        field.iSensitivity = iSensitivity;
        field.iDifference = iDifference;
      });

      // Return the new state
      return {
        ...prevState,
        allTemplates: copiedData,
      };
    });
  };

  const updateTemplateParameterHandler = (templateIndex, dataField) => {
    setDataState((prevState) => {
      // Make sure the index is valid
      if (templateIndex < 0 || templateIndex >= prevState.allTemplates.length) {
        console.warn("Invalid templateIndex:", templateIndex);
        return prevState; // or handle the error as needed
      }

      // Destructure dataField
      const { layoutParameters, imageData, printingData, barcodeData } =
        dataField;

      // Clone the previous state
      const copiedData = [...prevState.allTemplates];
      const currentTemplate = copiedData[templateIndex][0];

      // Update the fields in the current template
      currentTemplate.layoutParameters = {
        ...currentTemplate.layoutParameters,
        ...layoutParameters, // Assuming you want to merge with existing layoutParameters
      };
      currentTemplate.imageData = {
        ...currentTemplate.imageData,
        ...imageData, // Assuming you want to merge with existing imageData
      };
      currentTemplate.printingData = {
        ...currentTemplate.printingData,
        ...printingData, // Assuming you want to merge with existing printingData
      };
      currentTemplate.barcodeData = {
        ...currentTemplate.barcodeData,
        ...barcodeData, // Assuming you want to merge with existing barcodeData
      };

      // Return the new state
      return {
        ...prevState,
        allTemplates: copiedData,
      };
    });
  };
  const setBackendIPHandler = (enteredIP) => {
    setDataState((prevState) => {
      return {
        ...prevState,
        backendIP: enteredIP,
      };
    });
  };
  const templateReplaceHandler = (templateData) => {
    setDataState((prevState) => {
      // Clone the previous state's allTemplates array
      const copiedData = [...prevState.allTemplates];

      // Find the index of the template with the matching UUID
      const templateIndex = copiedData.findIndex(
        (item) =>
          item[0]?.layoutParameters?.key ===
          templateData[0]?.layoutParameters.key,
      );

      // If the template is found, replace it with the new data
      if (templateIndex !== -1) {
        copiedData[templateIndex] = templateData;
      } else {
        console.warn(`Template with UUID not found.`);
      }

      // Return the new state object
      return {
        ...prevState,
        allTemplates: copiedData,
      };
    });
  };
  const setNewTemplatesHandler = (templateData) => {
    setDataState((prevState) => {
      return {
        ...prevState,
        allTemplates: templateData,
      };
    });
  };

  const changeIndexTemplateHandler = (updatedRegionDatas, fieldType) => {
    const isEqualIgnoreCase = (obj1, obj2) => {
      return _.isEqualWith(obj1, obj2, (val1, val2, key) => {
        if (
          key === "name" &&
          typeof val1 === "string" &&
          typeof val2 === "string"
        ) {
          return val1.toLowerCase() === val2.toLowerCase();
        }
      });
    };
    let updatedRegionData = updatedRegionDatas.map((item) => {
      return {
        "End Col": item.endCol,
        "End Row": item.endRow + 1,
        "Start Col": item.startCol,
        "Start Row": item.startRow + 1,
        fieldType: item.fieldType,
        name: item.name,
      };
    });
    console.log(updatedRegionData);
    setDataState((item) => {
      const copiedData = [...item.allTemplates];
      const currentTemplate = { ...copiedData[0][0] }; // Create a shallow copy of the first template

      const updateField = (fieldArray) => {
        const updatedIndexField = [];

        updatedRegionData.forEach((item) => {
          const fileIndex = fieldArray.findIndex((fieldItem) =>
            isEqualIgnoreCase(fieldItem?.Coordinate, item),
          );

          if (fileIndex !== -1) {
            updatedIndexField.push(fieldArray[fileIndex]);
          }
        });

        return updatedIndexField;
      };
      switch (fieldType) {
        case "skewMarkField":
          console.log(updateField(currentTemplate.skewMarksWindowParameters));
          currentTemplate.skewMarksWindowParameters = updateField(
            currentTemplate.skewMarksWindowParameters,
          );
          break;
        case "formField":
          console.log(updateField(currentTemplate.formFieldWindowParameters));
          currentTemplate.formFieldWindowParameters = updateField(
            currentTemplate.formFieldWindowParameters,
          );
          break;
        case "questionField":
          currentTemplate.questionsWindowParameters = updateField(
            currentTemplate.questionsWindowParameters,
          );
          break;
        default:
          return item; // If no valid fieldType is provided, return the existing state
      }

      return {
        ...item,
        allTemplates: [[currentTemplate]], // Ensure we only modify the first template
      };
    });
  };
  const linkFieldHandler = (fields, fieldName, fieldIndexes, fieldType) => {
    setDataState((item) => {
      const copiedData = [...item.allTemplates];
      const linkedCoordinates = getBoundingBox(fields);
      const updatedLinkedCoordinates = {
        ...linkedCoordinates,
        fieldName,
        fieldIndexes,
        fieldType,
      };
      copiedData[0][0].linkedCoordinates = [
        ...(copiedData[0][0].linkedCoordinates || []),
        updatedLinkedCoordinates,
      ];

      return {
        ...item,
        allTemplates: copiedData, // Ensure we only modify the first template
      };
    });
  };

  const deleteLinkFieldHandler = (index) => {
    setDataState((item) => {
      const copiedData = [...item.allTemplates];
      const linkedCoordinates = copiedData[0][0].linkedCoordinates;
      const updatedLinkedCoordinates = linkedCoordinates.filter(
        (_, i) => i !== index,
      );

      copiedData[0][0].linkedCoordinates = updatedLinkedCoordinates;

      return {
        ...item,
        allTemplates: copiedData,
      };
    });
  };
  const deleteMultipleFieldsHandler = (selectedFields) => {
    console.log(selectedFields);

    const selectedFieldMapped = selectedFields.map((item) => {
      return {
        "End Col": item.endCol,
        "End Row": item.endRow + 1,
        "Start Col": item.startCol,
        "Start Row": item.startRow + 1,
        fieldType: item.fieldType,
        name: item.name,
      };
    });

    setDataState((item) => {
      const copiedData = [...item.allTemplates];
      // return console.log(copiedData)
      // Loop through each selected field

      selectedFieldMapped.forEach((selectedFieldData) => {
        const fieldType = selectedFieldData.fieldType;

        // Find the current template by UUID
        const currentTemplate = copiedData[0][0];

        if (!currentTemplate) return; // Skip if no template found
        resetJson(
          currentTemplate.layoutParameters.numberedExcelJsonFile,
          selectedFieldData["Start Row"] - 1,
          selectedFieldData["End Row"] - 1,
          selectedFieldData["Start Col"],
          selectedFieldData["End Col"],
        );
        switch (fieldType) {
          case "skewMarkField":
            currentTemplate.skewMarksWindowParameters =
              currentTemplate.skewMarksWindowParameters.filter(
                (item) => !isEqual(item.Coordinate, selectedFieldData),
              );
            break;

          case "formField":
            currentTemplate.formFieldWindowParameters =
              currentTemplate.formFieldWindowParameters.filter(
                (item) => !isEqual(item.Coordinate, selectedFieldData),
              );
            break;

          case "questionField":
            currentTemplate.questionsWindowParameters =
              currentTemplate.questionsWindowParameters.filter(
                (item) => !isEqual(item.Coordinate, selectedFieldData),
              );
            break;

          default:
            const copiedLayout = { ...currentTemplate.layoutParameters };
            delete copiedLayout.Coordinate;
            copiedLayout.idMarksPattern = "000000000000000000000000000";
            copiedLayout.columnNumber = 3;
            copiedLayout.columnStart = 1;
            copiedLayout.columnStep = 1;
            copiedLayout.rowNumber = 1;
            copiedLayout.rowStart = 1;
            copiedLayout.rowStep = 1;
            copiedLayout.ngAction = "0x00000001";
            copiedLayout.layoutCoordinates = {};
            currentTemplate.layoutParameters = copiedLayout;
            break;
        }
      });

      return {
        ...item,
        allTemplates: copiedData,
      };
    });
  };

  const dataContext = {
    allTemplates: dataState.allTemplates,
    setAllTemplates: templateHandler,
    modifyAllTemplate: modifyTemplateHandler,
    deleteTemplate: deleteTemplateHandler,
    addToAllTemplate: addToAllTemplateHandler,
    addFieldToTemplate: addFieldToTemplateHandler,
    modifyWithRegion: modifyWithRegionHandler,
    deleteFieldTemplate: deleteFieldTemplateHandler,
    modifyRegionWithUUID: modifyRegionWithUUIDHandler,
    addRegionData: addRegionDataHandler,
    modifyTemplateWithUUID: modifyTemplateWithUUIDHandler,
    deleteFieldTemplateWithUUID: deleteFieldTemplateWithUUIDHandler,
    addImageCoordinate: addImageCoordinateHandler,
    updateLayoutParameter: updateLayoutParameterHandler,
    updateTemplateParameter: updateTemplateParameterHandler,
    addImageCoordinateWithIndex: addImageCoordinateWithIndexHandler,
    setBackendIP: setBackendIPHandler,
    replaceTemplate: templateReplaceHandler,
    setNewTemplates: setNewTemplatesHandler,
    changeIndexTemplate: changeIndexTemplateHandler,
    linkField: linkFieldHandler,
    deleteLinkField: deleteLinkFieldHandler,
    deleteMultipleFields: deleteMultipleFieldsHandler,
  };

  return (
    <DataContext.Provider value={dataContext}>
      {props.children}
    </DataContext.Provider>
  );
};

export default DataProvider;
