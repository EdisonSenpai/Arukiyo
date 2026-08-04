export const PROGRESSION_RULES = {
  distanceXpUnitMeters: 50,
  xpPerDistanceUnit: 1,
  xpPerNewCell: 10,
  completedSessionXp: 5,
  firstSessionOfDayXp: 25,
  oneKilometerOfDayXp: 50,

  distanceCoinUnitMeters: 250,
  coinsPerDistanceUnit: 1,
  coinsPerNewCell: 2,
  completedSessionCoins: 1,
  firstSessionOfDayCoins: 5,
  oneKilometerOfDayCoins: 10,

  meaningfulSessionMeters: 50,
  oneKilometerMeters: 1_000,
} as const;

export const LEVEL_RULES = {
  firstLevelXp: 100,
  additionalXpPerLevel: 75,
} as const;
