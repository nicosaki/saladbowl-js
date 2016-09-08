'use strict';

const Immutable = require('immutable');

const ActionTypes = require('../ActionTypes');
const GameHelpers = require('../GameHelpers');

/**
 * Called when a new player has joined.
 * @param game {Immutable.Map}
 * @param action
 * @returns {Immutable.Map}
 */
exports[ActionTypes.CLIENT.PLAYER_JOINED] = (game, action) => {
  const defaultPlayer = {team: 0, active: true}; // TODO: Move to default data somewhere
  let player = Immutable.fromJS(Object.assign(defaultPlayer, action.player));

  if (game.get('players').some((otherPlayer) => player.get('id') == otherPlayer.get('id'))) {
    throw new Error('Player already in game');
  }

  let playerIndex = action.hasOwnProperty('playerIndex') ? action.playerIndex : game.get('players').size;

  return game
    .set('players', game.get('players').set(playerIndex, player))
    .set('words', game.get('words').withMutations((words) => {
      let wordsPerPlayer = game.get('wordsPerPlayer');
      for (let wordIndex = playerIndex * wordsPerPlayer; wordIndex < (playerIndex + 1) * wordsPerPlayer; wordIndex++) {
        words.set(wordIndex, Immutable.fromJS({ // TODO: Move to default data somewhere
          inBowl: false,
          index: wordIndex,
          playerId: player.get('id'),
          skips: 0,
          word: null
        }));
      }
    }));
};


/**
 * Called when a word has changed.
 * @param game {Immutable.Map}
 * @param action
 * @returns {Immutable.Map}
 */
exports[ActionTypes.CLIENT.WORDS_UPDATED] = (game, action) => {
  const playerIndex = GameHelpers.getPlayerIndex(game, action.playerId);
  if (playerIndex < 0) {
    throw new Error(`Player ${action.playerId} is not in game`);
  }

  return game.set('words', game.get('words').withMutations((words) => {
    action.words.forEach((wordData) => {
      const wordIndex = playerIndex * game.get('wordsPerPlayer') + wordData.playerWordIndex;
      const oldWord = words.get(wordIndex);
      if (!oldWord) {
        throw new Error('Cannot update word that doesn\'t exist. wordIndex:' + wordIndex + ' playerIndex:' + playerIndex + ' playerWordIndex:' + wordData.playerWordIndex);
      }
      words.set(wordIndex, oldWord.merge(Immutable.fromJS({
        word: wordData.word,
        inBowl: true
      })));
    });
  }));
};


/**
 * Called when the game has started.
 * @param game {Immutable.Map}
 * @param action
 * @returns {Immutable.Map}
 */
exports[ActionTypes.CLIENT.GAME_STARTED] = (game, action) => {
  return game.set('started', true);
};

/**
 * Called when a player joins a team.
 * @param game {Immutable.Map}
 * @param action
 * @returns {Immutable.Map}
 */
exports[ActionTypes.CLIENT.TEAM_JOINED] = (game, action) => {
  let playerIndex = GameHelpers.getPlayerIndex(game, action.playerId);
  return game.setIn(['players', playerIndex, 'team'], action.team);
};