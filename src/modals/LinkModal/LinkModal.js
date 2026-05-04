import React, { useContext } from "react";
import { Modal, Button, Col } from "react-bootstrap";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import DataContext from "store/DataContext";
import { TextField } from "@mui/material";
import isEqual from "lodash/isEqual";
import { MultiSelect } from "react-multi-select-component";
const identifier = {
  formField: "formFieldWindowParameters",
  skewMarkField: "skewMarksWindowParameters",
};

const LinkModal = (props) => {
  const [fieldValues, setFieldValues] = React.useState([]);
  const [fieldName, setFieldName] = React.useState(null);
  const [fields, setFields] = React.useState([]);
  const [selectedCol, setSelectedCol] = React.useState([]);
  const dataCtx = useContext(DataContext);
  React.useEffect(() => {
    if (props.selectedCoordinates.length !== 0) {
      const linkedCoordinates = dataCtx.allTemplates[0][0].linkedCoordinates;
      console.log(linkedCoordinates);
      if (linkedCoordinates) {
        const filteredLinkedCoordinates = linkedCoordinates.filter(
          (coordinate) => coordinate.fieldType.includes(props.fieldType)
        );

        const fields = props.selectedCoordinates.filter(
          (field) => field.fieldType === props.fieldType
        );
        console.log(fields);
        if (filteredLinkedCoordinates.length !== 0) {
          const flattened = filteredLinkedCoordinates
            .map((item) => item.fieldIndexes)
            .flat();

          // ✅ Assuming flattened indexes are based on `props.selectedCoordinates`
          const result = fields.filter(
            (field) =>
              !flattened.includes(props.selectedCoordinates.indexOf(field))
          );
       
          setFields(result);
          return;
        } else {
          setFields(fields);
          return;
        }

        console.log("if called");
      } else {
        console.log("else called");
        if (props.selectedCoordinates.length !== 0) {
          const fields = props.selectedCoordinates.filter((field) => {
            return field.fieldType === props.fieldType;
          });
          console.log(props.selectedCoordinates);
          setFields(fields);
        }
      }
      // setFields(fields);
    }
  }, [props.selectedCoordinates, props.fieldType]);
  console.log(fields);
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setFieldValues(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };
  // console.log("fieldValues", fieldValues);
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 300,
        zIndex: 13000,
      },
    },
  };

  const allFields = fields.map((field, index) => ({
    ...field,
    id: `${field.name}_${index}`,
  }));
  const saveArea = () => {
    const fieldIndexes = [];

    // Correctly retrieve the full field objects
    const filteredFields = allFields.filter((field) =>
      selectedCol.some((item) => item.value === field.id)
    );

    if (!fieldName) {
      alert("Field Name is required");
      return;
    }

    if (filteredFields.length <= 1) {
      alert("Please select the fields");
      return;
    }

    console.log(dataCtx.allTemplates);
    console.log(props.fieldType);

    const keyIdentifier = identifier[props.fieldType];
    console.log(keyIdentifier);

    const template = dataCtx.allTemplates[0][0][keyIdentifier];

    const formatCoordinate = (field) => ({
      "End Col": field.endCol,
      "End Row": field.endRow + 1,
      "Start Col": field.startCol,
      "Start Row": field.startRow + 1,
      fieldType: field.fieldType,
      name: field.name,
    });

    if (Array.isArray(template)) {
      filteredFields.forEach((field) => {
        const formatted = formatCoordinate(field);

        const index = template.findIndex((item) =>
          isEqual(item.Coordinate, formatted)
        );

        if (index !== -1) {
          fieldIndexes.push(index);
        }
      });
    }

    dataCtx.linkField(filteredFields, fieldName, fieldIndexes, keyIdentifier);
    props.onHide();
  };

  const options = allFields.map((field) => ({
    label: field.name,
    value: field.id,
  }));

  return (
    <Modal
      show={props.show}
      size="md"
      style={{ zIndex: "9999" }}
      // onHide={() => setModalShow(false)}
    >
      <Modal.Header>
        <Modal.Title
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          SELECT FIELDS THAT ARE TO BE LINKED
        </Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          width: "100%",
          height: "70dvh",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "1rem",
          gap: "1.5rem",
          backgroundColor: "#f9f9f9", // optional: light background
          borderRadius: "12px", // optional: soft rounded edges
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
          {props.fieldType}
        </div>

        <FormControl sx={{ width: "100%", maxWidth: 420 }}>
          <TextField
            id="field-name"
            label="Name"
            variant="outlined"
            fullWidth
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
          />
        </FormControl>

        <FormControl sx={{ width: "100%", maxWidth: 420 }}>
          {/* <InputLabel id="demo-multiple-checkbox-label">FIELDS</InputLabel> */}
          {/* <Select
            labelId="demo-multiple-checkbox-label"
            id="demo-multiple-checkbox"
            multiple
            value={fieldValues}
            onChange={handleChange}
            input={<OutlinedInput label="FIELDS" />}
            renderValue={(selected) =>
              selected
                .map((id) => {
                  const field = fields.find((f) => f.id === id);
                  return field ? field.name : id;
                })
                .join(", ")
            }
            MenuProps={MenuProps}
          >
            {allFields.map((field) => (
              <MenuItem key={field.id} value={field.id}>
                <Checkbox checked={fieldValues.includes(field.id)} />
                <ListItemText primary={field.name} />
              </MenuItem>
            ))}
          </Select> */}

          <MultiSelect
            options={options}
            value={selectedCol}
            onChange={setSelectedCol}
            labelledBy="Select Fields"
            overrideStrings={{ selectSomeItems: "SELECT FIELDS" }}
          />
        </FormControl>
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="button"
          variant="danger"
          onClick={() => props.onHide()}
          className="waves-effect waves-light"
        >
          Close
        </Button>
        <Button
          type="button"
          variant="success"
          // disabled
          onClick={saveArea}
          className="waves-effect waves-light"
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LinkModal;
