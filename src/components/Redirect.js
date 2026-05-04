import TextLoader from "loaders/TextLoader";
import EditDesignTemplate from "views/EditDesignTemplate/EditDesignTemplate";
import React, { useEffect, useState, useLayoutEffect } from "react";
import EditDuplexDesignTemplate from "views/EditDuplexDesignTemplate/EditDuplexDesignTemplate";

const Redirect = () => {
  const [showApp, setShowApp] = useState(false);
  const [duplexType, setDuplexType] = useState(false);

  useEffect(() => {
    // Simulate a 2-second loading delay
    const timer = setTimeout(() => {
      setShowApp(true);
    }, 1500);

    return () => clearTimeout(timer); // Cleanup timeout
  }, []);

  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      const localData = sessionStorage.getItem("Template");
      // console.log(localData);
      if (localData) {
        const parsedData = JSON.parse(localData);
        console.log(parsedData);
        if (Array.isArray(parsedData)) {
          // setTemplateType(parsedData.type);
          const templateType = parsedData[0].layoutParameters?.templateType;
          // console.log(templateType);
          if (templateType) {
            setDuplexType(templateType === "DUPLEX");
          }
        }
      }
    }, 1200);

    return () => clearTimeout(timer); // Cleanup timeout
  }, []);
  
  return (
    <>
      {!showApp ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            pointerEvents: "auto", // Make the overlay not clickable
          }}
        >
          <TextLoader message={"Loading Tempate , Please wait..."} />
        </div>
      ) : duplexType ? (
        <EditDuplexDesignTemplate />
      ) : (
        <EditDesignTemplate />
      )}
    </>
  );
};

export default Redirect;
