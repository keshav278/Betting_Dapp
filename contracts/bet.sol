//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract bet {
    // uint256 constant minimumbet = 0.004;
    uint256 constant minimumBet = 4000000000000000;

    struct Bet {
        uint256 matchId;
        address player;
        uint256 amount;
        uint256 prediction;
        uint256 bet_time;
    }

    struct MatchBet {
        uint256 matchId;
        uint256 totalCount;
        uint256 total_amount;
        uint256 total_team1_win;
        uint256 total_team1_amount;
        uint256 total_team2_win;
        uint256 total_team2_amount;
        uint256 total_tie;
        uint256 total_tie_amount;
        mapping(address => Bet) bets;
        mapping(address => bool) players;
    }

    // keeping track of price distribution
    mapping(uint256 => mapping(address => bool)) availedPrice;
    mapping(address => bool) availedList;
    // address [] availedList;

    // storing all match bet detials
    mapping(uint256 => MatchBet) allBets;
    mapping(uint256 => bool) startedBet;
    uint256 total_games = 0;

    matches game = new matches();

    // checks if player had already bet on given match
    function alreadyBet(uint256 matchId, address user)
        public
        view
        returns (bool)
    {
        return allBets[matchId].players[user];
    }

    function betOnMatch(uint256 matchId,uint256 amount,uint256 prediction,uint256 timestamp) public payable {
        require(!allBets[matchId].players[msg.sender],"you have alredy placed a bet on this match");
        require(amount==msg.value,"Error From Backend");
        require(amount >= minimumBet,"Please send atleast minimum amount to bet"); // ether in wei
        allBets[matchId].players[msg.sender]=true;
        Bet memory bet1 = Bet(matchId,msg.sender,amount,prediction,timestamp);

        // first bet on a match
        if (!startedBet[matchId]) {
            startedBet[matchId] = true;
            total_games++;

            MatchBet storage match1 = allBets[matchId];

            match1.matchId = matchId;
            match1.totalCount = 1;
            match1.bets[msg.sender] = bet1;
            match1.players[msg.sender] = true;
            match1.total_amount = amount;

            if (prediction == 1) {
                match1.total_team1_win = 1;
                match1.total_team1_amount = amount;
                match1.total_team2_win = 0;
                match1.total_team2_amount = 0;
                match1.total_tie = 0;
                match1.total_tie_amount = 0;
            } else if (prediction == 2) {
                match1.total_team1_win = 0;
                match1.total_team1_amount = 0;
                match1.total_team2_win = 1;
                match1.total_team2_amount = amount;
                match1.total_tie = 0;
                match1.total_tie_amount = 0;
            } else if (prediction == 0) {
                match1.total_team1_win = 0;
                match1.total_team1_amount = 0;
                match1.total_team2_win = 0;
                match1.total_team2_amount = 0;
                match1.total_tie = 1;
                match1.total_tie_amount = amount;
            }
        } else {
            MatchBet storage match2;
            match2 = allBets[matchId];

            if (matchId == match2.matchId) {
                match2.totalCount += 1;
                match2.bets[msg.sender] = bet1;
                match2.players[msg.sender] = true;
                match2.total_amount += amount;

                if (prediction == 1) {
                    match2.total_team1_win += 1;
                    match2.total_team1_amount += amount;
                } else if (prediction == 2) {
                    match2.total_team2_win += 1;
                    match2.total_team2_amount += amount;
                } else if (prediction == 0) {
                    match2.total_tie += 1;
                    match2.total_tie_amount += amount;
                }
            }
        }
    }

    // rerturns a particular bet details
    function getBetDetails(uint256 matchId, address user)
        public
        view
        returns (Bet memory)
    {
        Bet memory userBet = allBets[matchId].bets[user];

        return userBet;
    }

    // function exists(address [] memory list, address user) public view returns(bool){
    //     for(uint i; i<=list.length; i++){
    //         if(list[i] == user){
    //             return true;
    //         }
    //     }
    //     return false;

    function availPrice(uint256 matchId) public payable {
        require(
            allBets[matchId].players[msg.sender],
            "you have not placed a bet on this match"
        );
        require(
            allBets[matchId].bets[msg.sender].prediction ==
                game.getResults(matchId),
            "you lost your money"
        );

        require(
            !availedPrice[matchId][msg.sender],
            "you have already availed price for this match"
        );

        Bet memory userBet = getBetDetails(matchId, msg.sender);
        MatchBet storage m = allBets[matchId];
        uint256 price;

        if (userBet.prediction == 1&& userBet.prediction == game.getResults(matchId)) {
            price = (((userBet.amount*1000000000000000000) / m.total_team1_amount) * m.total_amount)/(1 ether);
        } else if ((userBet.prediction) == 2 && userBet.prediction == game.getResults(matchId)) {
            price = (((userBet.amount*1000000000000000000) / m.total_team2_amount) * m.total_amount)/(1 ether);
        } else if (userBet.prediction == 0 && userBet.prediction == game.getResults(matchId)) {
            price = (((userBet.amount*1000000000000000000) / m.total_tie_amount) * m.total_amount)/(1 ether);
        }
        availedPrice[matchId][msg.sender]=true;
        sendPrice(payable(msg.sender), price);
    }
    function sendPrice(address payable user, uint256 price) public payable {
        user.transfer(price);
    }

    // function getBets(uint256 matchId) public view returns(mapping(address => Bet) memory){
    //     return allBets[matchId].bets;
    // }

    // function getMatchDetail(uint256 matchId) public view {
    //     return allBets[matchId];
    // }
}

contract matches {
    uint256[] public matchIds;

    struct Team {
        uint256 teamId;
        string name;
    }
    struct A_match {
        uint256 matchId;
        string matchDesc;
        string matchFormat;
        uint256 startDate;
        uint256 endDate;
        Team team1;
        Team team2;
    }

    struct Res {
        uint256 matchId;
        uint256 result;
    }

    mapping(uint256 => A_match) public schedule;
    mapping(uint256 => uint256) public results;

    constructor() {
        Team memory team1 = Team(185, "India");
        Team memory team2 = Team(556, "Pakistan");
        Team memory team3 = Team(231, "Australia");
        Team memory team4 = Team(512, "England");
        Team memory team5 = Team(333, "SouthAfrica");
        Team memory team6 = Team(725, "NewZealand");
        Team memory team7 = Team(222, "Bangladesh");
        Team memory team8 = Team(111, "SriLanka");
        A_match memory match1 = A_match(
            1,
            "1st T20I",
            "T20",
            1666537200000,
            1666548000000,
            team1,
            team2
        );

        // match 2 details
        A_match memory match2 = A_match(
            2,
            "2nd T20I",
            "T20",
            1666537200000,
            1666548000000,
            team3,
            team4
        );
        A_match memory match3 = A_match(
            3,
            "3rd T20I",
            "T20",
            1666537200000,
            1666548000000,
            team5,
            team6
        );
        A_match memory match4 = A_match(
            4,
            "4th T20I",
            "T20",
            1666537200000,
            1666548000000,
            team7,
            team8
        );

        schedule[1] = match1;
        schedule[2] = match2;
        schedule[3] = match3;
        schedule[4] = match4;
        
        results[1] = 1;
        results[2] = 2;
        results[3] = 1;
        results[4] = 2;

        matchIds.push(1);
        matchIds.push(2);
        matchIds.push(3);
        matchIds.push(4);
    }

    function getMatchIds() external view returns (uint256[] memory) {
        return matchIds;
    }

    function getMatch(uint256 _id) external view returns (A_match memory) {
        return schedule[_id];
    }

    function getResults(uint256 _id) external view returns (uint256) {
        return results[_id];
    }
}
