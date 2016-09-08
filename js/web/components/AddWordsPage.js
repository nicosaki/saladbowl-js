'use strict';

const React = require('react');

const ActionTypes = require('../../shared/ActionTypes');
const GameActions = require('../actions/GameActions');
const Validation = require('../../shared/Validation.js');

/**
 *
 */
module.exports = (props) => {
  const dispatch = props.dispatch;
  const game = props.state.get('game');
  const ui = props.state.get('ui');

  const onWordChange = (wordNumber, e) => {
    const value = e.target.value;
    const field = 'word' + wordNumber;
    console.log('wordChanged', field, value);
    dispatch({
      type: ActionTypes.UI.FIELD_CHANGED,
      field: field,
      value: value
    });
  };

  function getWords() {
    const words = [];
    for (let i = 0; i < game.get('wordsPerPlayer'); i++) {
      words.push(ui.get('word' + i));
    }
    return words;
  }

  function addWords(e) {
    // TODO: Disable form / show progress
    e.preventDefault();
    var words = getWords().map((word, i) => ({word: word, playerWordIndex: i}));
    dispatch(GameActions.saveWords(words));
  }

  const inputs = [];
  for (let i = 0; i < game.get('wordsPerPlayer'); i++) {
    inputs.push(<input key={i} autoFocus={i == 0} onChange={onWordChange.bind(this, i)} type="text"/>);
  }

  const disabled = !getWords().every(Validation.validateWord);

  return (
    <div>
      <form onSubmit={addWords}>
        <h1>Add Nouns</h1>
        <h2 className="game-id">GameID: {game.get('id')}</h2>
        {inputs}
        <button disabled={disabled} type="submit">Add</button>
      </form>
    </div>
  );
};