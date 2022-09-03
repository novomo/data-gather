const compare = (a, b) => {
  if (b.numOfTips < a.numOfTips) {
    return -1;
  }
  if (b.numOfTips > a.numOfTips) {
    return 1;
  }
  return 0;
};

module.exports.flatStaking = (stakeTable, platform) => {
  let stakes = [];
  let keepStakes = [];
  if (platform === "Blogabet") {
    const stakeTableRows = stakeTable.getElementsByTagName("tr");
    for (const row in stakeTableRows) {
      stakes.push({
        numOfTips: parseInt(
          stakeTableRows[row]
            .querySelectorAll('[class="sorting_1"]')[1]
            .innerHTML.trim()
        ),
        stake: parseInt(
          stakeTableRows[row]
            .querySelectorAll('[class="sorting_1"]')[0]
            .innerHTML.trim()
            .replace("/10", "")
            .split(" ")
            .splice(-1)
        ),
      });
      keepStakes.push({
        numOfTips: parseInt(
          stakeTableRows[row]
            .querySelectorAll('[class="sorting_1"]')[1]
            .innerHTML.trim()
        ),
        stake: parseInt(
          stakeTableRows[row]
            .querySelectorAll('[class="sorting_1"]')[0]
            .innerHTML.trim()
            .replace("/10", "")
            .split(" ")
            .splice(-1)
        ),
      });
    }
  }

  stakes.sort(compare);
  const highestStake = stakes[0];

  let secondHighest = stakes[1];
  stakes.shift();
  for (const s in stakes) {
    console.log(stakes[s]);

    if (
      stakes[s].numOfTips > highestStake.numOfTips * 0.3 &&
      highestStake.stake < stakes[s].stake
    ) {
      secondHighest = stakes[s];
    }
  }
  console.log(secondHighest);
  let factor;
  if (!secondHighest) {
    factor = highestStake.stake;
  }

  console.log(highestStake, secondHighest);
  if (!secondHighest) {
    factor = highestStake.stake;
  } else if (
    secondHighest.numOfTips > highestStake.numOfTips * 0.3 &&
    highestStake.stake < secondHighest.stake
  ) {
    factor = secondHighest.stake;
  } else {
    factor = highestStake.stake;
  }
  console.log(factor);

  return 1 / factor;
};
