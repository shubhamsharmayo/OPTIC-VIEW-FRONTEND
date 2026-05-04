import React, { useContext, useEffect, useState } from "react";
import { Modal, Button, Nav, Form, Tab, Row, Col } from "react-bootstrap";

import Jobcard from "./Jobcard";
import BookletTemplateModal from "../modals/BookletModal/BookletTemplateModal";
import DuplexTemplateModal from "modals/DuplexModal/DuplexTemplateModal";
import SimplexTemplateModal from "../modals/SimplexTemplateModal";
import TemplateModal from "modals/TemplateModals";

const BookletModal = (props) => {
  const [modalShow, setModalShow] = useState(false);
  const [bookletModalShow, setBookletModalShow] = useState(false);
  const [simplexModalShow, setSimplexModalShow] = useState(false);
  const [showDuplexModal, setShowDuplexModal] = useState(false);
  const [templateType, setTemplateType] = useState(null);

  useEffect(() => {
    if (props.show) {
      setModalShow(true);
    } else {
      setModalShow(false);
    }
  }, [props.show]);

  const handleJob = (text) => {
    setTemplateType(text);
  };

  return (
    <>
      <Modal
        show={modalShow}
        onHide={props.onHide}
        size="lg"
        aria-labelledby="modal-custom-navbar"
        centered
        dialogClassName="modal-90w"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title id="modal-custom-navbar">
            Select Type Of Omr Sheets
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ overflow: "auto", alignItems: "center" }}>
          <Row
            className="g-4"
            style={{
              textAlign: "center",
              justifyContent: "center",
            }}
          >
            <Col
              xs={4}
              sm={4}
              md={4}
              className="d-md-flex justify-content-md-end gap-4"
            >
              <Jobcard handleJob={handleJob} text={"Simplex"} />
            </Col>
            <Col
              xs={4}
              sm={4}
              md={4}
              className="d-md-flex justify-content-md-start"
            >
              <Jobcard handleJob={handleJob} text={"Booklet"} />
            </Col>

            <Col
              xs={4}
              sm={4}
              md={4}
              className="d-md-flex justify-content-md-start"
            >
              <Jobcard handleJob={handleJob} text={"Duplex"} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>

      {templateType && (
        <TemplateModal
          show={templateType !== null}
          onHide={() => setTemplateType(null)}
          title={templateType}
        />
      )}
      {/* {simplexModalShow && (
        <SimplexTemplateModal
          show={simplexModalShow}
          onHide={() => setSimplexModalShow(false)}
          title={"SIMPLEX"}
        />
      )}
      {showDuplexModal && (
        <DuplexTemplateModal
          show={showDuplexModal}
          onHide={() => {
            setShowDuplexModal(false);
          }}
          title="DUPLEX"
        />
      )}

      {bookletModalShow && (
        <BookletTemplateModal
          show={bookletModalShow}
          onHide={() => setBookletModalShow(false)}
          title="BOOKLET"
        />
      )} */}
    </>
  );
};

export default BookletModal;
