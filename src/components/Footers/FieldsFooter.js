import React, { useEffect, useState } from "react";
// import 'bootstrap/dist/css/bootstrap.min.css';
import "./FieldsFooter.css"; // custom styles

const FieldsFooter = (props) => {
  const [fields, setFields] = useState([]);
  //    const dataCtx = useContext(DataContext);
  useEffect(() => {
    if (Array.isArray(props.selected)) {
      setFields(props.selected);
    }
  }, [props.selected]);
  const handleFieldClick = (item, index) => {
    console.log(item, index);
    props.handleEyeClick(item, index);
  };

  const allFields = fields.map((item, index) => {
    let fieldClass = "";

    switch (item.fieldType) {
      case "formField":
        fieldClass = "formfield";
        break;
      case "questionField":
        fieldClass = "questionfield";
        break;
      case "skewField":
        fieldClass = "skewfield";
        break;
      default:
        fieldClass = "";
    }

    return (
      <div
        key={index}
        className={`footer-box text-center mx-2 my-2 ${fieldClass}`}
        onClick={() => handleFieldClick(item, index)}
      >
        {item.name}
      </div>
    );
  });

  return (
    <footer className="footer mt-auto py-2 bg-light overflow-auto">
      <div className="d-flex justify-content-start flex-nowrap px-3">
        {allFields && allFields.length > 0 ? (
          allFields
        ) : (
          <span>No fields selected</span>
        )}
      </div>
    </footer>
  );
};

export default FieldsFooter;
