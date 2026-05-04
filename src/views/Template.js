import NormalHeader from "components/Headers/NormalHeader";
import { useEffect } from "react";
import BookletModal from "ui/BookletModal";

const Template = () => {
  useEffect(() => {
    sessionStorage.clear();
    localStorage.clear();
  }, []);

  return (
    <>
      <NormalHeader />
      <BookletModal show={true} />
    </>
  );
};

export default Template;
