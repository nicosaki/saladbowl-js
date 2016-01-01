var express = require('express');

var apiRoutes = require('./api/ApiRoutes');
var gameDao = require('../data/GameDAO').instance;
var RouteHelpers = require('./RouteHelpers');
var router = express.Router();


router.use(RouteHelpers.attachUser);

router.use('/api', apiRoutes);


// TODO: Split up routes into more files

/**
 * Home Page
 */
router.get('/', function (req, res, next) {
  console.log(req.user);

  gameDao.recent()
    .then(function (games) {
      var data = {
        user: req.user,
        games: games
      };
      if (req.xhr) {
        res.send(data);
      } else {
        res.render('index', data);
      }
    }, next)
    .catch(next);
});

/**
 * Show the instructions.
 */
router.get('/how-to-play', function (req, res, next) {
  res.render('how-to-play');
});

/**
 * Show the new game page.
 */
router.get('/new-game', function (req, res, next) {
  res.render('new-game');
});

/**
 * Create a new game and link to that game.
 */
router.post('/new-game', function (req, res, next) {
  gameDao.create({
      'name': req.body.gameName,
      'wordsPerPlayer': parseInt(req.body.wordsPerPlayer) || 5
    })
    .then(function (game) {
      res.redirect('/game/' + game._id);
    }, next)
    .catch(next);
});

/**
 *
 */
router.get('/game/:gameId', function (req, res, next) {
  var gameId = req.params['gameId'];
  gameDao.fromId(gameId)
    .then(function (game) {
      if (!game) {
        throw Error('Bad Game Id');
      }
      var player = game.getPlayer(req.user);
      if (player) {
        if (player.words.length < game.wordsPerPlayer) {
          console.log('redirecting to add word');
          res.redirect('/game/' + gameId + '/add-word');
        } else {
          console.log('rendering game');
          var data = {
            user: req.user,
            game: game,
            phase: game.phases[game.currentPhase],
            teams: game.getTeams(true),
            currentPlayer: game.getCurrentPlayer(),
            player: player
          };
          if (req.xhr) {
            res.send(data);
          } else {
            res.render('game', data);
          }
        }
      } else {
        console.log('redirecting to join', player);
        res.redirect('/game/' + gameId + '/join');
      }
    }, next)
    .catch(next);
});

/**
 *
 */
router.get('/game/:gameId/join', function (req, res, next) {
  var gameId = req.params['gameId'];
  gameDao.fromId(gameId)
    .then(function (game) {
      if (!game) {
        throw Error('No Game Found');
      }
      res.render('join', {
        user: req.user,
        game: game
      });
    }, next)
    .catch(next);
});
/**
 *
 */
router.post('/game/:gameId/join', function (req, res, next) {
  var gameId = req.params['gameId'];
  gameDao.addPlayer(gameId, req.user, req.body.playerName)
    .then(function (game) {
      res.redirect('/game/' + gameId);
    }, function (error) {
      if (error.name == 'JoinError') {
        if (error.message === 'ALREADY JOINED') {
          res.redirect('/game/' + gameId);
        } else if (error.message === 'ALREADY JOINED') {
          // TODO: ?
        }
      } else {
        throw error;
      }
    })
    .catch(next);
});

/**
 *
 */
router.get('/game/:gameId/leave', function (req, res, next) {
  gameDao.removePlayer(req.params.gameId, req.user)
    .then(function (game) {
      res.redirect('/');
    }, next)
    .catch(next);
});

/**
 *
 */
router.get('/game/:gameId/delete', function (req, res, next) {
  gameDao.remove(req.params.gameId)
    .then(function (game) {
      res.redirect('/');
    }, next)
    .catch(next);
});

/**
 *
 */
router.post('/game/:gameId/join-team', function (req, res, next) {
  var gameId = req.params['gameId'];
  gameDao.setTeam(gameId, req.user, req.body.team)
    .then(function (game) {
      res.redirect('/game/' + gameId);
    }, next)
    .catch(next);
});

/**
 *
 */
router.get('/game/:gameId/add-word', function (req, res, next) {
  var gameId = req.params['gameId'];
  gameDao.fromId(gameId)
    .then(function (game) {
      var player = game.getPlayer(req.user);
      res.render('add-word', {
        'game': game,
        'player': player,
        'user': req.user
      });
    }, next)
    .catch(next);
});

/**
 *
 */
router.post('/game/:gameId/add-word', function (req, res, next) {
  var gameId = req.params['gameId'];
  var word = req.body.word;
  if (word) {
    gameDao.addWord(gameId, req.user, word)
      .then(function (game) {
        res.redirect('/game/' + gameId);
      }, next)
      .catch(next);
  } else {
    res.redirect('/game/' + gameId + '/add-word');
  }
});

/**
 *
 */
router.get('/game/:gameId/start-game', function (req, res, next) {
  var gameId = req.params['gameId'];
  gameDao.startGame(gameId)
    .then(function (game) {
      res.redirect('/game/' + gameId);
    }, next)
    .catch(next);
});

/**
 *
 */
router.get('/game/:gameId/next-team', function (req, res, next) {
  var gameId = req.params['gameId'];
  gameDao.nextTeam(gameId)
    .then(function (game) {
      res.redirect('/game/' + gameId);
    }, next)
    .catch(next);
});

/**
 *
 */
router.get('/game/:gameId/correct-word', function (req, res, next) {
  var gameId = req.params['gameId'];
  gameDao.correctWord(gameId)
    .then(function (game) {
      res.redirect('/game/' + gameId);
    }, next)
    .catch(next);
});

/**
 *
 */
router.get('/game/:gameId/skip-word', function (req, res, next) {
  var gameId = req.params['gameId'];
  gameDao.skipWord(gameId)
    .then(function (game) {
      res.redirect('/game/' + gameId);
    }, next)
    .catch(next);
});

/**
 *
 */
router.get('/game/:gameId/start-round', function (req, res, next) {
  var gameId = req.params['gameId'];
  gameDao.startRound(gameId)
    .then(function (game) {
      res.redirect('/game/' + gameId);
    }, next)
    .catch(next);
});

/**
 *
 */
router.get('/game/:gameId/previous-phase', function (req, res, next) {
  var gameId = req.params['gameId'];
  gameDao.previousPhase(gameId)
    .then(function (game) {
      res.redirect('/game/' + gameId);
    }, next)
    .catch(next);
});


exports.init = function (app) {
  app.use('/', router);
  app.io.route('ready');
};

