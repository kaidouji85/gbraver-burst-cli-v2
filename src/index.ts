import select from "@inquirer/select";
import { Armdozers, Pilots, Player, PlayerId } from "gbraver-burst-core";

/** ゲームに参加するプレイヤーIDをまとめたもの */
const playerIds: [PlayerId, PlayerId] = ["player-01", "player-02"];

/** アームドーザの選択肢 */
const armdozerChoices = Armdozers.map((a) => ({
  value: a.id,
}));

/** パイロットの選択肢 */
const pilotChoices = Pilots.map((p) => ({
  value: p.id,
}));

/**
 * アームドーザ、パイロットを選択する
 * @param playerId 選択をするプレイヤーID
 * @returns プレイヤー情報
 */
const playerSelect = async (playerId: PlayerId): Promise<Player> => {
  const armdozerId = await select({
    message: `select ${playerId} armdozer`,
    choices: armdozerChoices,
  });
  const armdozer = Armdozers.find((a) => a.id === armdozerId);
  if (!armdozer) {
    throw new Error("armdozer not found");
  }

  const pilotId = await select({
    message: `select ${playerId} pilot`,
    choices: pilotChoices,
  });
  const pilot = Pilots.find((p) => p.id === pilotId);
  if (!pilot) {
    throw new Error("pilot not found");
  }

  return { playerId, armdozer, pilot };
};

/**
 * エントリポイント
 */
(async () => {
  console.log("start gbraver burst cli");

  const players: [Player, Player] = [
    await playerSelect(playerIds[0]),
    await playerSelect(playerIds[1]),
  ];
  console.log(players);
})();
