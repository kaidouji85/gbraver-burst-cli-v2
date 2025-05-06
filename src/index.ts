import select from "@inquirer/select";
import {
  Armdozers,
  GameState,
  NoChoice,
  Pilots,
  Player,
  PlayerCommand,
  PlayerId,
  PlayerState,
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
    choices: Armdozers.map((a) => ({ name: a.id, value: a })),
  });
  const pilot = await select({
    message: `select ${playerId} pilot`,
    choices: Pilots.map((p) => ({ name: p.id, value: p })),
  });
  return { playerId, armdozer, pilot };
};

/**
 * 最新ステートからバトルサマリーを標準出力に出力する
 * @param lastState 最新ステート
 */
const battleSummary = (lastState: GameState) => {
  const players = Array.from(lastState.players).sort((a, b) =>
    a.playerId.localeCompare(b.playerId),
  );
  players.forEach((player) => {
    const prefix = player.playerId === lastState.activePlayerId ? "★" : " ";
    const name = `${player.armdozer.name}(${player.playerId})`.padEnd(25);
    console.log(
      `${prefix} ${name} HP: ${player.armdozer.hp} Battery: ${player.armdozer.battery}`,
    );
  });
};

/**
 * コマンド選択
 * @param option コマンド選択情報
 * @param player プレイヤー情報
 * @returns 選択したコマンド
 */
const commandSelect = async (
  option: Selectable | NoChoice,
  player: PlayerState,
): Promise<PlayerCommand> => {
  const { playerId } = option;
  if (!option.selectable) {
    const { nextTurnCommand } = option;
    return { playerId, command: nextTurnCommand };
  }

  const { command } = option;
  const selectedCommand = await select({
    message: `select ${player.armdozer.name}(${playerId}) command`,
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
    battleSummary(lastState);
    const sortByPlayerId = (
      a: { playerId: PlayerId },
      b: { playerId: PlayerId },
    ) => a.playerId.localeCompare(b.playerId);
    const commands = Array.from(lastState.effect.players).sort(sortByPlayerId);
    const players = Array.from(lastState.players).sort(sortByPlayerId);
    const updatedStateHistory = core.progress([
      await commandSelect(commands[0], players[0]),
      await commandSelect(commands[1], players[1]),
    ]);
    console.dir(updatedStateHistory, { depth: null });
    lastState = updatedStateHistory.at(-1);
  }
})();
