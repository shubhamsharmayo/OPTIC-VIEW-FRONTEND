import React, { useState } from "react";
import CustomDraggableModal from "./test";
import { Button } from "react-bootstrap";

const Test2 = () => {
  const [show, setShow] = useState(false);

  return (
    <div >
      <Button style={{position:"absolute", top:"40px"}} onClick={() => {
        console.log(
            'clicked'
        )
        setShow(true);
      }}>Open Draggable Modal</Button>
      <CustomDraggableModal show={show} onClose={() => setShow(false)} title="My Custom Draggable Modal" />
     {/* <CustomDraggableModal show={show} onClose={() => setShow(false)} title="New Draggable Modal" /> */}
    </div>
  );
};

export default Test2;
