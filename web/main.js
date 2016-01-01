var Game = require('../shared/Game');
var Timer = require('./Timer');
var misc = require('./misc');
var Refresh = require('./Refresh');


$(function () {
  var game = Game.transformGame(SALADBOWL.game);
  var player = SALADBOWL.player;
  misc.setupHandlebars();

  if ($('#index-page').length) {
    Refresh.auto('index');
  }
  if ($('#game-page').length) {
    Refresh.auto('game', onGamePage, {'game': game, 'player': player});
  }
  if ($('#new-game-page').length) {
    console.log('new game page');
  }
  if ($('#join-page').length) {
    console.log('join page');
  }
  if ($('#add-word-page').length) {
    console.log('add word page');
  }
});

/**
 * Called when the game page is rendered.
 *
 * @param data
 */
function onGamePage(data) {
  var game = data.game;
  Timer.start(game, game.getCurrentPlayer().id == data.player.id);
  $('.team.joinable').click(function () {
    var team = $(this).data('team-id');
    $.post('/game/' + game._id + '/join-team', {'team': team})
      .done(function (data) {
        Refresh.refresh('game', onGamePage);
      });
    console.log('Joining Team', team);
  });
}