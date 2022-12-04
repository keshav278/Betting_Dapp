import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Metamask from "../assets/Metamask.png";
import Alert from "react-bootstrap/Alert";
import "../styles/Header.css";
import React from "react";

const Header = ({ active, account, connect, disconnect }) => {
  return (
    <Navbar bg="primary" variant="dark">
      <Container>
        <Navbar.Brand><div className="title">Bet N Bowl</div></Navbar.Brand>
        <div
          onClick={active ? disconnect : connect}
          className="metamask-wrapper"
        >
          {active ? (
            <Alert variant="success">Connected to {account}</Alert>
          ) : (
            <Alert variant="warning">Connect to Metamask {">"}</Alert>
          )}
          <img src={Metamask} alt="Metamask" height={48} loading="lazy" />
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
