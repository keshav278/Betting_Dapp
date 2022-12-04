import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Alert from "react-bootstrap/Alert";
import { useState, useEffect } from "react";
import { placeBet, checkBet, availResults, getResults } from "../contractApi";
import "../styles/Bet.css";
import React from "react";

const Bet = ({ match, account, active }) => {
  const [alreadyPlaced, setAlreadyPlaced] = useState(false);
  const [amount, setAmount] = useState();
  const [choice, setChoice] = useState(-1);
  const [matchStatus, setMatchStatus] = useState();
  const [viewRes, setViewRes] = useState(false);
  const [result, setResult] = useState({ status: null, message: "" });
  const [winningRes, setWinningRes] = useState(NaN);

  //   to update match status acc to date
  useEffect(() => {
    let x = setInterval(() => {
      let now = Math.floor(new Date().getTime());
      if (now < parseInt(match.startDate)) {
        setMatchStatus(1);
      } else if (now < parseInt(match.endDate)) {
        setMatchStatus(0);
      } else {
        setMatchStatus(-1);
      }
    }, 1000);
  }, [match.startDate, match.endDate]);

  //   get list of match ids
  useEffect(() => {
    if (typeof account === "undefined") {
      setAlreadyPlaced(false);
      return;
    }
    checkBet(match.matchId, account)
      .then((res) => {
        // console.log(res);
        setAlreadyPlaced(res);
      })
      .catch((err) => console.log(err));
  }, [account, match.matchId]);

  //   handler for prediction
  const handleChoice = (_choice) => {
    setChoice(_choice);
  };

  //   handler for bet amount
  const handleChange = (e) => {
    setAmount(e.target.value);
  };

  //   handles and validates form before submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof account === "undefined") {
      alert("Please Connect to Metamask");
    } else if (amount < 0.004) {
      alert("Minimum Bet Amount should be 0.004ETH");
    } else if (choice === -1) {
      alert("Please select a result");
    } else {
      const timestamp = new Date().getTime();
      placeBet(match.matchId, amount, choice, account, timestamp)
        .then((res) => {
          console.log(res);
          console.log(choice);
          checkBet(match.matchId, account)
            .then((res) => {
              console.log(res);
              setAlreadyPlaced(res);
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    }
  };

  const handleAwail = () => {
    setViewRes(true);
    getResults(match.matchId)
      .then((res) => {
        console.log(res);
        setWinningRes(parseInt(res));
      })
      .catch((err) => console.log(err));
    availResults(match.matchId, account)
      .then((res) => {
        console.log(res);
        setResult({ status: true, message: "You won!" });
      })
      .catch((err) => {
        console.log(err);
        setResult({ status: false, message: "You lost the bet!" });
      });
  };

  useEffect(() => {
    setResult({ status: null, message: "" });
    setViewRes(false);
  }, [account]);

  return (
    <div className="betInterface">
      {viewRes ? (
        <div className="resultViewWrapper">
          <Alert variant="success">
            Result:{" "}
            {winningRes === 1
              ? `${match.team1.name} Won!`
              : winningRes === 2
              ? `${match.team2.name} Won!`
              : "It was a draw"}
          </Alert>
          <Alert variant={result.status ? "success" : "danger"}>
            {result.message}
          </Alert>
        </div>
      ) : !active ? (
        <Alert variant="warning">Connect to Metamask</Alert>
      ) : alreadyPlaced ? (
        <div className="alertWrapper">
          <Alert variant="success">You have already placed a bet!</Alert>
          {matchStatus === -1 ? (
            <Button variant="success" onClick={handleAwail}>
              Avail Results!
            </Button>
          ) : (
            <Button variant="success" disabled>
              Come back Later!
            </Button>
          )}
        </div>
      ) : (
        //   ) : matchStatus === -1 ? (
        //     <Alert variant="danger">You can no longer bet</Alert>
        <Form onSubmit={handleSubmit} className="betForm">
          <Form.Label>Enter Bet Amount:</Form.Label>
          <InputGroup>
            <InputGroup.Text id="betAmountText">ETH</InputGroup.Text>
            <Form.Control
              aria-label="betAmount"
              aria-describedby="betAmountText"
              placeholder="Enter your bet amount"
              value={amount}
              onChange={handleChange}
            />
          </InputGroup>
          <Form.Text>Minimum bet: 0.004ETH</Form.Text>
          <Form.Group>
            <Form.Label>Choose Result:</Form.Label>
            <div className="resultWrapper">
              <Button
                className="resultSelect"
                variant="primary"
                active={choice === 1}
                onClick={() => handleChoice(1)}
              >
                {match.team1.name}
              </Button>
              <Button
                className="resultSelect"
                variant="primary"
                active={choice === 0}
                onClick={() => handleChoice(0)}
              >
                Draw
              </Button>
              <Button
                className="resultSelect"
                variant="primary"
                active={choice === 2}
                onClick={() => handleChoice(2)}
              >
                {match.team2.name}
              </Button>
            </div>
          </Form.Group>
          <div className="placeBtnWrapper">
            <Button variant="success" type="submit" className="placeBetBtn">
              Place a Bet!
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default Bet;
