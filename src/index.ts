import select from "@inquirer/select";
import {
  Armdozers,
  GameState,
  NoChoice,
  Pilots,
  Player,
  PlayerCommand,
  PlayerId,
  Selectable,
  startGBraverBurst,
} from "gbraver-burst-core";
import { EOL } from "os";

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
 * コマンド選択
 * @param option コマンド選択情報 
 * @returns 選択したコマンド
 */
const commandSelect = async (
  option: Selectable | NoChoice,
): Promise<PlayerCommand> => {
  const { playerId } = option;
  if (!option.selectable) {
    const { nextTurnCommand } = option;
    return { playerId, command: nextTurnCommand };
  }

  const { command } = option;
  const selectedCommand = await select({
    message: `select ${playerId} command`,
    choices: command.map((c) => ({
      value: c,
      name: JSON.stringify(c),
    })),
  });
  return { playerId, command: selectedCommand };
};

/**
 * エントリポイント
 */
(async () => {
  console.log("start gbraver burst cli" + EOL);

  const core = startGBraverBurst([
    await playerSelect(playerIds[0]),
    await playerSelect(playerIds[1]),
  ]);
  console.log(EOL + "game start" + EOL);
  const initialStateHistory = core.stateHistory()
  console.dir(initialStateHistory, { depth: null });

  let lastState = initialStateHistory.at(-1);
  while (lastState && lastState.effect.name === "InputCommand") {
    const inputCommand = lastState.effect;
    const updatedStateHistory = core.progress([
      await commandSelect(inputCommand.players[0]), await commandSelect(inputCommand.players[1])
    ]);
    console.dir(updatedStateHistory, { depth: null });
    lastState = updatedStateHistory.at(-1);
  }
})();
