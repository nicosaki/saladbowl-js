'use strict';

const Immutable = require('immutable');

const ActionTypes = require('../ActionTypes');
const MathUtil = require('../MathUtil');
const GameHelpers = require('../GameHelpers');

/**
 * Start the round.
 * @param game {Immutable.Map}
 * @param action
 * @returns {Immutable.Map}
 */
exports[ActionTypes.CLIENT.ROUND_STARTED] = (game, action) => {
  return game
    .set('lastCorrectWordIndex', null)
    .set('roundStarted', true)
    .set('roundStartedAt', action.startTime);
};


/**
 * End the round.
 * @param game {Immutable.Map}
 * @param action
 * @returns {Immutable.Map}
 */
exports[ActionTypes.CLIENT.ROUND_ENDED] = (game, action) => {
  return game.withMutations((game) => {
    const teams = GameHelpers.getTeams(game);
    game.set('roundStarted', false);
    // Next team and player
    game.set('teamIndex', MathUtil.mod(game.get('teamIndex') + 1, teams.size));
    if (game.get('teamIndex') == 0) {
      game.set('playerIndex', game.get('playerIndex') + 1);
    }
  });
};


/**
 * Handle a correct word.
 * @param game {Immutable.Map}
 * @param action
 * @returns {Immutable.Map}
 */
exports[ActionTypes.CLIENT.WORD_CORRECT] = (game, action) => {
  // TODO: Validate that round is started and stuff
  const currentPlayer = GameHelpers.getCurrentPlayer(game);
  game = game
    .set('points', game.get('points')
      .push(Immutable.fromJS({
        wordIndex: game.get('wordIndex'),
        playerId: currentPlayer.get('id'),
        team: currentPlayer.get('team'),
        phaseIndex: game.get('phaseIndex')
      })))
    .setIn(['words', game.get('wordIndex'), 'inBowl'], false)
    .set('lastCorrectWordIndex', game.get('wordIndex'));

  const bowlIsEmpty = game.get('words').every((word) => {
    return !word.get('inBowl');
  });

  if (bowlIsEmpty) {
    if (game.get('phaseIndex') == 2) {
      return game
        .set('roundEnded', true)
        .set('ended', true);
    } else {
      game = game
        .set('words', game.get('words').map((word) => {
          return word.set('inBowl', true);
        }))
        .set('roundStarted', false)
        .set('phaseIndex', game.get('phaseIndex') + 1);
    }
  }

  return game.set('wordIndex', GameHelpers.getNextWordIndex(game));
};


/**
 * Skip the current word.
 * @param game {Immutable.Map}
 * @param action
 * @returns {Immutable.Map}
 */
exports[ActionTypes.CLIENT.WORD_SKIPPED] = (game, action) => {
  return game
    .updateIn(['words', game.get('wordIndex')], (word) => {
      return word.set('skips', word.get('skips', 0) + 1);
    })
    .set('wordIndex', GameHelpers.getNextWordIndex(game));
};