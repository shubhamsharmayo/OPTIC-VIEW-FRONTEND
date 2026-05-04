import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Modal,
  Button,
  Nav,
  Form,
  Tab,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import {
  IdOptionData,
  rejectData,
  sizeData,
  bubbleData,
  barcodeOptionData,
  windowNgData,
  faceData,
  directionData,
  barcodeTypeData,
  colorTypeData,
  encodingOptionData,
  rotationOptionData,
  resolutionOptionData,
  scanningSideData,
  imageStatusData,
  barcodeCategoryData,
  code39OrItfCheckDigitData,
  nw7CheckDigitData,
  upcaOptionData,
  upceOptionData,
  barcodeRejectData,
  printOptionData,
  printModeOption,
  printCustomOption,
  printOrientationOption,
} from "data/helperData";
import DataContext from "store/DataContext";
import Select, { components } from "react-select";
import { useNavigate } from "react-router-dom";
import ShadesOfGrey from "../../ui/shadesOfGrey";
import { MultiSelect } from "react-multi-select-component";
import axios from "axios";
import ImageSelection from "../../ui/imageSelection";
import { getScannedImage } from "helper/TemplateHelper";
import { toast } from "react-toastify";
import Jobcard from "../../ui/Jobcard";
import DuplexJob from "../../ui/DuplexJob";
import Papa from "papaparse";
import { getSampleData } from "helper/TemplateHelper";
import { v4 as uuidv4 } from "uuid";
import base64ToFile from "services/Base64toFile";
import { imageParamsData } from "data/helperData";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import CustomTooltip from "components/CustomTooltip";
import ImageUrls from "data/imageData";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { getUrls } from "helper/url_helper";
import { debounce } from "lodash";
import { digitType } from "data/helperData";
import { scannerData } from "data/helperData";

const DuplexTemplateModal = (props) => {
  const [modalShow, setModalShow] = useState(false);
  const [name, setName] = useState("");
  const [size, setSize] = useState({ id: 1, name: "A4" });
  const [numberOfLines, setNumberOfLines] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [backImageSrc, setBackImageSrc] = useState("");
  const [sensitivity, setSensitivity] = useState(3);
  const [difference, setDifference] = useState(8);
  const [barCount, setBarCount] = useState(0);
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [reject, setReject] = useState({ id: 1, name: "0", showName: "False" });
  const [numberOfFrontSideColumn, setNumberOfFrontSideColumn] = useState("");
  const [windowNgOption, setWindowNgOption] = useState({
    id: "0x00000001",
    name: "SKDV_ACTION_SELECT(0x00000001)",
    showName: "Paper ejection to select stacker",
  });
  const [face, setFace] = useState({ id: 0, name: "Front Side" });
  const [direction, setDirection] = useState();
  const [toggle, settoggle] = useState({});
  const [activeKey, setActiveKey] = useState("general");
  const [spanDisplay, setSpanDisplay] = useState("none");
  const dataCtx = useContext(DataContext);
  const [colorType, setColorType] = useState("grayscale");
  const [encoding, setEncoding] = useState();
  const [rotation, setRotation] = useState();
  const [resolution, setResolution] = useState();
  const [scannningSide, setScanningSide] = useState();
  const [imageParams, setImageParams] = useState(0);
  const [imageStatus, setImageStatus] = useState(imageStatusData[0]);
  const [barcodeType, setBarcodeType] = useState({});
  const [barcodeCategory, setBarcodeCategory] = useState({});
  const [barcodeRejectStatus, setBarcodeRejectStatus] = useState(
    barcodeRejectData[1]
  );
  const [checkDigit, setCheckDigit] = useState(null);
  const [barcodeRightPos, setBarcodeRightPos] = useState();
  const [barcodeLeftPos, setBarcodeLeftPos] = useState();
  const [barcodeTopPos, setBarcodeTopPos] = useState();
  const [barcodeBottomPos, setBarcodeBottomPos] = useState();
  const [option, setOption] = useState(null);
  const [imageFile, setImageFile] = useState();
  const [imageModal, setImageModal] = useState();
  const [image, setImage] = useState();

  const [imageTempFile, setTempImageFile] = useState();
  const [selectedUI, setSelectedUI] = useState("SIMPLEX");
  const [activeTab, setActiveTab] = useState("simplex");
  const [barcodeEnable, setBarcodeEnable] = useState({
    id: "disable",
    name: "Disable",
  });
  const [idPresent, setIdPresent] = useState(IdOptionData[1]);
  const [fileModal, setFileModal] = useState(false);
  const [excelJsonFile, setExcelJsonFile] = useState();
  const [excelFile, setExcelFile] = useState("");
  const [printEnable, setPrintEnable] = useState({
    id: "0",
    name: "Not Enable",
  });
  const [printOrientation, setPrintOrientation] = useState();
  const [printMode, setPrintMode] = useState();
  const [printCustom, setPrintCustom] = useState({ id: "date", name: "Date" });
  const [startPosition, setStartPosition] = useState(0);
  const [fontSpace, setFontSpace] = useState(0.8);
  const [printDigit, setPrintDigit] = useState(null);
  const [printStartNumber, setPrintStartNumber] = useState(null);
  const [printCustomValue, setPrintCustomValue] = useState(null);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [value, setValue] = React.useState(3);
  const [images, setImages] = useState([]);
  const [showFront, setShowFront] = useState(true);
  const [baseUrl, setBaseUrl] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [prefix, setPrefix] = useState("0000");
  const [prefixzeroes, setPrefixZeroes] = useState("0000");
  const [scanner, setScanner] = useState("scanner1");
  const [backExcelJsonFile, setBackExcelJsonFile] = useState([]);
  const [numberOfBackSideColumn, setNumberOfBackSideColumn] = useState(null);
  const [numberBackSideRow, setNumberBackSideRow] = useState(null);
  const navigate = useNavigate();
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
  const handleChange = (newValue) => {
    setValue(newValue);
    setSensitivity(newValue);
  };

  const jobHandler = (e) => {
    setSelectedUI(e);
  };
  const handleSelect = (selectedKey) => {
    console.log(selectedKey);
    setActiveTab(selectedKey);
  };
  const imageModalHandler = () => {
    setImageModal(true);
  };
  const resetModalHandler = () => {
    settoggle({});
    // setModalShow(false);
    setName("");
    // setSize({ id: 1, name: "A4" });
    // setNumberOfLines("");
    // setImageSrc("/img.jpg");
    // setSensitivity(1);
    setDifference("");
    setBarCount(0);
    setSelectedBubble({});
    setReject(undefined);
    setNumberOfFrontSideColumn("");
    setWindowNgOption("");
    setFace("");
    setDirection(undefined);
    // setActiveKey("general");
    // setSpanDisplay("none");
    // setColorType(undefined);
    // setEncoding(undefined);
    // setRotation(undefined);
    // setResolution(undefined);
    // setScanningSide(undefined);
    // setImageStatus(imageStatusData[0]);
    // setBarcodeReadingArea(undefined);
    // setBarcodeType({});
    // setBarcodeCategory({});
    // setBarcodeRejectStatus(barcodeRejectData[1]);
    // setCheckDigit(null);
    // setBarcodeRightPos(undefined);
    // setBarcodeLeftPos(undefined);
    // setBarcodeTopPos(undefined);
    // setBarcodeBottomPos(undefined);
    // setOption(null);
    // setSelected([]);
    // setSelectedColumn(null);
    // setValues(Array(48).fill(0));
    // setOptions([]);
    // setColIdPattern(undefined);
    // setIdNumber("");
    // setImageFile(undefined);
    // setImageModal(undefined);
    // setImage(undefined);
    // setTempImageFile(undefined);
    // setSelectedUI("");
    setActiveTab("simplex");
    setBarcodeEnable({ id: "disable", name: "Disable" });
    // setImageUrl("");
    // setIdPresent("");
    // createTemplateHandler();
  };
  useEffect(() => {
    if (props.show) {
      setModalShow(true);
    } else {
      setModalShow(false);
    }
  }, [props.show]);

  const Option = (props) => {
    return (
      <components.Option {...props}>
        {props.data.icon && (
          <span style={{ marginRight: 8 }}>{props.data.icon}</span>
        )}
        {props.data.name}
      </components.Option>
    );
  };
  const SingleValue = (prop) => {
    return (
      <components.SingleValue {...prop}>
        {prop.data.icon && (
          <span style={{ marginRight: 8 }}>{prop.data.icon}</span>
        )}
        {prop.data.name}
      </components.SingleValue>
    );
  };
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const json = results.data;
          setExcelFile(file);
          const correctedJson = json
            .map((item) => {
              const filteredItem = Object.fromEntries(
                Object.entries(item).filter(([key, value]) => key !== "")
              );

              // Only include the item if it's not empty
              return Object.keys(filteredItem).length > 0 ? filteredItem : null;
            })
            .filter((item) => item !== null); // Remove nulls from the resulting array

          const Row = correctedJson.length;
          const Column = Object.keys(json[1]).filter(
            (item) => item !== ""
          ).length;
          setNumberOfLines(Row);
          setNumberOfFrontSideColumn(Column);
          setExcelJsonFile(correctedJson);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
        },
      });
    }
  };

  const handleBackExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const json = results.data;
          setExcelFile(file);
          const correctedJson = json
            .map((item) => {
              const filteredItem = Object.fromEntries(
                Object.entries(item).filter(([key, value]) => key !== "")
              );

              // Only include the item if it's not empty
              return Object.keys(filteredItem).length > 0 ? filteredItem : null;
            })
            .filter((item) => item !== null); // Remove nulls from the resulting array

          const Row = correctedJson.length;
          const Column = Object.keys(json[1]).filter(
            (item) => item !== ""
          ).length;
          setNumberBackSideRow(Row);
          setNumberOfBackSideColumn(Column);
          setBackExcelJsonFile(correctedJson);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
        },
      });
    }
  };

  const getShadeFromValue = (value) => {
    // Example function to map slider value to a shade
    const shades = Array.from({ length: 16 }, (_, i) => {
      const greyValue = Math.floor(255 - i * (255 / 16));
      return `rgb(${greyValue}, ${greyValue}, ${greyValue})`;
    });
    const index = Math.floor((value[0] / 16) * shades.length);
    return shades[index] || shades[0];
  };
  const validatePrintField = () => {
    const errors = {
      startPosition: "Printing start position cannot be empty",
      fontSpace: "Font space cannot be empty",
      printDigit: "Printing digit cannot be empty",
      printStartNumber: "Printing start number cannot be empty",
      printOrientation: "Please select print orientation",
      printMode: "Please select printing mode",
    };

    for (let [field, errorMsg] of Object.entries(errors)) {
      if (!eval(field)) {
        toast.error(errorMsg);
        return false;
      }
    }
    return true;
  };

  const debouncedClick = debounce(
    () => {
      createTemplateHandler();
    },
    2000,
    { leading: true, trailing: false }
  );

  const createTemplateHandler = async () => {
    if (printEnable.id !== "0") {
      if (!validatePrintField()) {
        return;
      }
    }
    if (
      !name ||
      !numberOfLines ||
      !numberOfFrontSideColumn ||
      !selectedBubble ||
      !idPresent ||
      !reject ||
      barCount.length === 0 ||
      difference.length == 0 ||
      !direction ||
      !selectedBubble ||
      !face
    ) {
      settoggle((prevData) => ({
        ...prevData,
        name: !name ? true : prevData.name,
        row: !numberOfLines ? true : prevData.row,
        col: !numberOfFrontSideColumn ? true : prevData.col,
        barcode: !barCount ? true : prevData.barcode,
        ID: !idPresent ? true : prevData.idPresent,
        numberOfLines: !numberOfLines ? true : prevData.numberOfLines,
        barcodeEnable: !barcodeEnable ? true : prevData.barcodeEnable,
        bubbleVariant:
          !selectedBubble || Object.values(selectedBubble).length === 0
            ? true
            : false,
        Rejected: !reject ? true : prevData.Rejected,
        difference: difference.length == 0 ? true : prevData.difference,
        face: !face || Object.values(face).length === 0 ? true : false,
        direction: !direction ? true : prevData.direction,
        windowNgOption:
          Object.values(windowNgOption).length == 0
            ? true
            : prevData.windowNgOption,
      }));
      if (!name) {
        toast.error("Name Field can not be empty");
        return;
      }

      if (!idPresent) {
        toast.error("Please Select ID Field ");
        return;
      }

      if (idPresent && idPresent.id === "present") {
        if (Object.values(face).length === 0) {
          toast.error("Please Select ID Mark ");
          return;
        }
      }
      if (!face) {
        toast.error("Please Select Id Mark");
        return;
      }
      if (!selectedBubble || Object.values(selectedBubble).length === 0) {
        toast.error("Please Select Bubble Variant");
        return;
      }

      if (Object.values(windowNgOption).length == 0) {
        toast.error("Please Select WindowNg");
        return;
      }
      if (!reject) {
        toast.error("Please Select a Value in Rejected Field");
        return;
      }
      if (barCount.length === 0) {
        toast.error("Barcode Field can not be empty");
        return;
      }
      if (difference.length === 0) {
        toast.error("Difference can not be empty");
        return;
      }
      if (!direction) {
        toast.error("Please Select Page Position");
        return;
      }

      if (!excelJsonFile) {
        toast.error("Please Select Excel File");
        return;
      }
      if (!numberOfLines) {
        toast.error("Row can not be empty");
        return;
      }
      if (!numberOfFrontSideColumn) {
        toast.error("Columns can not be empty");
        return;
      }
      return;
    }
    const key = uuidv4();
    try {
      const emptyExcelJsonFile = excelJsonFile.map((row) => {
        return Object.keys(row).reduce((acc, key) => {
          acc[key] = ""; // Set each value to an empty string
          return acc;
        }, {});
      });
      const emptyBackExcelJsonFile = backExcelJsonFile.map((row) => {
        return Object.keys(row).reduce((acc, key) => {
          acc[key] = ""; // Set each value to an empty string
          return acc;
        }, {});
      });
      const templateData = [
        {
          layoutParameters: {
            key: key,
            layoutName: name,
            timingMarks: +numberOfLines,
            barcodeCount: +barCount,
            iFace: +face.id,
            totalColumns: +numberOfFrontSideColumn,
            bubbleType: selectedBubble?.name,
            templateImagePath: imageSrc,
            templateBackImagePath: backImageSrc,
            iSensitivity: +sensitivity,
            iDifference: +difference,
            ngAction: windowNgOption?.id,
            dataReadDirection: direction?.id,
            idStatus: idPresent.id,
            iReject: 0,
            isBooklet: false,
            templateType: props.title,
            idMarksPattern: "000000000000000000000000",
            excelJsonFile: excelJsonFile,
            backExcelJsonFile: backExcelJsonFile,
            images: images,
            numberedExcelJsonFile: emptyExcelJsonFile,
            numberedBackExcelJsonFile: emptyBackExcelJsonFile,
          },
          barcodeData: {
            barcodeSide: 0,
            barcodeColor: 0,
            barcodeType: barcodeType?.id ? barcodeType?.id : "",
            barcodeCheckDigit: checkDigit !== null ? +checkDigit?.id : 0,
            barcodeOption: option !== null ? +option?.id : 0,
            barcodeRightPos: barcodeRightPos ? +barcodeRightPos : 0,
            barcodeLeftPos: barcodeLeftPos ? +barcodeLeftPos : 0,
            barcodeTopPos: barcodeTopPos ? +barcodeTopPos : 0,
            barcodeBottomPos: barcodeBottomPos ? +barcodeBottomPos : 0,
            readFrom:
              barcodeCategory?.id === undefined ? "" : barcodeCategory?.id,
          },
          imageData: {
            imageEnable: imageStatus ? +imageStatus?.id : 0,
            imageColor: colorType === "grayscale" ? 1 : 0,
            imageType: encoding ? +encoding?.id : 0,
            imageParam: 0,
            imageRotation: rotation ? +rotation?.id : 0,
            imageResoMode: 1,
            imageResolution: resolution ? +resolution?.id : 1,
            imageScanningSide: scannningSide ? +scannningSide?.id : 0,
            imageCompression: imageParams ? +imageParams?.id : 0,
          },
          printingData: {
            printEnable: +printEnable?.id ?? 0,
            printStartPos: +Math.floor(startPosition) ?? 0,
            printDigit: printDigit?.id ?? 0,
            printStartNumber: +printStartNumber ?? 0,
            printOrientation:
              printOrientation?.id === undefined ? 0 : +printOrientation?.id,
            printFontSize: 0,
            printFontSpace: +Math.floor(fontSpace) ?? 0,
            printMode: printMode?.id === undefined ? 0 : +printMode?.id,
            customType: printCustom?.id === undefined ? "" : printCustom?.id,
            customValue: printCustomValue ? printCustomValue : "",
          },
        },
      ];
      sessionStorage.setItem("Template", JSON.stringify(templateData));

      const index = dataCtx.setAllTemplates(templateData);

      setModalShow(false);
      navigate("/duplex-design-template");
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  };
  const scannerHandler = async () => {
    setScannerLoading(true);
    setShowScanner(false);

    if (!scanner?.id) {
      alert("Please select a scanner");
      setScannerLoading(false); // ✅ Reset loading state if early return
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:5000/GetSampleData?id=${
          scanner?.id
        }&type=duplex` // Use the selected scanner's id
      );
      const { data, backData, images } = response.data;
      const jsonData = data;
      const correctedJson = jsonData
        .map((item) => {
          const filteredItem = Object.fromEntries(
            Object.entries(item).filter(([key, value]) => key !== "")
          );

          // Only include the item if it's not empty
          return Object.keys(filteredItem).length > 0 ? filteredItem : null;
        })
        .filter((item) => item !== null); // Remove nulls from the resulting array
      const Row = correctedJson.length;
      const Column = Object.keys(correctedJson[1]).filter(
        (item) => item !== ""
      ).length;

      setNumberOfLines(Row); //setting number of rows in excel
      setNumberOfFrontSideColumn(Column); //setting number of columns in excel
      setExcelJsonFile(correctedJson);
      setImages(images);

      const correctedJson2 = backData
        .map((item) => {
          const filteredItem = Object.fromEntries(
            Object.entries(item).filter(([key, value]) => key !== "")
          );

          // Only include the item if it's not empty
          return Object.keys(filteredItem).length > 0 ? filteredItem : null;
        })
        .filter((item) => item !== null); // Remove nulls from the resulting array
      const Row1 = correctedJson2.length;
      const Column1 = Object.keys(correctedJson2[1]).filter(
        (item) => item !== ""
      ).length;
      setBackExcelJsonFile(correctedJson2);
    } catch (error) {
      console.log(error);
      // toast.error(error.message);
    } finally {
      setScannerLoading(false);
    }
  };
  const scanner2Handler = async () => {
    setScannerLoading(true);
    setShowScanner(false);
    try {
      const response = await axios.post(
        "http://localhost:5000/GetSampleData/2"
      );
      const { data, images } = response.data;
      const jsonData = data;
      const correctedJson = jsonData
        .map((item) => {
          const filteredItem = Object.fromEntries(
            Object.entries(item).filter(([key, value]) => key !== "")
          );

          // Only include the item if it's not empty
          return Object.keys(filteredItem).length > 0 ? filteredItem : null;
        })
        .filter((item) => item !== null); // Remove nulls from the resulting array
      const Row = correctedJson.length;
      const Column = Object.keys(correctedJson[1]).filter(
        (item) => item !== ""
      ).length;

      setNumberOfLines(Row); //setting number of rows in excel
      setNumberOfFrontSideColumn(Column); //setting number of columns in excel
      setExcelJsonFile(correctedJson);
      setImages(images);
    } catch (error) {
      console.log(error);
      // toast.error(error.message);
    } finally {
      setScannerLoading(false);
    }
  };
  const systemHandler = () => {
    // document.getElementById("formFile").click();
    setFileModal(true);
  };
  const saveHandler = () => {
    if (!excelJsonFile) {
      alert("Please select excel file");
    } else {
      setImageModal(false);
    }
  };
  const saveFileHandler = () => {
    if (!excelJsonFile) {
      alert("Please select excel file");
      return;
    }
    setFileModal(false);
    setImages([
      {
        frontImagePath: "1_Front.jpg",
        backImagePath: "2_Back.jpg",
      },
      {
        frontImagePath: "3_Front.jpg",
        backImagePath: "4_Back.jpg",
      },
      {
        frontImagePath: "5_Front.jpg",
        backImagePath: "6_Back.jpg",
      },
      {
        frontImagePath: "7_Front.jpg",
        backImagePath: "8_Back.jpg",
      },
    ]);
  };

  return (
    <>
      <Modal
        show={modalShow}
        onHide={props.onHide}
        size="lg"
        aria-labelledby="modal-custom-navbar"
        centered
        dialogClassName="modal-90w"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body style={{ height: "80dvh", overflow: "auto" }}>
          {selectedUI === "" && (
            <div className="d-flex" style={{ justifyContent: "space-evenly" }}>
              <Jobcard text="SIMPLEX" handleJob={jobHandler} />
              <Jobcard text={"DUPLEX"} handleJob={jobHandler} />
            </div>
          )}

          {(selectedUI === "SIMPLEX" ||
            (activeTab === "simplex" && selectedUI !== "")) && (
            <Tab.Container
              activeKey={activeKey}
              onSelect={(k) => setActiveKey(k)}
            >
              <Row>
                <Col sm={2}>
                  <h2>{props.title}</h2>
                </Col>
                <Col sm={8}>
                  {/* Adjusted column span to full width if needed */}
                  <Nav
                    variant="pills"
                    className="flex-row justify-content-center"
                  >
                    <Nav.Item>
                      <Nav.Link eventKey="general">General</Nav.Link>
                    </Nav.Item>
                    {barcodeEnable.id === "enable" && (
                      <Nav.Item>
                        <Nav.Link eventKey="barcode">Barcode</Nav.Link>
                      </Nav.Item>
                    )}
                    {imageStatus.id !== "0" && (
                      <Nav.Item>
                        <Nav.Link eventKey="image">Image</Nav.Link>
                      </Nav.Item>
                    )}
                    {printEnable.id !== "0" && (
                      <Nav.Item>
                        <Nav.Link eventKey="print">Printing</Nav.Link>
                      </Nav.Item>
                    )}
                  </Nav>
                </Col>
                <Col sm={12} className="mt-3">
                  <Tab.Content>
                    <Tab.Pane eventKey="general">
                      <Row className="mb-3">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                          style={{ fontSize: ".9rem" }}
                        >
                          Name
                        </label>
                        <div className="col-md-10">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Template Name"
                            value={name}
                            onChange={(e) => {
                              const value = e.target.value;
                              const regex = /^[a-zA-Z0-9-]*$/;

                              if (regex.test(value)) {
                                settoggle((item) => ({ ...item, name: false }));
                                setName(value);
                              } else {
                                alert(
                                  "Please enter only numbers and alphabets"
                                );
                              }
                            }}
                            style={{
                              border: toggle.name ? "1px solid red" : "",
                            }}
                          />
                          {/* <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter Template Name"
                                                    value={name}
                                                    onChange={(e) => {
                                                        settoggle((item) => ({ ...item, name: false }));
                                                        setName(e.target.value)
                                                    }}
                                                    style={{ border: toggle.name ? "1px solid red" : "" }}
                                                /> */}
                          {!name && (
                            <span
                              style={{ color: "red", display: spanDisplay }}
                            >
                              This feild is required
                            </span>
                          )}
                        </div>
                      </Row>
                      <Row className="mb-3">
                        <label
                          htmlFor="bubble-variant-input"
                          className="col-md-2  col-form-label"
                          style={{ fontSize: ".87rem" }}
                        >
                          Bubble
                        </label>
                        <div className="col-md-4">
                          <Select
                            value={selectedBubble}
                            placeholder="Select Bubble"
                            onChange={(selectedValue) => {
                              setSelectedBubble(selectedValue);
                              settoggle((item) => ({
                                ...item,
                                bubbleVariant: false,
                              }));
                            }}
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                border: toggle.bubbleVariant
                                  ? "1px solid red !important"
                                  : provided.border,
                              }),
                            }}
                            options={bubbleData}
                            getOptionLabel={(option) => option?.name || ""}
                            getOptionValue={(option) =>
                              option?.id?.toString() || ""
                            }
                            components={{ Option, SingleValue }}
                          />
                          {!selectedBubble && (
                            <span
                              style={{ color: "red", display: spanDisplay }}
                            >
                              This feild is required
                            </span>
                          )}
                        </div>
                        <label
                          htmlFor="bubble-variant-input"
                          className="col-md-2  col-form-label"
                          style={{ fontSize: ".87rem" }}
                        >
                          Scanner
                        </label>
                        <div className="col-md-4">
                          <Select
                            value={scanner}
                            placeholder="Select Scanner"
                            onChange={(selectedValue) => {
                              setScanner(selectedValue);
                            }}
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                border: toggle.bubbleVariant
                                  ? "1px solid red !important"
                                  : provided.border,
                              }),
                            }}
                            options={scannerData}
                            getOptionLabel={(option) => option?.name || ""}
                            getOptionValue={(option) =>
                              option?.id?.toString() || ""
                            }
                            components={{ Option, SingleValue }}
                          />
                          {!selectedBubble && (
                            <span
                              style={{ color: "red", display: spanDisplay }}
                            >
                              This feild is required
                            </span>
                          )}
                        </div>
                      </Row>

                      <Row className="mb-3">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label "
                          style={{ fontSize: ".85rem" }}
                        >
                          ID
                        </label>
                        <div
                          className={
                            idPresent?.id === "not present"
                              ? "col-md-10"
                              : "col-md-4"
                          }
                        >
                          <Select
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                border: toggle.ID
                                  ? "1px solid red !important"
                                  : provided.border,
                              }),
                            }}
                            value={idPresent}
                            onChange={(selectedValue) => {
                              settoggle((item) => ({ ...item, ID: false }));
                              setIdPresent(selectedValue);

                              if (selectedValue.id === "not present") {
                                setWindowNgOption({
                                  id: "0x00000001",
                                  name: "SKDV_ACTION_SELECT(0x00000001)",
                                  showName: "Paper ejection to select stacker",
                                });
                                setReject({
                                  id: 1,
                                  name: "0",
                                  showName: "False",
                                });
                                setFace({ id: 0, name: "Front Side" });
                              } else {
                                setWindowNgOption({});
                                setReject({});
                                setFace({});
                              }
                            }}
                            options={IdOptionData}
                            getOptionLabel={(option) => option?.name || ""}
                            placeholder="Select ID"
                            getOptionValue={(option) =>
                              option?.id?.toString() || ""
                            }
                          />
                        </div>

                        {idPresent?.id !== "not present" && (
                          <>
                            <label
                              htmlFor="example-text-input"
                              className="col-md-2 col-form-label "
                              style={{ fontSize: ".85rem" }}
                            >
                              Id Mark
                            </label>
                            <div className="col-md-4">
                              <Select
                                styles={{
                                  control: (provided, state) => ({
                                    ...provided,
                                    border: toggle.face
                                      ? "1px solid red !important"
                                      : provided.border,
                                  }),
                                }}
                                value={face}
                                onChange={(selectedValue) => {
                                  setFace(selectedValue);
                                  settoggle((item) => ({
                                    ...item,
                                    numberOfLines: false,
                                  }));
                                }}
                                options={faceData}
                                getOptionLabel={(option) => option?.name || ""}
                                getOptionValue={(option) =>
                                  option?.id?.toString() || ""
                                }
                              />

                              {!numberOfLines && (
                                <span
                                  style={{ color: "red", display: spanDisplay }}
                                >
                                  This feild is required
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </Row>

                      <Row className="mb-3">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label "
                          style={{ fontSize: ".85rem" }}
                        >
                          Barcode
                        </label>
                        <div className="col-md-4">
                          <Select
                            value={barcodeEnable}
                            onChange={(selectedValue) => {
                              const barcodeInput =
                                document.getElementById("barcodeCount");
                              setBarcodeEnable(selectedValue);
                              if (selectedValue.id === "disable") {
                                // barcodeInput.style=
                                setBarCount(0);
                              } else {
                                setBarCount("");
                              }
                            }}
                            options={barcodeOptionData}
                            getOptionLabel={(option) => option?.name || ""}
                            getOptionValue={(option) =>
                              option?.id?.toString() || ""
                            }
                          />
                        </div>

                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label "
                          style={{ fontSize: ".85rem" }}
                        >
                          Barcode Count
                        </label>
                        <div className="col-md-4">
                          <input
                            disabled={barCount === 0 ? true : false}
                            value={barCount}
                            placeholder="Enter barcode count"
                            type="number"
                            id="barcodeCount"
                            className="form-control"
                            onChange={(e) => {
                              // settoggle((item) => ({ ...item, barcode: false }));
                              setBarCount(e.target.value);
                            }}
                            style={{
                              border:
                                barCount == 0 && barcodeEnable.id == "enable"
                                  ? "1px solid red"
                                  : "",
                            }}
                          />
                          {!selectedBubble && (
                            <span
                              style={{ color: "red", display: spanDisplay }}
                            >
                              This feild is required
                            </span>
                          )}
                        </div>
                      </Row>
                      <Row className="mb-3">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label  "
                          style={{ fontSize: ".95rem" }}
                        >
                          Image
                        </label>
                        <div className="col-md-4">
                          <Select
                            value={imageStatus}
                            onChange={(selectedValue) =>
                              setImageStatus(selectedValue)
                            }
                            options={imageStatusData}
                            getOptionLabel={(option) => option?.name || ""}
                            getOptionValue={(option) =>
                              option?.id?.toString() || ""
                            }
                            defaultInputValue=""
                          />
                        </div>
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label "
                          style={{ fontSize: ".95rem" }}
                        >
                          Printing
                        </label>
                        <div className="col-md-4">
                          <Select
                            value={printEnable}
                            onChange={(selectedValue) => {
                              setPrintEnable(selectedValue);
                            }}
                            options={printOptionData}
                            getOptionLabel={(option) => option?.name || ""}
                            getOptionValue={(option) =>
                              option?.id?.toString() || ""
                            }
                          />
                        </div>
                      </Row>

                      {idPresent?.id !== "not present" && (
                        <Row className="mb-2">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                            style={{ fontSize: ".9rem" }}
                          >
                            Exception
                          </label>
                          <div className="col-md-10">
                            <Select
                              value={windowNgOption}
                              onChange={(selectedValue) => {
                                setWindowNgOption(selectedValue);
                                settoggle((item) => ({
                                  ...item,
                                  windowNgOption: false,
                                }));
                              }}
                              styles={{
                                control: (provided, state) => ({
                                  ...provided,
                                  border: toggle.windowNgOption
                                    ? "1px solid red !important"
                                    : provided.border,
                                }),
                              }}
                              options={windowNgData}
                              getOptionLabel={(option) =>
                                option?.showName || ""
                              }
                              getOptionValue={(option) =>
                                option?.id?.toString() || ""
                              }
                            />
                            {!size && (
                              <span
                                style={{ color: "red", display: spanDisplay }}
                              >
                                This feild is required
                              </span>
                            )}
                          </div>
                          {/* <label
                            htmlFor="bubble-variant-input"
                            className="col-md-2 col-form-label  "
                            style={{ fontSize: ".9rem", textAlign: "right" }}
                          >
                            Rejected
                          </label>
                          <div className="col-md-3">
                            <Select
                              value={reject}
                              onChange={(selectedValue) => {
                                setReject(selectedValue);
                                settoggle((item) => ({
                                  ...item,
                                  Rejected: false,
                                }));
                              }}
                              styles={{
                                control: (provided, state) => ({
                                  ...provided,
                                  border: toggle.Rejected
                                    ? "1px solid red !important"
                                    : provided.border,
                                }),
                              }}
                              options={rejectData}
                              getOptionLabel={(option) =>
                                option?.showName || ""
                              }
                              getOptionValue={(option) =>
                                option?.id?.toString() || ""
                              }
                            />
                            {!selectedBubble && (
                              <span
                                style={{ color: "red", display: spanDisplay }}
                              >
                                This feild is required
                              </span>
                            )}
                          </div> */}
                        </Row>
                      )}

                      {/* <Row className="mb-3">
                                        <label
                                            htmlFor="example-text-input"
                                            className="col-md-2 col-form-label "
                                            style={{ fontSize: ".85rem" }}
                                        >
                                            Barcode Count:
                                        </label>
                                        <div className="col-md-10">
                                            <input placeholder="Enter barcode count" type="number" className="form-control" onChange={(e) => {
                                                settoggle((item) => ({ ...item, barcode: false }));
                                                setBarCount(e.target.value)
                                            }}
                                                style={{ border: toggle.barcode ? "1px solid red" : "" }}
                                            />
                                            {!selectedBubble && (
                                                <span style={{ color: "red", display: spanDisplay }}>
                                                    This feild is required
                                                </span>
                                            )}
                                        </div>
                                    </Row> */}

                      <Row className="mb-3">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label  "
                          style={{ fontSize: ".9rem" }}
                        >
                          Sensitivity
                        </label>
                        <div
                          className="col-md-10"
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
                                value={17 - value}
                                onChange={(event, newValue) => {
                                  const val = 17 - newValue;
                                  handleChange(val);
                                }}
                                valueLabelDisplay="auto"
                                min={1}
                                max={16}
                                step={1}
                                scale={(x) => 17 - x} // This reverses the displayed value
                                size="large"
                                color="PRIMARY"
                                // track="inverted" // Optional: shows the fill from right to left
                                slots={{
                                  ValueLabel: (props) => (
                                    <CustomTooltip
                                      {...props}
                                      shade={getShadeFromValue(value)}
                                    />
                                  ),
                                }}
                              />
                            </Box>
                          </div>

                          <input
                            value={`${sensitivity}`}
                            onChange={(e) => setSensitivity(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "2px",
                              textAlign: "center",
                            }}
                            className="form-control"
                            type="text"
                            disabled
                          />

                          {!sensitivity && (
                            <span
                              style={{ color: "red", display: spanDisplay }}
                            >
                              This feild is required
                            </span>
                          )}
                        </div>
                      </Row>
                      <Row className="mb-3">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label  "
                          style={{ fontSize: ".9rem" }}
                        >
                          Density
                        </label>
                        <div
                          className="col-md-10"
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
                              {/* <Slider
                                getAriaLabel={() => "Sensitivity range"}
                                value={value}
                                onChange={handleChange}
                                valueLabelDisplay="auto"
                                min={0} // Ensure minimum value is 0
                                max={16}
                                disableSwap
                                size="large"
                                color="PRIMARY"
                                slots={{
                                  ValueLabel: (props) => (
                                    <CustomTooltip
                                      {...props}
                                      shade={getShadeFromValue(value)} // Pass the shade based on the value
                                    />
                                  ),
                                }}
                              /> */}
                              <Slider
                                getAriaLabel={() => "Sensitivity range"}
                                value={difference} // should be a single number
                                onChange={(event, newValue) =>
                                  setDifference(newValue)
                                } // handle as a number
                                valueLabelDisplay="auto"
                                min={1}
                                max={16}
                                size="large"
                                color="PRIMARY"
                                slots={{
                                  ValueLabel: (props) => (
                                    <CustomTooltip
                                      {...props}
                                      shade={getShadeFromValue(value)} // Pass the shade based on the value
                                    />
                                  ),
                                }}
                              />
                            </Box>
                          </div>

                          <input
                            value={`${difference}`}
                            style={{
                              width: "100%",
                              padding: "2px",
                              textAlign: "center",
                            }}
                            className="form-control"
                            type="text"
                            disabled
                          />

                          {!sensitivity && (
                            <span
                              style={{ color: "red", display: spanDisplay }}
                            >
                              This feild is required
                            </span>
                          )}
                        </div>
                      </Row>

                      <Row className="mb-3">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label  "
                          style={{ fontSize: ".9rem" }}
                        >
                          Page Position
                        </label>
                        <div className="col-md-10">
                          <Select
                            value={direction}
                            placeholder="Select position of sheet"
                            onChange={(selectedValue) => {
                              settoggle((item) => ({
                                ...item,
                                direction: false,
                              }));
                              setDirection(selectedValue);
                            }}
                            options={directionData}
                            getOptionLabel={(option) => option?.name || ""}
                            getOptionValue={(option) =>
                              option?.id?.toString() || ""
                            }
                            styles={{
                              control: (provided, state) => ({
                                ...provided,
                                border: toggle.direction
                                  ? "1px solid red !important"
                                  : provided.border,
                              }),
                            }}
                          />
                        </div>
                      </Row>

                      {/* <div>
                                        <DropDownListComponent
                                            dataSource={columns}
                                            placeholder="Select a column"
                                            change={handleColumnChange}
                                        />

                                    </div> */}

                      {/* <Row className="mb-3">
                      <Col sm={6}>
                        <Row>
                          <label
                            htmlFor="example-text-input"
                            className="col-md-6 "
                            style={{ fontSize: ".9rem" }}
                          >
                            Number of front side of column:
                          </label>
                          <div className="col-md-6">
                            <input
                              type="number"
                              className="form-control"
                              value={numberOfFrontSideColumn}
                              onChange={(e) =>
                                setNumberOfFrontSideColumn(e.target.value)
                              }
                            />
                            {!numberOfFrontSideColumn && (
                              <span
                                style={{ color: "red", display: spanDisplay }}
                              >
                                This feild is required
                              </span>
                            )}
                          </div>
                        </Row>
                      </Col>
                      <Col sm={6}>
                        <Row>
                          <label
                            htmlFor="example-text-input"
                            className="col-md-6 "
                            style={{ fontSize: ".9rem" }}
                          >
                            Number of back side column:
                          </label>
                          <div className="col-md-6">
                            <input
                              type="number"
                              className="form-control"
                              value={numberOfBackSideColumn}
                              onChange={(e) =>
                                setNumberOfBackSideColumn(e.target.value)
                              }
                            />
                            {!numberOfBackSideColumn && (
                              <span
                                style={{ color: "red", display: spanDisplay }}
                              >
                                This feild is required
                              </span>
                            )}
                          </div>
                        </Row>
                      </Col>
                    </Row> */}

                      {/* <Row className="mb-3">
                      <label
                        htmlFor="example-text-input"
                        className="col-md-3 "
                        style={{ fontSize: ".9rem" }}
                      >
                        Type of column display:
                      </label>
                      <div className="col-md-9">
                        <Select
                          value={typeOfColumnDisplay}
                          onChange={(selectedValue) =>
                            setTypeOfColumnDisplay(selectedValue)
                          }
                          options={typeOfColumnDisplayData}
                          getOptionLabel={(option) => option?.name || ""}
                          getOptionValue={(option) =>
                            option?.id?.toString() || ""
                          }
                        />
                        {!typeOfColumnDisplay && (
                          <span style={{ color: "red", display: spanDisplay }}>
                            This feild is required
                          </span>
                        )}
                      </div>
                    </Row> */}
                    </Tab.Pane>

                    <Tab.Pane eventKey="print">
                      <Row className="mb-3">
                        <label
                          htmlFor="start-position"
                          className="col-md-2 col-form-label"
                          style={{ fontSize: ".9rem" }}
                        >
                          Start Position:
                        </label>

                        <div className="col-md-10 d-flex align-items-center gap-3">
                          {/* Slider */}
                          <input
                            type="range"
                            id="start-position"
                            min="0"
                            max="355"
                            step="1"
                            value={startPosition}
                            className="form-range flex-grow-1"
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setStartPosition(value);
                            }}
                          />

                          {/* Display input with 'mm' unit using input group */}
                          <div
                            className="input-group"
                            style={{ maxWidth: "160px" }}
                          >
                            <input
                              type="text"
                              className="form-control text-end"
                              value={startPosition}
                              disabled
                            />
                            <div className="input-group-append">
                              <span className="input-group-text">mm</span>
                            </div>
                          </div>
                        </div>
                      </Row>

                      <Row className="mb-3">
                        <label
                          htmlFor="font-space"
                          className="col-md-2 col-form-label"
                          style={{ fontSize: ".9rem" }}
                        >
                          Font Space:
                        </label>

                        <div className="col-md-10 d-flex align-items-center gap-3">
                          {/* Range Slider */}
                          <input
                            type="range"
                            id="font-space"
                            min="0.8"
                            max="92"
                            step="0.1"
                            value={fontSpace}
                            className="form-range flex-grow-1"
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setFontSpace(parseFloat(value.toFixed(1)));
                            }}
                          />

                          {/* Read-only value with mm label */}
                          <div
                            className="input-group"
                            style={{ maxWidth: "160px" }}
                          >
                            <input
                              type="text"
                              className="form-control text-end"
                              value={
                                fontSpace !== "" ? fontSpace.toFixed(1) : ""
                              }
                              disabled
                            />
                            <span className="input-group-text">mm</span>
                          </div>
                        </div>
                      </Row>
                      <div
                        style={{
                          border: "1px solid #ccc",
                          margin: "0",
                          padding: "10px",
                          borderRadius: "5px",
                          marginBottom: "10px",
                        }}
                      >
                        <small className="text-red">
                          Select options for serial numbers
                        </small>
                        <Row className="mb-3">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label "
                            style={{ fontSize: ".9rem" }}
                          >
                            Digit :
                          </label>
                          <div className="col-md-10">
                            <Select
                              placeholder="Select The Digits Of Sequence Number"
                              options={digitType}
                              getOptionLabel={(option) => option?.name || ""}
                              getOptionValue={(option) =>
                                option?.id?.toString() || ""
                              }
                              value={printDigit}
                              onChange={(selectedValue) => {
                                setPrintDigit(selectedValue);
                                const id = selectedValue.id;
                                const zeroes = "0".repeat(parseInt(id));
                                setPrefixZeroes(zeroes);
                                setPrefix(zeroes);
                              }}
                            />
                          </div>
                        </Row>
                        <Row className="mb-3">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label "
                            style={{ fontSize: ".85rem" }}
                          >
                            Start Number :
                          </label>
                          <div className="col-md-10 d-flex flex-row align-items-center gap-3 w-[20%]">
                            <input
                              type="number"
                              value={prefix}
                              className="form-control"
                              style={{ width: "20%" }}
                              disabled
                            />
                            <input
                              type="number"
                              style={{ width: "80%" }}
                              value={printStartNumber}
                              className="form-control  w-[80%]"
                              placeholder="Enter The Start Number For Print Sequence Number"
                              onChange={(e) => {
                                const startNumber = e.target.value;

                                if (startNumber.length <= prefixzeroes.length) {
                                  const num = parseInt(startNumber);

                                  if (!isNaN(num)) {
                                    // Format number with leading zeroes
                                    const zeroedNum =
                                      prefixzeroes.substring(
                                        0,
                                        prefixzeroes.length - startNumber.length
                                      ) + startNumber;
                                    setPrefix(zeroedNum);
                                  } else {
                                    // Empty input → show full prefixzeroes
                                    setPrefix(prefixzeroes);
                                  }

                                  setPrintStartNumber(startNumber);
                                }
                              }}
                            />
                          </div>
                        </Row>
                      </div>
                      <Row className="mb-3">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 "
                          style={{ fontSize: ".9rem" }}
                        >
                          Printing Orientation :
                        </label>
                        <div className="col-md-10">
                          <Select
                            value={printOrientation}
                            onChange={(selectedValue) =>
                              setPrintOrientation(selectedValue)
                            }
                            options={printOrientationOption}
                            getOptionLabel={(option) => option?.name || ""}
                            getOptionValue={(option) =>
                              option?.id?.toString() || ""
                            }
                            placeholder="Select printing orientation"
                          />
                        </div>
                      </Row>
                      <Row className="mb-3">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                          style={{ fontSize: ".85rem" }}
                        >
                          Printing Mode :
                        </label>
                        <div className="col-md-10">
                          <Select
                            value={printMode}
                            onChange={(selectedValue) =>
                              setPrintMode(selectedValue)
                            }
                            placeholder="Select printing mode"
                            options={printModeOption}
                            getOptionLabel={(option) => option?.name || ""}
                            getOptionValue={(option) =>
                              option?.id?.toString() || ""
                            }
                          />
                        </div>
                      </Row>

                      <Row className="mb-2">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                          style={{ fontSize: ".9rem" }}
                        >
                          Custom :
                        </label>
                        <div className="col-md-10">
                          <Select
                            value={printCustom}
                            onChange={(selectedValue) =>
                              setPrintCustom(selectedValue)
                            }
                            options={printCustomOption}
                            getOptionLabel={(option) => option?.name || ""}
                            getOptionValue={(option) =>
                              option?.id?.toString() || ""
                            }
                            menuPlacement="top"
                          />
                        </div>
                      </Row>
                      {printCustom.id === "custom" && (
                        <Row className="mb-2">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                            style={{ fontSize: ".8rem" }}
                          >
                            Custom Value :
                          </label>
                          <div className="col-md-10">
                            <input
                              type="text"
                              value={printCustomValue}
                              className="form-control"
                              placeholder="Enter The Custom Value To Be Printed"
                              onChange={(e) => {
                                setPrintCustomValue(e.target.value);
                              }}
                            />
                          </div>
                        </Row>
                      )}
                    </Tab.Pane>

                    <Tab.Pane eventKey="barcode">
                      <Row className="mb-3">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 "
                          style={{ fontSize: ".9rem" }}
                        >
                          Barcode Category :
                        </label>
                        <div className="col-md-10">
                          <Select
                            value={barcodeCategory}
                            onChange={(selectedValue) =>
                              setBarcodeCategory(selectedValue)
                            }
                            options={barcodeCategoryData}
                            getOptionLabel={(option) => option?.name || ""}
                            getOptionValue={(option) =>
                              option?.id?.toString() || ""
                            }
                          />
                          {!size && (
                            <span style={{ color: "red", display: "block" }}>
                              This feild is required
                            </span>
                          )}
                        </div>
                      </Row>
                      {barcodeCategory.id === "hardware" && (
                        <Row className="mb-3">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 "
                            style={{ fontSize: ".9rem" }}
                          >
                            Barcode Rejection :
                          </label>
                          <div className="col-md-10">
                            <Select
                              value={barcodeRejectStatus}
                              onChange={(selectedValue) =>
                                setBarcodeRejectStatus(selectedValue)
                              }
                              options={barcodeRejectData}
                              getOptionLabel={(option) => option?.name || ""}
                              getOptionValue={(option) =>
                                option?.id?.toString() || ""
                              }
                            />
                            {!size && (
                              <span style={{ color: "red", display: "block" }}>
                                This feild is required
                              </span>
                            )}
                          </div>
                        </Row>
                      )}

                      <>
                        <Row className="mb-3">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                            style={{ fontSize: ".9rem" }}
                          >
                            Barcode Type :
                          </label>
                          <div className="col-md-10">
                            <Select
                              value={barcodeType}
                              onChange={(selectedValue) =>
                                setBarcodeType(selectedValue)
                              }
                              options={barcodeTypeData}
                              getOptionLabel={(option) => option?.name || ""}
                              getOptionValue={(option) =>
                                option?.id?.toString() || ""
                              }
                            />
                            {!size && (
                              <span style={{ color: "red", display: "block" }}>
                                This feild is required
                              </span>
                            )}
                          </div>
                        </Row>

                        {(barcodeType.id === "0x1U" ||
                          barcodeType.id === "0x2U") && (
                          <Row className="mb-3">
                            <label
                              htmlFor="example-text-input"
                              className="col-md-2 "
                              style={{ fontSize: ".9rem" }}
                            >
                              Set check digit:
                            </label>

                            <div className="col-md-10">
                              <Select
                                value={checkDigit}
                                onChange={(selectedValue) =>
                                  setCheckDigit(selectedValue)
                                }
                                options={
                                  barcodeType.id === "0x1U"
                                    ? code39OrItfCheckDigitData
                                    : nw7CheckDigitData
                                }
                                getOptionLabel={(option) => option?.name || ""}
                                getOptionValue={(option) =>
                                  option?.id?.toString() || ""
                                }
                                placeholder="Select check digit"
                              />
                              {/* {(!(barcodeType.id === "0x1U" || barcodeType.id === "0x2U") || Object.keys(barcodeType).length === 0) && (
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={(barcodeType.id === "0x400U" || barcodeType.id === "0x800U") ? 0 : numberOfFrontSideColumn}
                                                        onChange={(e) => setNumberOfFrontSideColumn(e.target.value)}
                                                    />
                                                )} */}
                            </div>
                          </Row>
                        )}
                        {(barcodeType.id === "0x400U" ||
                          barcodeType.id === "0x800U") && (
                          <Row className="mb-3">
                            <label
                              htmlFor="example-text-input"
                              className="col-md-2 "
                              style={{ fontSize: ".9rem" }}
                            >
                              Set option:
                            </label>
                            <div className="col-md-10">
                              <Select
                                value={option}
                                onChange={(selectedValue) =>
                                  setOption(selectedValue)
                                }
                                options={
                                  barcodeType.id === "0x400U"
                                    ? upcaOptionData
                                    : upceOptionData
                                }
                                getOptionLabel={(option) => option?.name || ""}
                                getOptionValue={(option) =>
                                  option?.id?.toString() || ""
                                }
                              />
                              {/* {(!(barcodeType.id === "0x400U" || barcodeType.id === "0x800U") || Object.keys(barcodeType).length === 0) && (
                                                    <input
                                                        type="number"
                                                        className="form-control"

                                                        // value={}
                                                        onChange={(e) => setNumberOfFrontSideColumn(e.target.value)}
                                                    />
                                                )} */}
                            </div>
                          </Row>
                        )}
                        {barcodeCategory.id !== "software" && (
                          <Row className="mb-3">
                            <label
                              htmlFor="example-text-input"
                              className="col-md-6 "
                              style={{ fontSize: ".9rem" }}
                            >
                              Set Barcode reading area :-
                            </label>
                          </Row>
                        )}
                        {/* <Row className="mb-3">

                                        <label
                                            htmlFor="example-text-input"
                                            className="col-md-2 "
                                            style={{ fontSize: ".9rem" }}
                                        >
                                            Top :
                                        </label>
                                        <div className="col-md-2">
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={numberOfFrontSideColumn}
                                                onChange={(e) =>
                                                    setNumberOfFrontSideColumn(e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="col-md-2">
                                            <p>in mm</p>
                                        </div>
                                        <label
                                            htmlFor="example-text-input"
                                            className="col-md-2 "
                                            style={{ fontSize: ".9rem" }}
                                        >
                                            Bottom :
                                        </label>
                                        <div className="col-md-2">
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={numberOfFrontSideColumn}
                                                onChange={(e) =>
                                                    setNumberOfFrontSideColumn(e.target.value)
                                                }
                                            />
                                        </div>
                                        <div className="col-md-2">
                                            <p>in mm</p>
                                        </div>

                                    </Row> */}
                        {barcodeCategory.id !== "software" && (
                          <Row className="mb-3 align-items-center">
                            <label
                              htmlFor="top-input"
                              className="col-md-2 col-form-label"
                              style={{ fontSize: ".9rem" }}
                            >
                              Top:
                            </label>
                            <div className="col-md-2">
                              <input
                                type="number"
                                className="form-control"
                                id="top-input"
                                value={barcodeTopPos}
                                onChange={(e) =>
                                  setBarcodeTopPos(e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-2">
                              <p className="m-0" style={{ fontSize: ".9rem" }}>
                                in mm
                              </p>
                            </div>
                            <label
                              htmlFor="bottom-input"
                              className="col-md-2 col-form-label"
                              style={{ fontSize: ".9rem" }}
                            >
                              Bottom:
                            </label>
                            <div className="col-md-2">
                              <input
                                type="number"
                                className="form-control"
                                id="bottom-input"
                                value={barcodeBottomPos}
                                onChange={(e) =>
                                  setBarcodeBottomPos(e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-2">
                              <p className="m-0" style={{ fontSize: ".9rem" }}>
                                in mm
                              </p>
                            </div>
                          </Row>
                        )}

                        {barcodeCategory.id !== "software" && (
                          <Row className="mb-3 align-items-center">
                            <label
                              htmlFor="top-input"
                              className="col-md-2 col-form-label"
                              style={{ fontSize: ".9rem" }}
                            >
                              Left:
                            </label>
                            <div className="col-md-2">
                              <input
                                type="number"
                                className="form-control"
                                id="top-input"
                                value={barcodeLeftPos}
                                onChange={(e) =>
                                  setBarcodeLeftPos(e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-2">
                              <p className="m-0" style={{ fontSize: ".9rem" }}>
                                in mm
                              </p>
                            </div>
                            <label
                              htmlFor="bottom-input"
                              className="col-md-2 col-form-label"
                              style={{ fontSize: ".9rem" }}
                            >
                              Right:
                            </label>
                            <div className="col-md-2">
                              <input
                                type="number"
                                className="form-control"
                                id="bottom-input"
                                value={barcodeRightPos}
                                onChange={(e) =>
                                  setBarcodeRightPos(e.target.value)
                                }
                              />
                            </div>
                            <div className="col-md-2">
                              <p className="m-0" style={{ fontSize: ".9rem" }}>
                                in mm
                              </p>
                            </div>
                          </Row>
                        )}
                      </>
                    </Tab.Pane>
                    <Tab.Pane eventKey="image">
                      <Form>
                        <Row className="mb-3 align-items-center">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-3 col-form-label"
                            style={{ fontSize: ".9rem" }}
                          >
                            Image Color :
                          </label>

                          <div className="col-md-9 d-flex align-items-center justify-content-between">
                            <div className="form-check form-check-inline mr-3">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="colorType"
                                id="grayscale"
                                value="grayscale"
                                checked={colorType === "grayscale"}
                                onChange={(e) => setColorType(e.target.value)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="grayscale"
                              >
                                Grayscale
                              </label>
                            </div>

                            <div className="form-check form-check-inline mr-3">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="colorType"
                                id="color"
                                value="color"
                                checked={colorType === "color"}
                                onChange={(e) => setColorType(e.target.value)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="color"
                              >
                                Color
                              </label>
                            </div>
                            <div className="form-check form-check-inline mr-3">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="colorType"
                                id="blackwhite"
                                value="blackwhite"
                                checked={colorType === "blackwhite"}
                                onChange={(e) => setColorType(e.target.value)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="blackwhite"
                              >
                                Black & White
                              </label>
                            </div>
                            <div>
                              <img
                                src={
                                  colorType === "color"
                                    ? "/colored.webp"
                                    : colorType === "blackwhite"
                                    ? "/grayscale.webp"
                                    : "/grayscale.webp"
                                }
                                width={100}
                                height={100}
                                alt={colorType}
                                className="rounded shadow"
                              />
                            </div>
                          </div>
                        </Row>

                        <Row className="mb-3">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-3 col-form-label"
                            style={{ fontSize: ".9rem" }}
                          >
                            Image Type :
                          </label>
                          <div className="col-md-9">
                            <Select
                              value={encoding}
                              onChange={(selectedValue) =>
                                setEncoding(selectedValue)
                              }
                              options={encodingOptionData}
                              getOptionLabel={(option) => option?.name || ""}
                              getOptionValue={(option) =>
                                option?.id?.toString() || ""
                              }
                              placeholder="Select an encoding option..."
                            />
                          </div>
                        </Row>
                        <Row className="mb-3">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-3 col-form-label"
                            style={{ fontSize: ".9rem" }}
                          >
                            Rotation :
                          </label>
                          <div className="col-md-9">
                            <Select
                              value={rotation}
                              onChange={(selectedValue) =>
                                setRotation(selectedValue)
                              }
                              options={rotationOptionData}
                              getOptionLabel={(option) => option?.name || ""}
                              getOptionValue={(option) =>
                                option?.id?.toString() || ""
                              }
                              placeholder="Select rotation option..."
                            />
                          </div>
                        </Row>
                        <Row className="mb-3">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-3 col-form-label "
                            style={{ fontSize: ".9rem" }}
                          >
                            Resolution :
                          </label>
                          <div className="col-md-9">
                            <Select
                              value={resolution}
                              onChange={(selectedValue) =>
                                setResolution(selectedValue)
                              }
                              options={resolutionOptionData}
                              getOptionLabel={(option) => option?.name || ""}
                              getOptionValue={(option) =>
                                option?.id?.toString() || ""
                              }
                              placeholder="Select Resolution Option..."
                            />
                            {resolution?.id === "0" && (
                              <span
                                style={{ color: "orangered", display: "block" }}
                              >
                                *Scanning will be slow on 600DPI*
                              </span>
                            )}
                          </div>
                        </Row>
                        <Row className="mb-3">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-3 col-form-label"
                            style={{ fontSize: ".9rem" }}
                          >
                            Scanning Side :
                          </label>
                          <div className="col-md-9">
                            <Select
                              value={scannningSide}
                              onChange={(selectedValue) =>
                                setScanningSide(selectedValue)
                              }
                              options={scanningSideData}
                              getOptionLabel={(option) => option?.name || ""}
                              getOptionValue={(option) =>
                                option?.id?.toString() || ""
                              }
                              placeholder="Select Scanning Side..."
                            />
                          </div>
                        </Row>
                        {/* <Row className="mb-3">
                          <label
                            htmlFor="example-text-input col-form-label"
                            className="col-md-3 col-form-label"
                            style={{ fontSize: ".9rem" }}
                          >
                            Image Compression :
                          </label>
                          <div className="col-md-9">
                            <Select
                              value={imageParams}
                              onChange={(selectedValue) =>
                                setImageParams(selectedValue)
                              }
                              options={imageParamsData}
                              getOptionLabel={(option) => option?.name || ""}
                              getOptionValue={(option) =>
                                option?.id?.toString() || ""
                              }
                              placeholder="Select Compression..."
                            />
                          </div>
                        </Row> */}
                      </Form>
                    </Tab.Pane>
                  </Tab.Content>
                </Col>
              </Row>
            </Tab.Container>
          )}

          {selectedUI === "DUPLEX" &&
            activeTab === "duplex" &&
            selectedUI !== "" && (
              <Tab.Container
                activeKey={activeKey}
                onSelect={(k) => setActiveKey(k)}
              >
                <Row>
                  <Col sm={12}>
                    {/* Adjusted column span to full width if needed */}
                    <Nav
                      variant="pills"
                      className="flex-row justify-content-center"
                    >
                      <Nav.Item>
                        <Nav.Link eventKey="general">General</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="barcode">Barcode</Nav.Link>
                      </Nav.Item>
                      {imageStatus.id !== "0" && (
                        <Nav.Item>
                          <Nav.Link eventKey="image">Image</Nav.Link>
                        </Nav.Item>
                      )}
                    </Nav>
                  </Col>
                  <Col sm={12} className="mt-3">
                    <Tab.Content>
                      <Tab.Pane eventKey="general">
                        <Row className="mb-3">
                          <Col md={6}>
                            <Row>
                              <label
                                htmlFor="example-text-input"
                                className="col-md-4 col-form-label"
                                style={{ fontSize: ".9rem" }}
                              >
                                No. of Rows :
                              </label>
                              <div className="col-md-6">
                                <input
                                  type="number"
                                  className="form-control"
                                  value={numberOfLines}
                                  placeholder="Enter rows"
                                  onChange={(e) => {
                                    settoggle((item) => ({
                                      ...item,
                                      row: false,
                                    }));
                                    setNumberOfLines(e.target.value);
                                  }}
                                  style={{
                                    border: toggle.row ? "1px solid red" : "",
                                  }}
                                />
                                {!numberOfLines && (
                                  <span
                                    style={{
                                      color: "red",
                                      display: spanDisplay,
                                    }}
                                  >
                                    This feild is required
                                  </span>
                                )}
                              </div>
                            </Row>
                          </Col>
                          <Col md={6}>
                            <Row>
                              <label
                                htmlFor="example-text-input"
                                className="col-md-6 col-form-label "
                                style={{ fontSize: ".9rem" }}
                              >
                                Number of columns:
                              </label>
                              <div className="col-md-6">
                                <input
                                  placeholder="Enter columns"
                                  type="number"
                                  className="form-control"
                                  value={numberOfFrontSideColumn}
                                  onChange={(e) => {
                                    settoggle((item) => ({
                                      ...item,
                                      col: false,
                                    }));
                                    setNumberOfFrontSideColumn(e.target.value);
                                  }}
                                  style={{
                                    border: toggle.col ? "1px solid red" : "",
                                  }}
                                />
                                {!numberOfFrontSideColumn && (
                                  <span
                                    style={{
                                      color: "red",
                                      display: spanDisplay,
                                    }}
                                  >
                                    This feild is required
                                  </span>
                                )}
                              </div>
                            </Row>
                          </Col>
                        </Row>
                      </Tab.Pane>
                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
            )}
        </Modal.Body>
        <Modal.Footer>
          <div style={{ width: "50%" }}>
            {/* <div class="mb-4" >
                        <label for="formFile" class="form-label">Upload OMR Image</label>
                        <input class="form-control" type="file" id="formFile" onChange={handleImageUpload} accept="image/*" />
                    </div> */}
            <div>
              <div>
                {selectedUI &&
                  (!image ? (
                    <Button onClick={imageModalHandler}>Select Image</Button>
                  ) : (
                    <div>
                      <Button variant="info" onClick={imageModalHandler}>
                        Choose another
                      </Button>
                      <img
                        src={image}
                        alt="Fetched Thumbnail"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div
            className="w-20 flex-shrink-0"
            style={{
              content: "",
              width: "12%",
            }}
          ></div>{" "}
          {/* Spacer div */}
          <Button
            variant="secondary"
            onClick={() => {
              props.onHide();
              resetModalHandler();
            }}
          >
            Close
          </Button>
          <Button variant="success" onClick={debouncedClick}>
            Create Template
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={imageModal}
        // onHide={props.onHide}
        size="lg"
        aria-labelledby="modal-custom-navbar"
        centered
        dialogClassName="modal-50w"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body style={{ height: "80dvh" }}>
          <>
            {scannerLoading && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.2)", // Slightly opaque background
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 999,
                  pointerEvents: "auto", // Make the overlay not clickable
                }}
              >
                <Spinner />
              </div>
            )}
            <div className="container mt-4">
              <style jsx>{`
                .upload-box {
                  cursor: pointer;
                  background-color: #f8f9fa;
                  border: 1px solid #dee2e6;
                  border-radius: 10px;
                  padding: 20px;
                  text-align: center;
                  transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .upload-box:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                }
                .upload-box h1 {
                  font-size: 1.5rem;
                  color: #333;
                }
              `}</style>

              <Row>
                <Col lg={6} md={6} className="mb-4">
                  <div
                    onClick={systemHandler}
                    className="upload-box p-4 text-center border rounded"
                  >
                    <h1 className="fs-3 text-dark">Upload From System</h1>
                  </div>
                </Col>
                <Col lg={6} md={6} className="mb-4">
                  <div
                    onClick={scannerHandler}
                    className="upload-box p-4 text-center border rounded"
                  >
                    <h1>Upload From Scanner</h1>
                  </div>
                </Col>
              </Row>
              <Row className="d-flex justify-content-center mt-2">
                {images.length > 0 && (
                  <div className=" my-1">
                    <div className="row justify-content-center">
                      <div className="col-12 col-md-8">
                        {/* Toggle Buttons */}
                        <div className="d-flex justify-content-center mb-3">
                          <button
                            className={`btn ${
                              showFront ? "btn-primary" : "btn-outline-primary"
                            } me-2`}
                            onClick={() => setShowFront(true)}
                          >
                            Show Front Images
                          </button>
                          <button
                            className={`btn ${
                              !showFront ? "btn-primary" : "btn-outline-primary"
                            }`}
                            onClick={() => setShowFront(false)}
                          >
                            Show Back Images
                          </button>
                        </div>

                        {/* Front Image Carousel */}
                        {showFront && (
                          <Carousel
                            showArrows={true}
                            showThumbs={false}
                            infiniteLoop
                            emulateTouch
                          >
                            {images.map((item, index) => (
                              <div key={index}>
                                <img
                                  src={`http://localhost:5000/GetImage?imagePath=${item.frontImagePath}`}
                                  alt={`Front Slide ${index + 1}`}
                                  className="img-fluid rounded"
                                  style={{
                                    maxHeight: "300px",
                                    objectFit: "cover",
                                    width: "100%",
                                  }}
                                />
                                <p className="legend">{`Front Image ${
                                  index + 1
                                }`}</p>
                              </div>
                            ))}
                          </Carousel>
                        )}

                        {/* Back Image Carousel */}
                        {!showFront && (
                          <Carousel
                            showArrows={true}
                            showThumbs={false}
                            infiniteLoop
                            emulateTouch
                          >
                            {images.map((item, index) => (
                              <div key={index}>
                                <img
                                  src={`http://localhost:5000/GetImage?imagePath=${item.backImagePath}`}
                                  alt={`Back Slide ${index + 1}`}
                                  className="img-fluid rounded"
                                  style={{
                                    maxHeight: "400px",
                                    objectFit: "cover",
                                    width: "100%",
                                  }}
                                />
                                <p className="legend">{`Back Image ${
                                  index + 1
                                }`}</p>
                              </div>
                            ))}
                          </Carousel>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {images.length === 0 && <p>Please select the image</p>}
              </Row>
            </div>
          </>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="warning"
            onClick={() => {
              setImageModal(false);
            }}
          >
            Close
          </Button>
          <Button variant="success" onClick={saveHandler}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={fileModal}
        size="sm"
        aria-labelledby="modal-custom-navbar"
        centered
        dialogClassName="modal-50w"
        // backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title id="modal-custom-navbar">Select Images</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "65dvh", overflow: "auto" }}>
          <Row className="d-flex justify-content-center mt-4">
            <label>Choose Front Excel File</label>
            <input
              className="form-control"
              type="file"
              id="formFile"
              onChange={handleExcelUpload}
              accept=".xls,.xlsx,.csv"
            />
          </Row>
          <Row className="d-flex justify-content-center mt-4">
            <label>Choose Back Excel File</label>
            <input
              className="form-control"
              type="file"
              id="formFile"
              onChange={handleBackExcelUpload}
              accept=".xls,.xlsx,.csv"
            />
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="warning"
            onClick={() => {
              setFileModal(false);
            }}
          >
            Close
          </Button>
          <Button variant="success" onClick={saveFileHandler}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DuplexTemplateModal;
