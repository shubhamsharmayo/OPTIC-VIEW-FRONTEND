import TextLoader from "loaders/TextLoader";
import EditDesignTemplate from "views/EditDesignTemplate/EditDesignTemplate";
import React, { useEffect, useState, useLayoutEffect } from "react";
import EditDuplexDesignTemplate from "views/EditDuplexDesignTemplate/EditDuplexDesignTemplate";

const Redirect2 = () => {
  const [showApp, setShowApp] = useState(false);
  // const [duplexType, setDuplexType] = useState(true);

  useEffect(() => {
    // Simulate a 2-second loading delay
    const timer = setTimeout(() => {
      setShowApp(true);
    }, 1500);

    return () => clearTimeout(timer); // Cleanup timeout
  }, []);

  // useLayoutEffect(() => {
  //   const timer = setTimeout(() => {
  //     const localData = sessionStorage.getItem("Template");
  //     if (localData) {
  //       const parsedData = JSON.parse(localData);
  //       // setTemplateType(parsedData.type);
  //       const templateType = parsedData.layoutParameters?.templateType;
  //       console.log(templateType);
  //       // if (templateType) {
  //       //   setDuplexType(templateType === "DUPLEX");
  //       // }
  //     }
  //   }, 1000);

  //   return () => clearTimeout(timer); // Cleanup timeout
  // }, []);
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
      ) : (
        <EditDuplexDesignTemplate />
      )}
    </>
  );
};

export default Redirect2;
