var Immutable = require('immutable');
var React = require('react');

var ActionTypes = require('../../shared/ActionTypes');
var UpdateGame = require('../UpdateGame.js');
var Validation = require('../../shared/Validation.js');

/**
 *
 */
module.exports = function (props) {
  var dispatch = props.dispatch;
  var game = props.state.get('game');
  var ui = props.state.get('ui');

  var onWordChange = function (wordNumber, e) {
    var value = e.target.value;
    var field = 'word' + wordNumber;
    console.log('wordChanged', field, value);
    dispatch({
      type: ActionTypes.UI.FIELD_CHANGED,
      field: field,
      value: value
    });
  };

  var getWords = () => {
    const words = [];
    for (var i = 0; i < game.get('wordsPerPlayer'); i++) {
      words.push(ui.get('word' + i));
    }
    return words;
  };

  var addWords = function (e) {
    // TODO: Disable form
    e.preventDefault();
    UpdateGame.saveWords(getWords().map((word, i) => ({word: word, playerWordIndex: i})));
  };

  var inputs = [];
  for (var i = 0; i < game.get('wordsPerPlayer'); i++) {
    inputs.push(<input key={i} autoFocus={i == 0} onChange={onWordChange.bind(this, i)} type="text"/>);
  }

  var disabled = !getWords().every(Validation.validateWord);

  return (
    <div>
      <form onSubmit={addWords}>
        <h1>Add Words</h1>
        {inputs}
        <button disabled={disabled} type="submit">Add</button>
      </form>
    </div>
  );
};