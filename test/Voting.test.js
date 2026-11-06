const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("Voting Contract", function () {
  async function deployVotingFixture() {
    const [admin, voter1, voter2, voter3, nonAdmin] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();
    await voting.waitForDeployment();

    return { voting, admin, voter1, voter2, voter3, nonAdmin };
  }

  describe("Deployment", function () {
    it("Should set the deployer as admin", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      expect(await voting.admin()).to.equal(admin.address);
    });

    it("Should initialize election state as NotStarted", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      expect(await voting.electionState()).to.equal(0n);
      expect(await voting.getElectionState()).to.equal(0n);
    });

    it("Should initialize candidate count as zero", async function () {
      const { voting } = await loadFixture(deployVotingFixture);
      expect(await voting.candidateCount()).to.equal(0n);
    });
  });

  describe("Adding Candidates", function () {
    it("Should allow admin to add a candidate", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");

      expect(await voting.candidateCount()).to.equal(1n);
      const candidate = await voting.getCandidate(1);
      expect(candidate.id).to.equal(1n);
      expect(candidate.name).to.equal("Alice");
      expect(candidate.voteCount).to.equal(0n);
    });

    it("Should emit CandidateAdded event", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      await expect(voting.connect(admin).addCandidate("Alice"))
        .to.emit(voting, "CandidateAdded")
        .withArgs(1n, "Alice");
    });

    it("Should not allow non-admin to add candidate", async function () {
      const { voting, nonAdmin } = await loadFixture(deployVotingFixture);
      await expect(
        voting.connect(nonAdmin).addCandidate("Alice")
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should not allow empty candidate name", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      await expect(
        voting.connect(admin).addCandidate("")
      ).to.be.revertedWith("Candidate name cannot be empty");
    });

    it("Should not allow adding candidates after election starts", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).startElection();

      await expect(
        voting.connect(admin).addCandidate("Bob")
      ).to.be.revertedWith("Invalid election state for this action");
    });
  });

  describe("Registering Voters", function () {
    it("Should allow admin to register a voter", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).registerVoter(voter1.address);

      expect(await voting.isVoterRegistered(voter1.address)).to.be.true;
      expect(await voting.registeredVoters(voter1.address)).to.be.true;
    });

    it("Should emit VoterRegistered event", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployVotingFixture);
      await expect(voting.connect(admin).registerVoter(voter1.address))
        .to.emit(voting, "VoterRegistered")
        .withArgs(voter1.address);
    });

    it("Should not allow non-admin to register voter", async function () {
      const { voting, nonAdmin, voter1 } = await loadFixture(deployVotingFixture);
      await expect(
        voting.connect(nonAdmin).registerVoter(voter1.address)
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should not allow registering same voter twice", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).registerVoter(voter1.address);

      await expect(
        voting.connect(admin).registerVoter(voter1.address)
      ).to.be.revertedWith("Voter is already registered");
    });

    it("Should not allow registering zero address", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      await expect(
        voting.connect(admin).registerVoter(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid voter address");
    });

    it("Should not allow registering voters after election starts", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).startElection();

      await expect(
        voting.connect(admin).registerVoter(voter1.address)
      ).to.be.revertedWith("Invalid election state for this action");
    });
  });

  describe("Starting Election", function () {
    it("Should allow admin to start election with candidates", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).startElection();

      expect(await voting.electionState()).to.equal(1n);
      expect(await voting.getElectionState()).to.equal(1n);
    });

    it("Should emit ElectionStarted event", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");

      await expect(voting.connect(admin).startElection())
        .to.emit(voting, "ElectionStarted");
    });

    it("Should not allow non-admin to start election", async function () {
      const { voting, admin, nonAdmin } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");

      await expect(
        voting.connect(nonAdmin).startElection()
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should not allow starting without candidates", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      await expect(
        voting.connect(admin).startElection()
      ).to.be.revertedWith("Add at least one candidate before starting");
    });

    it("Should not allow starting an already started election", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).startElection();

      await expect(
        voting.connect(admin).startElection()
      ).to.be.revertedWith("Invalid election state for this action");
    });
  });

  describe("Voting", function () {
    it("Should allow registered voter to vote", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).registerVoter(voter1.address);
      await voting.connect(admin).startElection();

      await voting.connect(voter1).vote(1);

      expect(await voting.hasVoterVoted(voter1.address)).to.be.true;
      expect(await voting.hasVoted(voter1.address)).to.be.true;
      const candidate = await voting.getCandidate(1);
      expect(candidate.voteCount).to.equal(1n);
      expect(await voting.totalVotes()).to.equal(1n);
    });

    it("Should emit VoteCast event", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).registerVoter(voter1.address);
      await voting.connect(admin).startElection();

      await expect(voting.connect(voter1).vote(1))
        .to.emit(voting, "VoteCast")
        .withArgs(voter1.address, 1n);
    });

    it("Should not allow unregistered voter to vote", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).startElection();

      await expect(
        voting.connect(voter1).vote(1)
      ).to.be.revertedWith("You are not a registered voter");
    });

    it("Should not allow voting twice", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).registerVoter(voter1.address);
      await voting.connect(admin).startElection();

      await voting.connect(voter1).vote(1);
      await expect(
        voting.connect(voter1).vote(1)
      ).to.be.revertedWith("You have already voted");
    });

    it("Should not allow voting for invalid candidate ID (0)", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).registerVoter(voter1.address);
      await voting.connect(admin).startElection();

      await expect(
        voting.connect(voter1).vote(0)
      ).to.be.revertedWith("Invalid candidate ID");
    });

    it("Should not allow voting for invalid candidate ID (too high)", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).registerVoter(voter1.address);
      await voting.connect(admin).startElection();

      await expect(
        voting.connect(voter1).vote(99)
      ).to.be.revertedWith("Invalid candidate ID");
    });

    it("Should not allow voting before election starts", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).registerVoter(voter1.address);

      await expect(
        voting.connect(voter1).vote(1)
      ).to.be.revertedWith("Invalid election state for this action");
    });

    it("Should not allow voting after election ends", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).registerVoter(voter1.address);
      await voting.connect(admin).startElection();
      await voting.connect(admin).endElection();

      await expect(
        voting.connect(voter1).vote(1)
      ).to.be.revertedWith("Invalid election state for this action");
    });

    it("Should correctly count total votes", async function () {
      const { voting, admin, voter1, voter2, voter3 } = await loadFixture(
        deployVotingFixture
      );
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).addCandidate("Bob");
      await voting.connect(admin).registerVoter(voter1.address);
      await voting.connect(admin).registerVoter(voter2.address);
      await voting.connect(admin).registerVoter(voter3.address);
      await voting.connect(admin).startElection();

      await voting.connect(voter1).vote(1);
      await voting.connect(voter2).vote(2);
      await voting.connect(voter3).vote(1);

      expect(await voting.totalVotes()).to.equal(3n);
      const c1 = await voting.getCandidate(1);
      const c2 = await voting.getCandidate(2);
      expect(c1.voteCount).to.equal(2n);
      expect(c2.voteCount).to.equal(1n);
    });
  });

  describe("Ending Election", function () {
    it("Should allow admin to end election", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).startElection();
      await voting.connect(admin).endElection();

      expect(await voting.electionState()).to.equal(2n);
      expect(await voting.getElectionState()).to.equal(2n);
    });

    it("Should emit ElectionEnded event", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).startElection();

      await expect(voting.connect(admin).endElection())
        .to.emit(voting, "ElectionEnded");
    });

    it("Should not allow non-admin to end election", async function () {
      const { voting, admin, nonAdmin } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).startElection();

      await expect(
        voting.connect(nonAdmin).endElection()
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("Should not allow ending election that has not started", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      await expect(
        voting.connect(admin).endElection()
      ).to.be.revertedWith("Invalid election state for this action");
    });

    it("Should not allow restarting ended election", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).startElection();
      await voting.connect(admin).endElection();

      await expect(
        voting.connect(admin).startElection()
      ).to.be.revertedWith("Invalid election state for this action");
    });
  });

  describe("Results", function () {
    it("Should return correct winner", async function () {
      const { voting, admin, voter1, voter2, voter3 } = await loadFixture(
        deployVotingFixture
      );
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).addCandidate("Bob");
      await voting.connect(admin).registerVoter(voter1.address);
      await voting.connect(admin).registerVoter(voter2.address);
      await voting.connect(admin).registerVoter(voter3.address);
      await voting.connect(admin).startElection();

      await voting.connect(voter1).vote(1);
      await voting.connect(voter2).vote(1);
      await voting.connect(voter3).vote(2);
      await voting.connect(admin).endElection();

      const [winnerName, winnerVoteCount, isTie] = await voting.getWinner();
      expect(winnerName).to.equal("Alice");
      expect(winnerVoteCount).to.equal(2n);
      expect(isTie).to.be.false;
    });

    it("Should detect a tie", async function () {
      const { voting, admin, voter1, voter2 } = await loadFixture(
        deployVotingFixture
      );
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).addCandidate("Bob");
      await voting.connect(admin).registerVoter(voter1.address);
      await voting.connect(admin).registerVoter(voter2.address);
      await voting.connect(admin).startElection();

      await voting.connect(voter1).vote(1);
      await voting.connect(voter2).vote(2);
      await voting.connect(admin).endElection();

      const [winnerName, winnerVoteCount, isTie] = await voting.getWinner();
      expect(winnerVoteCount).to.equal(1n);
      expect(isTie).to.be.true;
    });

    it("Should not allow getting winner before election ends", async function () {
      const { voting, admin } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");

      await expect(voting.getWinner()).to.be.revertedWith(
        "Election has not ended yet"
      );
    });

    it("Should return all candidates with correct vote counts", async function () {
      const { voting, admin, voter1 } = await loadFixture(deployVotingFixture);
      await voting.connect(admin).addCandidate("Alice");
      await voting.connect(admin).addCandidate("Bob");
      await voting.connect(admin).registerVoter(voter1.address);
      await voting.connect(admin).startElection();

      await voting.connect(voter1).vote(1);

      const allCandidates = await voting.getAllCandidates();
      expect(allCandidates.length).to.equal(2);
      expect(allCandidates[0].id).to.equal(1n);
      expect(allCandidates[0].name).to.equal("Alice");
      expect(allCandidates[0].voteCount).to.equal(1n);

      expect(allCandidates[1].id).to.equal(2n);
      expect(allCandidates[1].name).to.equal("Bob");
      expect(allCandidates[1].voteCount).to.equal(0n);
    });
  });
});
