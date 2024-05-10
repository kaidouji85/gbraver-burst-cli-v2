import select, { Separator } from '@inquirer/select';
import { Armdozers } from 'gbraver-burst-core';

/** プレイヤー01のID */
const player01Id = "player-01";

/** プレイヤー02のID */
const player02Id = "player-02"

/** アームドーザの選択肢 */
const armdozerChoices = Armdozers.map(a => ({
  value: a.id
}));

/**
 * エントリポイント
 */
(async () => {
  const player01Armdozer = await select({
    message: `select ${player01Id} armdozer`,
    choices: armdozerChoices
  });
  const player02Armdozer = await select({
    message: `select ${player02Id} armdozer`,
    choices: armdozerChoices
  });
  console.log(player01Armdozer, player02Armdozer);
})();