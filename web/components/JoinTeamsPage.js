var React = require('react');
var GameHelpers = require('../GameHelpers');

module.exports = function (props) {
  var game = props.game;
  var teams = GameHelpers.getTeams(game);
  return (
    <div>
      <h1>Join Teams</h1>
      <div className="team-list">
        {teams.map(function (team, i) {
          return (<Team team={team} key={i}/>);
        }).toArray()}
      </div>
      <button>Start Game</button>
    </div>
  );
};

function Team(props) {
  var team = props.team;
  return (
    <div className="team">
      <h2>Team Name</h2>
      <ol className="player-list">
        {team.get('players').map(function (player) {
          return (<li key={player.get('id')}>{player.get('id')} - {player.get('name')}</li>);
        }).toArray()}
      </ol>
    </div>
  )
}