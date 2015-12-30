var ObjectID = require('mongodb').ObjectID;
var shortid = require('shortid');

var db = require('../db');


/**
 * A simple data access object.
 * @param collectionName {String} - name of the mongo collection
 * @param useShortId {boolean} - whether or not to use a shortid instead of ObjectID
 * @constructor
 */
function SimpleDAO(collectionName, useShortId) {
  this.useShortId = useShortId || false;
  this.collection = db.collection(collectionName);
}

/**
 *
 * @param object
 * @returns {*}
 */
SimpleDAO.prototype.transform = function (object) {
  return object;
};

/**
 * Applies the transform at the end of a promise
 * @param promise
 */
SimpleDAO.prototype.transformPromise = function (promise) {
  return promise
    .then(function (object) {
      return this.transform(object); // TODO: Transform on arrays
    }.bind(this));
};

/**
 * Create a new model.
 * @param data
 * @returns {Promise}
 */
SimpleDAO.prototype.create = function (data) {
  data = data || {};
  if (this.useShortId) {
    data['_id'] = data['_id'] || shortid.generate();
  }
  return this.transformPromise(this.collection.insert(data));
};

/**
 * Return a single model.
 * @param id
 * @returns {Promise}
 */
SimpleDAO.prototype.fromId = function (id) {
  if (!this.useShortId) {
    id = ObjectID(id);
  }
  return this.transformPromise(this.collection.findOne({'_id': id}));
};

/**
 * Return a list of models with the given ids.
 * @param ids
 * @returns {Promise}
 */
SimpleDAO.prototype.fromIds = function (ids) {
  // TODO: Make sure this works
  // TODO: Transform promise
  ids = ids || [];
  if (!this.useShortId) {
    ids = ids.map(ObjectID);
  }
  return this.collection.find({_id: {$in: ids}});
};

/**
 * Return all objects.
 */
SimpleDAO.prototype.all = function () {
  // TODO: Transform promise
  return this.collection.find({}).toArray();
};

/**
 * Update and return a model.
 * @param id
 * @param data
 * @returns {Promise}
 */
SimpleDAO.prototype.update = function (id, data) {
  if (!this.useShortId) {
    id = ObjectID(id);
  }
  return this.transformPromise(this.collection.findAndModify({
    'query': {'_id': id},
    'update': data,
    'new': true
  }));
};

/**
 * Remove a campaign.
 * @param {string} id
 * @returns {Promise}
 */
SimpleDAO.prototype.remove = function (id) {
  if (!this.useShortId) {
    id = ObjectID(id);
  }
  return this.transformPromise(this.collection.remove({'_id': id}));
};


module.exports = SimpleDAO;