// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Voting
 * @dev Blockchain-Based College Voting System smart contract
 */
contract Voting {
    enum ElectionState {
        NotStarted,
        Ongoing,
        Ended
    }

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    address public admin;
    ElectionState public electionState;
    mapping(uint256 => Candidate) public candidates;
    uint256 public candidateCount;
    mapping(address => bool) public registeredVoters;
    mapping(address => bool) public hasVoted;
    uint256 public totalVotes;

    event CandidateAdded(uint256 indexed id, string name);
    event VoterRegistered(address indexed voter);
    event VoteCast(address indexed voter, uint256 indexed candidateId);
    event ElectionStarted();
    event ElectionEnded();

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier inState(ElectionState _state) {
        require(electionState == _state, "Invalid election state for this action");
        _;
    }

    constructor() {
        admin = msg.sender;
        electionState = ElectionState.NotStarted;
    }

    /**
     * @notice Add a new candidate to the election
     * @param _name Name of the candidate
     */
    function addCandidate(string memory _name) external onlyAdmin inState(ElectionState.NotStarted) {
        require(bytes(_name).length > 0, "Candidate name cannot be empty");
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
        emit CandidateAdded(candidateCount, _name);
    }

    /**
     * @notice Register an eligible voter
     * @param _voter Address of the voter to register
     */
    function registerVoter(address _voter) external onlyAdmin inState(ElectionState.NotStarted) {
        require(_voter != address(0), "Invalid voter address");
        require(!registeredVoters[_voter], "Voter is already registered");
        registeredVoters[_voter] = true;
        emit VoterRegistered(_voter);
    }

    /**
     * @notice Start the election
     */
    function startElection() external onlyAdmin inState(ElectionState.NotStarted) {
        require(candidateCount > 0, "Add at least one candidate before starting");
        electionState = ElectionState.Ongoing;
        emit ElectionStarted();
    }

    /**
     * @notice End the election
     */
    function endElection() external onlyAdmin inState(ElectionState.Ongoing) {
        electionState = ElectionState.Ended;
        emit ElectionEnded();
    }

    /**
     * @notice Cast a vote for a candidate
     * @param _candidateId ID of the candidate to vote for
     */
    function vote(uint256 _candidateId) external inState(ElectionState.Ongoing) {
        require(registeredVoters[msg.sender], "You are not a registered voter");
        require(!hasVoted[msg.sender], "You have already voted");
        require(_candidateId >= 1 && _candidateId <= candidateCount, "Invalid candidate ID");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        totalVotes++;
        emit VoteCast(msg.sender, _candidateId);
    }

    /**
     * @notice Get candidate details by ID
     * @param _candidateId ID of the candidate
     */
    function getCandidate(uint256 _candidateId)
        external
        view
        returns (uint256 id, string memory name, uint256 voteCount)
    {
        require(_candidateId >= 1 && _candidateId <= candidateCount, "Invalid candidate ID");
        Candidate storage c = candidates[_candidateId];
        return (c.id, c.name, c.voteCount);
    }

    /**
     * @notice Get all candidates
     */
    function getAllCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidateCount);
        for (uint256 i = 1; i <= candidateCount; i++) {
            allCandidates[i - 1] = candidates[i];
        }
        return allCandidates;
    }

    /**
     * @notice Get current election state
     */
    function getElectionState() external view returns (ElectionState) {
        return electionState;
    }

    /**
     * @notice Check if a voter is registered
     * @param _voter Address of the voter
     */
    function isVoterRegistered(address _voter) external view returns (bool) {
        return registeredVoters[_voter];
    }

    /**
     * @notice Check if a voter has voted
     * @param _voter Address of the voter
     */
    function hasVoterVoted(address _voter) external view returns (bool) {
        return hasVoted[_voter];
    }

    /**
     * @notice Get election winner after election ends
     */
    function getWinner()
        external
        view
        returns (string memory winnerName, uint256 winnerVoteCount, bool isTie)
    {
        require(electionState == ElectionState.Ended, "Election has not ended yet");
        require(candidateCount > 0, "No candidates in the election");

        uint256 maxVotes = candidates[1].voteCount;
        uint256 winnerId = 1;
        bool tie = false;

        for (uint256 i = 2; i <= candidateCount; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerId = i;
                tie = false;
            } else if (candidates[i].voteCount == maxVotes) {
                tie = true;
            }
        }

        return (candidates[winnerId].name, maxVotes, tie);
    }
}
