import React from "react";

function BootstrapNumberInput({
  value,
  setValue,
  start,
  end,
  setDerivedValue,
  label = "Steps",
  id = "number-input",
}) {
  const total = +end - +start + 1;

  const validateAndUpdate = (newValue) => {
    if (newValue > total) {
      alert("Steps cannot be larger than the combined area.");

      return;
    }

    
    if (newValue >= 1) {
      // setDerivedValue(Math.ceil(total / newValue));
      setValue(newValue);
    }
  };

  const handleDecrease = () => {
    const newValue = value - 1;
    if (newValue >= 1) {
      validateAndUpdate(newValue);
    }
  };

  const handleIncrease = () => {
    const newValue = value + 1;
    console.log(value);
    validateAndUpdate(newValue);
  };



  return (
    <div className="form-group mb-2">
      <div
        className="d-flex align-items-center"
        style={{
          border: "1px solid #ced4da",
          borderRadius: "0.25rem",
          overflow: "hidden",
          width: "170px",
        }}
      >
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={handleDecrease}
          style={{
            border: "none",
            borderRight: "1px solid #ced4da",
            borderRadius: 0,
            width: "40px",
            margin: 0,
          }}
        >
          –
        </button>
        <input
          id={id}
          type="number"
          className="form-control text-center"
          value={value}
          readOnly
          min="1"
          required
          style={{
            border: "none",
            borderRadius: 0,
            width: "82px",
            marginLeft: 0,
          }}
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={handleIncrease}
          style={{
            border: "none",
            borderLeft: "1px solid #ced4da",
            borderRadius: 0,
            width: "40px",
            margin: 0,
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default BootstrapNumberInput;
