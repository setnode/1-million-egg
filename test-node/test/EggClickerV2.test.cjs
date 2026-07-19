const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("EggClickerV2 Daily Claim", function () {
  let eggClicker, usdcToken, owner, user1, user2;
  const tapFee = ethers.parseEther("0.0000055");
  const claimFee = ethers.parseEther("0.000070");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdcToken = await MockERC20.deploy();

    const EggClickerV2 = await ethers.getContractFactory("EggClickerV2");
    eggClicker = await EggClickerV2.deploy(await usdcToken.getAddress());
  });

  it("should allow daily claim and increment streak", async function () {
    await eggClicker.connect(user1).dailyClaim({ value: claimFee });
    expect(await eggClicker.streakCount(user1.address)).to.equal(1);
    expect(await eggClicker.eggBalances(user1.address)).to.equal(10);
  });

  it("should block claiming twice in 24 hours", async function () {
    await eggClicker.connect(user1).dailyClaim({ value: claimFee });
    await expect(
      eggClicker.connect(user1).dailyClaim({ value: claimFee })
    ).to.be.revertedWith("Come back tomorrow");
  });

  it("should break streak after 48 hours", async function () {
    await eggClicker.connect(user1).dailyClaim({ value: claimFee });
    expect(await eggClicker.streakCount(user1.address)).to.equal(1);

    await time.increase(49 * 60 * 60); // 49 hours later
    
    await eggClicker.connect(user1).dailyClaim({ value: claimFee });
    
    // Streak resets to 1
    expect(await eggClicker.streakCount(user1.address)).to.equal(1);
    // Broken streak is saved
    expect(await eggClicker.brokenStreak(user1.address)).to.equal(1);
  });

  it("should allow restoring a broken streak", async function () {
    await eggClicker.connect(user1).dailyClaim({ value: claimFee });
    await time.increase(25 * 60 * 60);
    await eggClicker.connect(user1).dailyClaim({ value: claimFee });
    expect(await eggClicker.streakCount(user1.address)).to.equal(2);

    await time.increase(49 * 60 * 60); // Break it
    await eggClicker.connect(user1).dailyClaim({ value: claimFee });
    expect(await eggClicker.streakCount(user1.address)).to.equal(1);
    expect(await eggClicker.brokenStreak(user1.address)).to.equal(2);

    // Restore it
    await eggClicker.connect(user1).restoreStreak({ value: claimFee });
    expect(await eggClicker.streakCount(user1.address)).to.equal(3);
    expect(await eggClicker.brokenStreak(user1.address)).to.equal(0);
    // They get eggs for the restored day
    expect(await eggClicker.eggBalances(user1.address)).to.equal(40); // Day1(10) + Day2(10) + Day1Broken(10) + Restored(10)
  });

  it("should cycle rewards correctly up to 31 days", async function () {
    for (let i = 1; i <= 31; i++) {
      await eggClicker.connect(user1).dailyClaim({ value: claimFee });
      await time.increase(25 * 60 * 60);
    }
    
    expect(await eggClicker.streakCount(user1.address)).to.equal(31);
    
    // Calculate total eggs. 
    // Normal days: 28 * 10 = 280
    // Day 7: 20
    // Day 14: 20
    // Day 30: 30
    // Day 31: 10
    // Total = 280 + 20 + 20 + 30 + 10 = 360 eggs?
    // Wait: 31 days total. 
    // Cycle days: 7, 14, 30 are special.
    // 31 days - 3 special = 28 normal days.
    // 28 * 10 + 20 + 20 + 30 = 350.
    expect(await eggClicker.eggBalances(user1.address)).to.equal(350);
  });
});
