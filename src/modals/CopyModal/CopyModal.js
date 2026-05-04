import React, { useContext, useEffect, useRef, useState } from "react";
import { Row } from "reactstrap";
import { Modal, Button, Col } from "react-bootstrap";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Box,
} from "@mui/material";
import CustomDraggableModal from "views/test";
const CopyModal = (props) => {
  const [modalShow, setModalShow] = useState(false);
  const [value, setValue] = useState("top"); // Default value
  const [pitchValue, setPitchValue] = useState(null);
  const [copiedNumber, setCopiedNumber] = useState(null);
  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const saveRegion = () => {
    if(props.type==="simpleCopy"){

      props.saveRegion(pitchValue, value,copiedNumber);
    }else{
      props.saveGroupRegion(pitchValue, value,copiedNumber);
    }
  };
  return (
    <CustomDraggableModal
      show={props.show}
      size="sm"
      onClose={() => {
          props.onHide();
        }}
      // onHide={() => setModalShow(false)}
    >
      <CustomDraggableModal.Header>
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          SELECT COPYING AREA
        </div>
      </CustomDraggableModal.Header>
      <CustomDraggableModal.Body >
        <Box
          sx={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            maxWidth: "400px",
            margin: "auto", // Center the box horizontally
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <FormControl component="fieldset" fullWidth>
            <FormLabel
              component="legend"
              sx={{
                textAlign: "center",
                display: "block", // Ensure it takes up full width
                marginBottom: "16px", // Add some space below the label
              }}
            >
              Label placement
            </FormLabel>
            <RadioGroup value={value} onChange={handleChange}>
              <Grid container spacing={2} alignItems="center">
                {/* Top */}
                <Grid item xs={12} style={{ textAlign: "center" }}>
                  <FormControlLabel
                    value="top"
                    control={<Radio />}
                    label="Top"
                    labelPlacement="top"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Grid
                    container
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    {/* Start (Left) */}
                    <FormControlLabel
                      value="start"
                      control={<Radio />}
                      label="Left"
                      labelPlacement="start"
                    />

                    {/* Empty space to place the end button on the other side */}
                    <div style={{ flexGrow: 1 }}></div>

                    {/* End (Right) */}
                    <FormControlLabel
                      value="end"
                      control={<Radio />}
                      label="Right"
                      labelPlacement="end"
                    />
                  </Grid>
                </Grid>

                {/* Bottom */}
                <Grid item xs={12} style={{ textAlign: "center" }}>
                  <FormControlLabel
                    value="bottom"
                    control={<Radio />}
                    label="Bottom"
                    labelPlacement="bottom"
                  />
                </Grid>
              </Grid>
            </RadioGroup>
          </FormControl>
        </Box>
        <Box
          sx={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            maxWidth: "400px",
            margin: "auto", // Center the box horizontally
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <Row className="mb-3">
            <label
              htmlFor="example-text-input"
              className="col-md-3      col-form-label "
            >
              Pitch Interval
            </label>
            <div className="col-9 ">
              <input
                type="number"
                className="form-control"
                value={pitchValue}
                onChange={(e) => setPitchValue(e.target.value)}
                placeholder="Enter pitch"
              />
              <small id="passwordHelpBlock" class="form-text text-muted">
                Specify the interval after which the area should be copied.
              </small>
            </div>
          </Row>
          <Row>
            <label
              htmlFor="example-text-input"
              className="col-md-3 col-form-label "
            >
              Number of Copies
            </label>
            <div className="col-9 ">
              <input
                type="number"
                className="form-control"
                value={copiedNumber}
                onChange={(e) => setCopiedNumber(e.target.value)}
                placeholder="Enter  Number of Copies"
              />
              <small id="passwordHelpBlock" class="form-text text-muted">
                Specify how many times the area should be duplicated.
              </small>
            </div>
          </Row>
        </Box>
      </CustomDraggableModal.Body>
      <CustomDraggableModal.Footer>
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
          onClick={saveRegion}
          className="waves-effect waves-light"
        >
          Copy
        </Button>
      </CustomDraggableModal.Footer>
    </CustomDraggableModal>
  );
};

export default CopyModal;
