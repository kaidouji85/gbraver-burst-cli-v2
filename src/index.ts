import select from "@inquirer/select";
import {
  Armdozers,
  NoChoice,
  Pilots,
  Player,
  PlayerCommand,
  PlayerId,
  Selectable,
  startGBraverBurst,
} from "gbraver-burst-core";
import { EOL } from "os";

/**
 * アームドーザ、パイロットを選択する
 * @param playerId 選択をするプレイヤーID
 * @returns プレイヤー情報
 */
const playerSelect = async (playerId: PlayerId): Promise<Player> => {
  const armdozer = await select({
    message: `select ${playerId} armdozer`,
    choices: Armdozers.map((a) => ({
      name: a.id,
      value: a,
    })),
  });
  const pilot = await select({
    message: `select ${playerId} pilot`,
    choices: Pilots.map((p) => ({
      name: p.id,
      value: p,
    })),
  });
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
    await playerSelect("player-01"),
    await playerSelect("player-02"),
  ]);
  console.log(EOL + "game start" + EOL);
  const initialStateHistory = core.stateHistory();
  console.dir(initialStateHistory, { depth: null });

  let lastState = initialStateHistory.at(-1);
  while (lastState && lastState.effect.name === "InputCommand") {
    const inputCommand = lastState.effect;
    const updatedStateHistory = core.progress([
      await commandSelect(inputCommand.players[0]),
      await commandSelect(inputCommand.players[1]),
    ]);
    console.dir(updatedStateHistory, { depth: null });
    lastState = updatedStateHistory.at(-1);
  }
})();
