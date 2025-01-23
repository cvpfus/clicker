import { expect } from "chai";
import { ethers } from "hardhat";
import { Clicker } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Clicker", function () {
  let clicker: Clicker;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const CLICK_COST = ethers.parseEther("0.1");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const Clicker = await ethers.getContractFactory("Clicker");
    clicker = await Clicker.deploy();
  });

  describe("Registration and Clicking", function () {
    it("should allow registration without referrer", async function () {
      // Register user1
      await clicker.connect(user1).register("user1", "noReferrer");

      // Verify registration
      const userData = await clicker.getUserFullData(user1.address);
      expect(userData.username).to.equal("user1");
      expect(userData.multiplier).to.equal(1);
      expect(userData.referrals).to.equal(0);
      expect(userData.clicks).to.equal(0);
    });

    it("should allow clicking after registration", async function () {
      // Register first
      await clicker.connect(user1).register("user1", "noReferrer");

      // Click once
      await clicker.connect(user1).click({ value: CLICK_COST });

      // Verify click count
      const updatedData = await clicker.getUserFullData(user1.address);
      expect(updatedData.clicks).to.equal(1);

      // Get leaderboard and verify user is in it
      const leaderboard = await clicker.getUnsortedLeaderboard();
      expect(leaderboard[0].username).to.equal("user1");
      expect(leaderboard[0].clicks).to.equal(1);
    });

    it("should distribute rewards correctly on leaderboard reset", async function () {
      // Register and click with user1
      await clicker.connect(user1).register("user1", "noReferrer");
      await clicker.connect(user1).click({ value: CLICK_COST });

      // Get contract balance before reset
      const balanceBefore = await ethers.provider.getBalance(
        await clicker.getAddress()
      );

      // Reset leaderboard
      await clicker.connect(owner).resetLeaderboard();

      // Verify rewards
      const user1Rewards = await clicker.getClaimableAmount(user1.address);
      expect(user1Rewards).to.be.gt(0);

      // Verify clicks were reset
      const userData = await clicker.getUserFullData(user1.address);
      expect(userData.clicks).to.equal(0);

      // Verify contract balance distribution
      const balanceAfter = await ethers.provider.getBalance(
        await clicker.getAddress()
      );
      expect(balanceAfter).to.be.lt(balanceBefore);
    });

    it("should not allow registration with taken username", async function () {
      await clicker.connect(user1).register("user1", "noReferrer");

      await expect(
        clicker.connect(user2).register("user1", "noReferrer")
      ).to.be.revertedWith("Username already taken");
    });

    it("should not allow clicking without registration", async function () {
      await expect(
        clicker.connect(user1).click({ value: CLICK_COST })
      ).to.be.revertedWith("User not registered");
    });

    it("should increase multiplier for both referrer and new user", async function () {
      // Register first user
      await clicker.connect(user1).register("user1", "noReferrer");

      // Register second user with first user as referrer
      await clicker.connect(user2).register("user2", "user1");

      // Check user2's data (the referred user)
      const user2Data = await clicker.getUserFullData(user2.address);
      expect(user2Data.username).to.equal("user2");
      expect(user2Data.multiplier).to.equal(2); // Base 1 + 1 for referral
      expect(user2Data.referrals).to.equal(0);

      // Check user1's data (the referrer)
      const user1Data = await clicker.getUserFullData(user1.address);
      expect(user1Data.username).to.equal("user1");
      expect(user1Data.multiplier).to.equal(2); // Base 1 + 1 for being referrer
      expect(user1Data.referrals).to.equal(1);
    });

    it("should not allow registration with non-existent referrer", async function () {
      await expect(
        clicker.connect(user1).register("user1", "nonexistent")
      ).to.be.revertedWith("Referrer not registered");
    });

    it("should not allow using 'noReferrer' as username", async function () {
      await expect(
        clicker.connect(user1).register("noReferrer", "noReferrer")
      ).to.be.revertedWith("Username cannot be 'noReferrer'");
    });

    it("should track multiple referrals correctly", async function () {
      // Register first user
      await clicker.connect(user1).register("user1", "noReferrer");

      // Get more signers for multiple referrals
      const [, , , user3, user4] = await ethers.getSigners();

      // Register multiple users with user1 as referrer
      await clicker.connect(user2).register("user2", "user1");
      await clicker.connect(user3).register("user3", "user1");
      await clicker.connect(user4).register("user4", "user1");

      // Check user1's updated referral count
      const user1Data = await clicker.getUserFullData(user1.address);
      expect(user1Data.referrals).to.equal(3);
      expect(user1Data.multiplier).to.equal(4); // Base 1 + 3 for referrals
    });
  });

  describe("Formatting Ether", function () {
    it("should format 0.01 ether correctly", async function () {
      const formatted = await clicker.formatEther(ethers.parseEther("0.01"));
      expect(formatted).to.equal("0.01");
    });

    it("should format 1.23 ether correctly", async function () {
      const formatted = await clicker.formatEther(ethers.parseEther("1.23"));
      expect(formatted).to.equal("1.23");
    });

    it("should format 10.05 ether correctly", async function () {
      const formatted = await clicker.formatEther(ethers.parseEther("10.05"));
      expect(formatted).to.equal("10.05");
    });
  });

  describe("Clicking with different fees", function () {
    beforeEach(async function () {
      // Register user1 before each test
      await clicker.connect(user1).register("user1", "noReferrer");
    });

    it("should allow clicking with exact fee", async function () {
      await clicker.connect(user1).click({ value: CLICK_COST });
      const userData = await clicker.getUserFullData(user1.address);
      expect(userData.clicks).to.equal(1);
    });

    it("should reject clicking with less than required fee", async function () {
      const lessFee = CLICK_COST - ethers.parseEther("0.01");
      await expect(
        clicker.connect(user1).click({ value: lessFee })
      ).to.be.revertedWith("You must pay 0.10 TEA to click");
    });

    it("should reject clicking with more than required fee", async function () {
      const moreFee = CLICK_COST + ethers.parseEther("0.01");
      await expect(
        clicker.connect(user1).click({ value: moreFee })
      ).to.be.revertedWith("You must pay 0.10 TEA to click");
    });

    it("should reject clicking with zero fee", async function () {
      await expect(
        clicker.connect(user1).click({ value: 0 })
      ).to.be.revertedWith("You must pay 0.10 TEA to click");
    });
  });
});
