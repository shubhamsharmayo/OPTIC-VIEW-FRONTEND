import React, { useEffect } from "react";
import {
  Route,
  Routes,
} from "react-router-dom";

import Template from "views/Template";
import DesignTemplate from "views/DesignTemplate/Designtemplate";
import Redirect from "components/Redirect";
import DuplexDesignTemplate from "views/DuplexDesignTemplate/DuplexDesignTemplate";
import Redirect2 from "components/Redirect2";

const App = () => {

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Prevent Ctrl+R or Ctrl+Shift+R
      if (
        (event.ctrlKey && event.key === "r") ||
        (event.ctrlKey && event.shiftKey && event.key === "R")
      ) {
        event.preventDefault();
        // alert("Refresh is disabled!");
      }
    };

    // Attach event listener to window
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleContextMenu = (event) => {
    event.preventDefault(); // Prevent right-click menu
  };

  return (
    <>
      <div onContextMenu={handleContextMenu}>
        <Routes>
          <Route path="/design-template" element={<DesignTemplate />} />
          <Route
            path="/duplex-design-template"
            element={<DuplexDesignTemplate />}
          />
          <Route
            path="/duplex-edit-design-template"
            element={<DuplexDesignTemplate />}
          />
          <Route path="/edit" element={<Redirect />} />
          <Route path="/edit-duplex" element={<Redirect2 />} />
          <Route path="/" element={<Template />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
