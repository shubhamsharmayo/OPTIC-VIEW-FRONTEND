import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Modal, Button } from "react-bootstrap";
import DataContext from "store/DataContext";
import Placeholder from "ui/Placeholder";
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Table,
} from "reactstrap";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import IconButton from "@mui/material/IconButton";
import TableRow from "components/TableRow";
import { toast } from "react-toastify";
import DeleteIcon from "@mui/icons-material/Delete";
import isEqual from "lodash.isequal";
const FieldDetails = (props) => {
  const [fields, setFields] = useState([]);
  const [animatingIndex, setAnimatingIndex] = useState(null);
  const [direction, setDirection] = useState(null);
  const [questionField, setQuestionFields] = useState([]);
  const [skewField, setSkewField] = useState([]);
  const [formField, setFormField] = useState([]);
  const [idField, setIdField] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [items, setItems] = useState(false);

  const prevSelectedRef = useRef();
  // Only initialize when modal opens

  // Example: Selecting All

  const handleSelectAll = (e) => {
    const allCurrentFields = [
      ...formField,
      ...questionField,
      ...skewField,
      ...idField,
    ];
    console.log(allCurrentFields);
    if (e.target.checked) {
      const allIds = allCurrentFields.map((item, i) => `${item.name}-${i}`);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleCheckboxChange = (id, item) => {
    console.log(item);
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const isAllSelected = () => {
    const allCurrentFields = [
      ...formField,
      ...questionField,
      ...skewField,
      ...idField,
    ];
    return (
      allCurrentFields.length > 0 &&
      selectedItems.length === allCurrentFields.length
    );
  };

  const dataCtx = useContext(DataContext);
  useEffect(() => {
    // If it's the first render or props.selected has changed deeply
    if (props.selected) {
      const selectedFields = JSON.parse(JSON.stringify(props.selected)); // Deep copy to prevent parent overwrite

      const groupedFields = selectedFields.reduce((acc, item) => {
        if (!acc[item.fieldType]) {
          acc[item.fieldType] = [];
        }
        acc[item.fieldType].push(item);
        return acc;
      }, {});

      setQuestionFields(groupedFields["questionField"] || []);
      setSkewField(groupedFields["skewMarkField"] || []);
      setFormField(groupedFields["formField"] || []);
      setIdField(groupedFields["idField"] || []);
      setFields(selectedFields);
      setSelectedItems([]);
    }
  }, [items]);

  const moveUp = (index) => {
    if (index > 0) {
      setAnimatingIndex(index);
      setDirection("up");
      setTimeout(() => {
        const newFields = [...fields];
        [newFields[index], newFields[index - 1]] = [
          newFields[index - 1],
          newFields[index],
        ];
        setFields(newFields);
        setAnimatingIndex(null);
        setDirection(null);
        resetAnimation();
      }, 300);
    }
  };

  const moveDown = (index) => {
    if (index < fields.length - 1) {
      setAnimatingIndex(index);
      setDirection("down");
      setTimeout(() => {
        const newFields = [...fields];
        [newFields[index], newFields[index + 1]] = [
          newFields[index + 1],
          newFields[index],
        ];
        setFields(newFields);
        setAnimatingIndex(null);
        setDirection(null);
        resetAnimation();
      }, 300);
    }
  };

  const resetAnimation = () => {
    setAnimatingIndex(null);
    setDirection(null);
  };
  const questionTemplates = questionField?.map((item, i) => {
    const isAnimating = animatingIndex === i;
    const slno = isAnimating ? (direction === "up" ? i + 1 : i - 1) : i + 1;
    return (
      <tr
        key={i}
        style={{
          backgroundColor: isAnimating
            ? direction === "up"
              ? "#f0f0f0"
              : "#d9d9d9"
            : "transparent",
          transition:
            "background-color 0.3s ease-in-out, transform 0.3s ease-in-out",
          transform: isAnimating
            ? direction === "up"
              ? "translateY(-50px)"
              : "translateY(50px)"
            : "none",
        }}
      >
        <td>{slno}</td> {/* Serial number */}
        <td>{item.name}</td>
        <td>{item.fieldType}</td>
        <td>
          <IconButton onClick={() => moveUp(i)} aria-label="move up">
            <ArrowCircleUpIcon fontSize="inherit" />
          </IconButton>
          <IconButton onClick={() => moveDown(i)} aria-label="move down">
            <ArrowCircleDownIcon fontSize="inherit" />
          </IconButton>
        </td>
        <td>
          <UncontrolledDropdown>
            <DropdownToggle
              className="btn-icon-only "
              href="#pablo"
              role="button"
              size="sm"
              onClick={(e) => e.preventDefault()}
            >
              <i className="fas fa-ellipsis-v" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem
                onClick={() => {
                  console.log("called");
                  console.log(item, i);
                  props.editHandler(item, i);
                }}
              >
                Edit
              </DropdownItem>
              <DropdownItem style={{ color: "red" }}>Delete</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </td>
      </tr>
    );
  });
  const formTemplates = formField?.map((item, i) => {
    const isAnimating = animatingIndex === i;
    const slno = isAnimating ? (direction === "up" ? i + 1 : i - 1) : i + 1;
    return (
      <tr
        key={i}
        style={{
          backgroundColor: isAnimating
            ? direction === "up"
              ? "#f0f0f0"
              : "#d9d9d9"
            : "transparent",
          transition:
            "background-color 0.3s ease-in-out, transform 0.3s ease-in-out",
          transform: isAnimating
            ? direction === "up"
              ? "translateY(-50px)"
              : "translateY(50px)"
            : "none",
        }}
      >
        <td>{slno}</td> {/* Serial number */}
        <td>{item.name}</td>
        <td>{item.fieldType}</td>
        <td>
          <IconButton onClick={() => moveUp(i)} aria-label="move up">
            <ArrowCircleUpIcon fontSize="inherit" />
          </IconButton>
          <IconButton onClick={() => moveDown(i)} aria-label="move down">
            <ArrowCircleDownIcon fontSize="inherit" />
          </IconButton>
        </td>
        <td>
          <UncontrolledDropdown>
            <DropdownToggle
              className="btn-icon-only "
              href="#pablo"
              role="button"
              size="sm"
              onClick={(e) => e.preventDefault()}
            >
              <i className="fas fa-ellipsis-v" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem
                onClick={() => {
                  console.log(item, i);
                  props.editHandler(item, i);
                }}
              >
                Edit
              </DropdownItem>
              <DropdownItem style={{ color: "red" }}>Delete</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </td>
      </tr>
    );
  });
  const skewTemplates = skewField?.map((item, i) => {
    const isAnimating = animatingIndex === i;
    const slno = isAnimating ? (direction === "up" ? i + 1 : i - 1) : i + 1;
    return (
      <tr
        key={i}
        style={{
          backgroundColor: isAnimating
            ? direction === "up"
              ? "#f0f0f0"
              : "#d9d9d9"
            : "transparent",
          transition:
            "background-color 0.3s ease-in-out, transform 0.3s ease-in-out",
          transform: isAnimating
            ? direction === "up"
              ? "translateY(-50px)"
              : "translateY(50px)"
            : "none",
        }}
      >
        <td>{slno}</td> {/* Serial number */}
        <td>{item.name}</td>
        <td>{item.fieldType}</td>
        <td>
          <IconButton onClick={() => moveUp(i)} aria-label="move up">
            <ArrowCircleUpIcon fontSize="inherit" />
          </IconButton>
          <IconButton onClick={() => moveDown(i)} aria-label="move down">
            <ArrowCircleDownIcon fontSize="inherit" />
          </IconButton>
        </td>
        <td>
          <UncontrolledDropdown>
            <DropdownToggle
              className="btn-icon-only "
              href="#pablo"
              role="button"
              size="sm"
              onClick={(e) => e.preventDefault()}
            >
              <i className="fas fa-ellipsis-v" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem
                onClick={() => {
                  console.log(item, i);
                  props.editHandler(item, i);
                }}
              >
                Edit
              </DropdownItem>
              <DropdownItem style={{ color: "red" }}>Delete</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </td>
      </tr>
    );
  });
  const idTemplates = idField?.map((item, i) => {
    const isAnimating = animatingIndex === i;
    const slno = isAnimating ? (direction === "up" ? i + 1 : i - 1) : i + 1;
    return (
      <tr
        key={i}
        style={{
          backgroundColor: isAnimating
            ? direction === "up"
              ? "#f0f0f0"
              : "#d9d9d9"
            : "transparent",
          transition:
            "background-color 0.3s ease-in-out, transform 0.3s ease-in-out",
          transform: isAnimating
            ? direction === "up"
              ? "translateY(-50px)"
              : "translateY(50px)"
            : "none",
        }}
      >
        <td>{slno}</td> {/* Serial number */}
        <td>{item.name}</td>
        <td>{item.fieldType}</td>
        <td>
          <IconButton onClick={() => moveUp(i)} aria-label="move up">
            <ArrowCircleUpIcon fontSize="inherit" />
          </IconButton>
          <IconButton onClick={() => moveDown(i)} aria-label="move down">
            <ArrowCircleDownIcon fontSize="inherit" />
          </IconButton>
        </td>
        <td>
          <UncontrolledDropdown>
            <DropdownToggle
              className="btn-icon-only "
              href="#pablo"
              role="button"
              size="sm"
              onClick={(e) => e.preventDefault()}
            >
              <i className="fas fa-ellipsis-v" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem
                onClick={() => {
                  console.log(item, i);
                  props.editHandler(item, i);
                }}
              >
                Edit
              </DropdownItem>
              <DropdownItem style={{ color: "red" }}>Delete</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </td>
      </tr>
    );
  });

  const handleSort = useCallback((type, sortedFields) => {
    if (type === "questionField") {
      setQuestionFields(sortedFields);
    }
    if (type === "skewField") {
      setSkewField(sortedFields);
    }
    if (type === "formField") {
      setFormField(sortedFields);
    }

    if (type === "idField") {
      setIdField(sortedFields);
    }
  }, []);
  const handleFormSort = useCallback((sortedFields) => {}, []);
  const handleSave = () => {
    dataCtx.changeIndexTemplate(questionField, "questionField");
    dataCtx.changeIndexTemplate(skewField, "skewMarkField");
    dataCtx.changeIndexTemplate(formField, "formField");
    dataCtx.changeIndexTemplate(idField, "idField");
    toast.success("Saved the positions!!");
    props.onHide();
  };
  const handleDelete = () => {
    const result = window.confirm(
      "Are you certain you want to delete the selected fields?"
    );
    if (!result) {
      return;
    }
    const allCurrentFields = [
      ...formField,
      ...questionField,
      ...skewField,
      ...idField,
    ];
    const indexes = selectedItems.map((item) =>
      parseInt(item.split("-").pop(), 10)
    );
    const matchedItems = allCurrentFields.filter((_, idx) =>
      indexes.includes(idx)
    );
    dataCtx.deleteMultipleFields(matchedItems);
    setTimeout(() => {
      setItems((prev) => !prev);
    }, 500);

    toast.success("Selected fields deleted successfully.");
  };
  return (
    <Modal
      show={props.show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      onHide={props.onHide}
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          {" "}
          <span style={{ fontSize: "1.2rem" }}>All Fields</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          height: "60vh",
          overflow: "auto",
          paddingTop: "0",
          marginTop: "10px",
        }}
      >
        <Table
          className="align-items-center table-flush mb-5 table-hover"
          // responsive
        >
          <thead
            // className="thead-light"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              // backgroundColor: "white",

              backgroundColor: "#000000",
              color: "white",
              fontSize: "1.7rem !important",
            }}
          >
            <tr>
              <th scope="col">
                <input
                  type="checkbox"
                  checked={isAllSelected()}
                  onChange={handleSelectAll}
                />
              </th>
              <th scope="col" style={{ fontSize: "0.7rem" }}>
                SL no.
              </th>
              <th scope="col" style={{ fontSize: "0.7rem" }}>
                Field Name
              </th>
              <th scope="col" style={{ fontSize: "0.7rem" }}>
                Field Type
              </th>
              <th scope="col" style={{ fontSize: "0.7rem" }}>
                Change Direction
              </th>
              <th scope="col" style={{ fontSize: "0.7rem" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <TableRow
              type="formField"
              fieldData={formField}
              handleSort={handleSort}
              editHandler={(item, i) => props.editHandler(item, i)}
              deleteHander={(item, i) => {
                setItems((prev) => !prev);
                props.deleteHandler(item, i);
              }}
              selectedItems={selectedItems}
              handleCheckboxChange={handleCheckboxChange}
              serialOffset={0}
              linkedFields={props.linkFields??[]}
            />

            <TableRow
              type="questionField"
              fieldData={questionField}
              handleSort={handleSort}
              editHandler={(item, i) => props.editHandler(item, i)}
              deleteHander={(item, i) => {
                setItems((prev) => !prev);
                props.deleteHandler(item, i);
              }}
              selectedItems={selectedItems}
              handleCheckboxChange={handleCheckboxChange}
              serialOffset={formField.length}
              linkedFields={[]}
            />

            <TableRow
              type="skewField"
              fieldData={skewField}
              handleSort={handleSort}
              editHandler={(item, i) => props.editHandler(item, i)}
              deleteHander={(item, i) => {
                setItems((prev) => !prev);
                props.deleteHandler(item, i);
              }}
              selectedItems={selectedItems}
              handleCheckboxChange={handleCheckboxChange}
              serialOffset={formField.length + questionField.length}
              linkedFields={[]}
            />
            <TableRow
              type="idField"
              fieldData={idField}
              handleSort={handleSort}
              editHandler={(item, i) => props.editHandler(item, i)}
              deleteHander={(item, i) => {
                setItems((prev) => !prev);
                props.deleteHandler(item, i);
              }}
              selectedItems={selectedItems}
              handleCheckboxChange={handleCheckboxChange}
              serialOffset={
                formField.length + questionField.length + skewField.length
              }
              linkedFields={[]}
            />

            {/* {props.fieldsLoading ? placeHolderJobs : LoadedTemplates} */}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        {/* Left Side: Delete Button */}
        <Button
          type="button"
          variant="outline-danger"
          className="waves-effect waves-light d-flex align-items-center"
          onClick={handleDelete}
        >
          <DeleteIcon className="me-2" /> Delete
        </Button>

        {/* Right Side: Cancel and Save Buttons */}
        <div>
          <Button
            type="button"
            variant="danger"
            onClick={props.onHide}
            className="waves-effect waves-light me-2"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="success"
            className="waves-effect waves-light"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default React.memo(FieldDetails);
