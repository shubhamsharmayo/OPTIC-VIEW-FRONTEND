/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// reactstrap components
import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";

const SmallHeader = (props) => {
  return (
    <>
      <div
        className="header pb-4 pt-4 pt-md-5"
        style={{
          background: "linear-gradient(90deg, #000000, #434343)",


          // background : "linear-gradient(to right, #F2FBFC, #ffffff);"
        }}
      >
        <Container fluid>
          <div className="header-body">{/* Card stats */}</div>
        </Container>
      </div>
    </>
  );
};

export default SmallHeader;
