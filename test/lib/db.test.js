/* global describe, it, before, after, beforeEach */
/* jshint sub:true */
var should = require('should');
var mongoose = require('../utils/db-mock');
var db = require('../../src/lib/db');
var Schema = mongoose.Schema;


describe('Mocking database', function() {
  var collectionName = 'tests';
  var collection = db.db.collection(collectionName);


  before(function(done) {
    done();
  });


  after(function(done) {
    db.db.collection(collectionName).drop(function() {
      mongoose.models = {};
      mongoose.modelSchemas = {};      
      done();
    });
  });


  beforeEach(function(done) {
    db.db.collection(collectionName).drop(function() {
      mongoose.models = {};
      mongoose.modelSchemas = {};      
      done();
    });
  });

  /**
   * README:
   * sometimes inside a test we use a try catch statement because
   * if an assertion exception is thrown in the callback of an async test,
   * currently mocha only reports a timeout rather than which assertion failed
   * (and the details of the failure) https://github.com/mochajs/mocha/pull/278
   * uncomment the following code to see this issue
   */
  // it('should do promises', function(done) {
  //   new Promise(function(resolve) {
  //     resolve(1);
  //   })
  //   .then(function(res) {
  //     res.should.equal(2);
  //     done();
  //   });
  // });


  describe('Connection to the db', function() {

    it('should get db stats', function(done) {
      should.exist(db.db);
      done();
    });


    it('should create an ObjectId', function(done) {
      var diff = 2 * 1000; // 2 seconds
      var now = new Date().getTime();
      var id = db.Mongoose.Types.ObjectId().toString();
      var time = new Date(db.Mongoose.Types.ObjectId(id).getTimestamp().toString()).getTime();
      (typeof id).should.equal('string');
      id.length.should.equal(24);
      (time - now).should.be.below(diff);
      done();
    });


    it('should get collection', function(done) {
      collection.collectionName.should.equal(collectionName);
      done();
    });

  });


  describe('MongoDB Driver functionalities using callbacks', function() {

    it('should insert document', function(done) {
      collection.insert({ a: 1 }, function(err, res) {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0]['_id'].toString().should.not.equal('');
        res.ops[0]['a'].should.equal(1);
        done();
      });
    });


    it('should update document', function(done) {
      collection.insert({ a: 1 }, function(err, res) {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        var id = res.ops[0]['_id'].toString();
        id.should.not.equal('');
        res.ops[0]['a'].should.equal(1);
        collection.update({ a: 1 }, {$set: { a: 4 }}, { multi: true }, function(err, res) {
          if (err) {
            done(err);
          }
          res.result.ok.should.equal(1);
          res.result.n.should.be.above(0);
          done();
        });
      });
    });


    it('should find a single document', function(done) {
      var id;
      collection.insert({ a: 1 }, function(err, res) {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        id = res.ops[0]['_id'].toString();
        id.should.not.equal('');
        res.ops[0]['a'].should.equal(1);
        collection.findOne({ _id: db.Mongoose.Types.ObjectId(id) }, function(err, res) {
          var _id = res['_id'].toString();
          res['a'].should.equal(1);
          _id.should.equal(id);
          done();
        });
      });
    });


    it('should find multiple documents', function(done) {
      collection.insert({ a: 111 }, function(err, res) {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0]['a'].should.equal(111);
        var id = res.ops[0]['_id'].toString();
        id.should.not.equal('');
        collection.insert({ a: 111 }, function(err, res) {
          if (err) {
            done(err);
          }
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          res.ops[0]['a'].should.equal(111);
          var id = res.ops[0]['_id'].toString();
          id.should.not.equal('');
          return collection.find({ a: 111 }).toArray()
            .then(function(res) {
              try {
                res.length.should.equal(2);
                done();
              } catch (err) {
                done(err);
              }
            }, function(err) {
              try {
                should.not.exist(err);
                done();
              } catch (err2) {
                done(err2);
              }
            });
        });
      });
    });


    it('should find all documents', function(done) {
      collection.insert({ b: 222 }, function(err, res) {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0]['b'].should.equal(222);
        var id = res.ops[0]['_id'].toString();
        id.should.not.equal('');
        collection.insert({ a: 111 }, function(err, res) {
          if (err) {
            done(err);
          }
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          res.ops[0]['a'].should.equal(111);
          var id = res.ops[0]['_id'].toString();
          id.should.not.equal('');
          return collection.find().toArray()
            .then(function(res) {
              try {
                res.length.should.equal(2);
                done();
              } catch (err) {
                done(err);
              }
            }, function(err) {
              try {
                should.not.exist(err);
                done();
              } catch (err2) {
                done(err2);
              }
            });
        });
      });
    });


    it('should aggregate documents', function(done) {
      collection.insert({ b: 222 }, function(err, res) {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0]['b'].should.equal(222);
        var id = res.ops[0]['_id'].toString();
        id.should.not.equal('');
        collection.insert({ a: 111 }, function(err, res) {
          if (err) {
            done(err);
          }
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          res.ops[0]['a'].should.equal(111);
          var id = res.ops[0]['_id'].toString();
          id.should.not.equal('');
          return collection.aggregate().toArray()
            .then(function(res) {
              try {
                res.length.should.equal(2);
                done();
              } catch (err) {
                done(err);
              }
            }, function(err) {
              try {
                should.not.exist(err);
                done();
              } catch (err2) {
                done(err2);
              }
            });
        });
      });
    });


    it('should remove document', function(done) {
      var id;
      collection.insert({ a: 1 }, function(err, res) {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        id = res.ops[0]['_id'].toString();
        id.should.not.equal('');
        res.ops[0]['a'].should.equal(1);
        collection.remove({_id: db.Mongoose.Types.ObjectId(id)}, function(err, res) {
          if (err) {
            done(err);
          }
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          done();
        });
      });
    });

  });


  describe('MongoDB Driver functionalities using promises', function() {

    it('should insert document', function(done) {
      collection.insert({ a: 1 })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0]['_id'].toString().should.not.equal('');
        res.ops[0]['a'].should.equal(1);
        done();
      })
      .catch(done);
    });


    it('should update document', function(done) {
      collection.insert({ a: 1 })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        var id = res.ops[0]['_id'].toString();
        id.should.not.equal('');
        res.ops[0]['a'].should.equal(1);
        return collection.update({ a: 1 }, {$set: { a: 4 }}, { multi: true });
      })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.be.above(0);
        done();
      })
      .catch(done);
    });


    it('should find a single document', function(done) {
      var id;
      collection.insert({ a: 1 })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        id = res.ops[0]['_id'].toString();
        id.should.not.equal('');
        res.ops[0]['a'].should.equal(1);
        return collection.findOne({ _id: db.Mongoose.Types.ObjectId(id) });
      })
      .then(function(res) {
        var _id = res['_id'].toString();
        res['a'].should.equal(1);
        _id.should.equal(id);
        done();
      })
      .catch(done);
    });


    it('should find multiple documents', function(done) {
      collection.insert({ a: 111 })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0]['a'].should.equal(111);
        var id = res.ops[0]['_id'].toString();
        id.should.not.equal('');
        return collection.insert({ a: 111 });
      })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0]['a'].should.equal(111);
        var id = res.ops[0]['_id'].toString();
        id.should.not.equal('');
        return collection.find({ a: 111 }).toArray();
      })
      .then(function(res) {
        res.length.should.equal(2);
        done();
      })
      .catch(done);
    });


    it('should find all documents', function(done) {
      collection.insert({ b: 222 })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0]['b'].should.equal(222);
        var id = res.ops[0]['_id'].toString();
        id.should.not.equal('');
        return collection.insert({ a: 111 });
      })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0]['a'].should.equal(111);
        var id = res.ops[0]['_id'].toString();
        id.should.not.equal('');
        return collection.find().toArray();
      })
      .then(function(res) {
        res.length.should.equal(2);
        done();
      })
      .catch(done);
    });


    it('should aggregate documents', function(done) {
      collection.insert({ b: 222 })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0]['b'].should.equal(222);
        var id = res.ops[0]['_id'].toString();
        id.should.not.equal('');
        return collection.insert({ a: 111 });
      })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0]['a'].should.equal(111);
        var id = res.ops[0]['_id'].toString();
        id.should.not.equal('');
        return collection.aggregate().toArray();
      })
      .then(function(res) {
        res.length.should.equal(2);
        done();
      })
      .catch(done);
    });


    it('should remove document', function(done) {
      var id;
      collection.insert({ a: 1 })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        id = res.ops[0]['_id'].toString();
        id.should.not.equal('');
        res.ops[0]['a'].should.equal(1);
        return collection.remove({_id: db.Mongoose.Types.ObjectId(id)});
      })
      .then(function(res) {
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        done();
      })
      .catch(done);
    });

  });


  describe('Mongoose.js schema functionalities', function() {

    it('should insert document', function(done) {
      var schema = new Schema({
        'userId': {
          'type': 'string'
        },
        'displayName': {
          'type': 'string'
        }
      }, { versionKey: false });
      var payload = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var Model = mongoose.model(collectionName, schema);
      var record = new Model(payload);
      record.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload['userId']);
          res['displayName'].should.equal(payload['displayName']);
          done();
        })
        .catch(done);
    });


    it('should insert document except fields not defined in the schema', function(done) {
      var schema = new Schema({
        'userId': {
          'type': 'string'
        },
        'displayName': {
          'type': 'string'
        }
      }, { versionKey: false });
      var payload = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson',
        'extraField': 'xxx'
      };
      var Model = mongoose.model(collectionName, schema);
      var record = new Model(payload);
      record.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload['userId']);
          res['displayName'].should.equal(payload['displayName']);
          should.not.exist(res['extraField']);
          done();
        })
        .catch(done);
    });


    it('should fail to insert document because of validation schema', function(done) {
      var schema = new Schema({
        'userId': {
          'type': 'string'
        },
        'displayName': {
          'type': 'string'
        },
        'requiredField': {
          'type': 'string',
          'required': true
        }
      }, { versionKey: false });
      var payload = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var Model = mongoose.model(collectionName, schema);
      var record = new Model(payload);
      record.save()
        .then(function(res) {
          done(res);
        })
        .catch(function(err) {
          should.exist(err);
          done();
        });
    });


    it('should update document', function(done) {
      var schema = new Schema({
        'userId': {
          'type': 'string'
        },
        'displayName': {
          'type': 'string'
        }
      }, { versionKey: false });
      var payload = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var Model = mongoose.model(collectionName, schema);
      var record = new Model(payload);
      record.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload['userId']);
          res['displayName'].should.equal(payload['displayName']);
        })
        .then(function() {
          var condition = { 'userId': 'richardb789' };
          var update = { 'displayName': 'test user' };
          var options = { multi: true };
          return Model.update(condition, update, options);
        })
        .then(function(res) {
          res.ok.should.equal(1);
          res.n.should.equal(1);
          var condition = { 'userId': 'richardb789' };
          return Model.findOne(condition);
        })
        .then(function(res) {
          res['userId'].should.equal(payload['userId']);
          res['displayName'].should.equal('test user');
          done();
        })
        .catch(done);
    });


    it('should fail to update document because of validation schema', function(done) {
      var schema = new Schema({
        'userId': {
          'type': 'string'
        },
        'displayName': {
          'type': 'string'
        }
      }, { versionKey: false });
      var payload = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var Model = mongoose.model(collectionName, schema);
      var record = new Model(payload);
      record.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload['userId']);
          res['displayName'].should.equal(payload['displayName']);
        })
        .then(function() {
          var condition = { 'userId': 'richardb789' };
          var update = { 'extraField': 'xxx' };
          var options = { multi: true };
          return Model.update(condition, update, options);
        })
        .then(function(res) {
          res.ok.should.equal(0);
          res.n.should.equal(0);
          done();
        })
        .catch(done);
    });


    it('should find a single document', function(done) {
      var schema = new Schema({
        'userId': {
          'type': 'string'
        },
        'displayName': {
          'type': 'string'
        }
      }, { versionKey: false });
      var payload = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var Model = mongoose.model(collectionName, schema);
      var record = new Model(payload);
      record.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload['userId']);
          res['displayName'].should.equal(payload['displayName']);
          return Model.findOne({ 'userId': 'richardb789' });
        })
        .then(function(res) {
          res['userId'].should.equal(payload['userId']);
          res['displayName'].should.equal(payload['displayName']);
          done();
        })
        .catch(done);
    });


    it('should find multiple documents', function(done) {
      var schema = new Schema({
        'userId': {
          'type': 'string'
        },
        'displayName': {
          'type': 'string'
        }
      }, { versionKey: false });
      var payload1 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var payload2 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson 2'
      };
      var payload3 = {
        'userId': 'richardb780',
        'displayName': 'Richard Branson 3'
      };
      var Model = mongoose.model(collectionName, schema);
      var record1 = new Model(payload1);
      record1.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload1['userId']);
          res['displayName'].should.equal(payload1['displayName']);
          var record2 = new Model(payload2);
          return record2.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload2['userId']);
          res['displayName'].should.equal(payload2['displayName']);
          var record3 = new Model(payload3);
          return record3.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload3['userId']);
          res['displayName'].should.equal(payload3['displayName']);
          return Model.find({ 'userId': 'richardb789' });
        })
        .then(function(res) {
          res.length.should.equal(2);
          res[0]['displayName'].should.equal(payload1['displayName']);
          res[1]['displayName'].should.equal(payload2['displayName']);
          done();
        })
        .catch(done);
    });


    it('should find all documents', function(done) {
      var schema = new Schema({
        'userId': {
          'type': 'string'
        },
        'displayName': {
          'type': 'string'
        }
      }, { versionKey: false });
      var payload1 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var payload2 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson 2'
      };
      var payload3 = {
        'userId': 'richardb780',
        'displayName': 'Richard Branson 3'
      };
      var Model = mongoose.model(collectionName, schema);
      var record1 = new Model(payload1);
      record1.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload1['userId']);
          res['displayName'].should.equal(payload1['displayName']);
          var record2 = new Model(payload2);
          return record2.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload2['userId']);
          res['displayName'].should.equal(payload2['displayName']);
          var record3 = new Model(payload3);
          return record3.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload3['userId']);
          res['displayName'].should.equal(payload3['displayName']);
          return Model.find();
        })
        .then(function(res) {
          res.length.should.equal(3);
          res[0]['displayName'].should.equal(payload1['displayName']);
          res[1]['displayName'].should.equal(payload2['displayName']);
          res[2]['displayName'].should.equal(payload3['displayName']);
          done();
        })
        .catch(done);
    });


    it('should aggregate documents', function(done) {
      var schema = new Schema({
        'userId': {
          'type': 'string'
        },
        'displayName': {
          'type': 'string'
        }
      }, { versionKey: false });
      var payload1 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var payload2 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson 2'
      };
      var payload3 = {
        'userId': 'richardb780',
        'displayName': 'Richard Branson 3'
      };
      var Model = mongoose.model(collectionName, schema);
      var record1 = new Model(payload1);
      record1.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload1['userId']);
          res['displayName'].should.equal(payload1['displayName']);
          var record2 = new Model(payload2);
          return record2.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload2['userId']);
          res['displayName'].should.equal(payload2['displayName']);
          var record3 = new Model(payload3);
          return record3.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload3['userId']);
          res['displayName'].should.equal(payload3['displayName']);
          return Model.aggregate({ $match: { 'userId': payload1['userId'] } }).exec();
        })
        .then(function(res) {
          res.length.should.equal(2);
          res[0]['displayName'].should.equal(payload1['displayName']);
          res[1]['displayName'].should.equal(payload2['displayName']);
          done();
        })
        .catch(done);
    });


    it('should remove documents', function(done) {
      var schema = new Schema({
        'userId': {
          'type': 'string'
        },
        'displayName': {
          'type': 'string'
        }
      }, { versionKey: false });
      var payload1 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var payload2 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson 2'
      };
      var payload3 = {
        'userId': 'richardb780',
        'displayName': 'Richard Branson 3'
      };
      var Model = mongoose.model(collectionName, schema);
      var record1 = new Model(payload1);
      record1.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload1['userId']);
          res['displayName'].should.equal(payload1['displayName']);
          var record2 = new Model(payload2);
          return record2.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload2['userId']);
          res['displayName'].should.equal(payload2['displayName']);
          var record3 = new Model(payload3);
          return record3.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload3['userId']);
          res['displayName'].should.equal(payload3['displayName']);
          return Model.remove({ userId: payload1['userId'] });
        })
        .then(function(res) {
          res.result.ok.should.equal(1);
          res.result.n.should.equal(2);
          return Model.find();
        })
        .then(function(res) {
          res.length.should.equal(1);
          res[0]['displayName'].should.equal(payload3['displayName']);
          done();
        })
        .catch(done);
    });

  });


  describe('Mongoose.js empty schema functionalities', function() {

    it('should insert document', function(done) {
      var schema = new Schema(Schema.Types.Mixed, { versionKey: false, strict: false });
      var payload = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var Model = mongoose.model(collectionName, schema);
      var record = new Model(payload);
      record.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload['userId']);
          res['displayName'].should.equal(payload['displayName']);
          done();
        })
        .catch(done);
    });


    it('should update document', function(done) {
      var schema = new Schema(Schema.Types.Mixed, { versionKey: false, strict: false });
      var payload = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var Model = mongoose.model(collectionName, schema);
      var record = new Model(payload);
      record.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload['userId']);
          res['displayName'].should.equal(payload['displayName']);
        })
        .then(function() {
          var condition = { 'userId': 'richardb789' };
          var update = { 'displayName': 'test user' };
          var options = { multi: true };
          return Model.update(condition, update, options);
        })
        .then(function(res) {
          res.ok.should.equal(1);
          res.n.should.equal(1);
          var condition = { 'userId': 'richardb789' };
          return Model.findOne(condition);
        })
        .then(function(res) {
          res.get('userId').should.equal(payload['userId']);
          res.get('displayName').should.equal('test user');
          done();
        })
        .catch(done);
    });


    it('should update document changing its structure', function(done) {
      var schema = new Schema(Schema.Types.Mixed, { versionKey: false, strict: false });
      var payload = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var Model = mongoose.model(collectionName, schema);
      var record = new Model(payload);
      record.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload['userId']);
          res['displayName'].should.equal(payload['displayName']);
        })
        .then(function() {
          var condition = { 'userId': 'richardb789' };
          var update = { 'extraField': 'xxx' };
          var options = { multi: true };
          return Model.update(condition, update, options);
        })
        .then(function(res) {
          res.ok.should.equal(1);
          res.n.should.equal(1);
          done();
        })
        .catch(done);
    });


    it('should find a single document', function(done) {
      var schema = new Schema(Schema.Types.Mixed, { versionKey: false, strict: false });
      var payload = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var Model = mongoose.model(collectionName, schema);
      var record = new Model(payload);
      record.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload['userId']);
          res['displayName'].should.equal(payload['displayName']);
          return Model.findOne({ 'userId': 'richardb789' });
        })
        .then(function(res) {
          res.get('userId').should.equal(payload['userId']);
          res.get('displayName').should.equal(payload['displayName']);
          done();
        })
        .catch(done);
    });


    it('should find multiple documents', function(done) {
      var schema = new Schema(Schema.Types.Mixed, { versionKey: false, strict: false });
      var payload1 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var payload2 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson 2'
      };
      var payload3 = {
        'userId': 'richardb780',
        'displayName': 'Richard Branson 3'
      };
      var Model = mongoose.model(collectionName, schema);
      var record1 = new Model(payload1);
      record1.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload1['userId']);
          res['displayName'].should.equal(payload1['displayName']);
          var record2 = new Model(payload2);
          return record2.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload2['userId']);
          res['displayName'].should.equal(payload2['displayName']);
          var record3 = new Model(payload3);
          return record3.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload3['userId']);
          res['displayName'].should.equal(payload3['displayName']);
          return Model.find({ 'userId': 'richardb789' });
        })
        .then(function(res) {
          res.length.should.equal(2);
          res[0].get('displayName').should.equal(payload1['displayName']);
          res[1].get('displayName').should.equal(payload2['displayName']);
          done();
        })
        .catch(done);
    });


    it('should find all documents', function(done) {
      var schema = new Schema(Schema.Types.Mixed, { versionKey: false, strict: false });
      var payload1 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var payload2 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson 2'
      };
      var payload3 = {
        'userId': 'richardb780',
        'displayName': 'Richard Branson 3'
      };
      var Model = mongoose.model(collectionName, schema);
      var record1 = new Model(payload1);
      record1.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload1['userId']);
          res['displayName'].should.equal(payload1['displayName']);
          var record2 = new Model(payload2);
          return record2.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload2['userId']);
          res['displayName'].should.equal(payload2['displayName']);
          var record3 = new Model(payload3);
          return record3.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload3['userId']);
          res['displayName'].should.equal(payload3['displayName']);
          return Model.find();
        })
        .then(function(res) {
          res.length.should.equal(3);
          res[0].get('displayName').should.equal(payload1['displayName']);
          res[1].get('displayName').should.equal(payload2['displayName']);
          res[2].get('displayName').should.equal(payload3['displayName']);
          done();
        })
        .catch(done);
    });


    it('should aggregate documents', function(done) {
      var schema = new Schema(Schema.Types.Mixed, { versionKey: false, strict: false });
      var payload1 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var payload2 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson 2'
      };
      var payload3 = {
        'userId': 'richardb780',
        'displayName': 'Richard Branson 3'
      };
      var Model = mongoose.model(collectionName, schema);
      var record1 = new Model(payload1);
      record1.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload1['userId']);
          res['displayName'].should.equal(payload1['displayName']);
          var record2 = new Model(payload2);
          return record2.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload2['userId']);
          res['displayName'].should.equal(payload2['displayName']);
          var record3 = new Model(payload3);
          return record3.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload3['userId']);
          res['displayName'].should.equal(payload3['displayName']);
          return Model.aggregate({ $match: { 'userId': payload1['userId'] } }).exec();
        })
        .then(function(res) {
          res.length.should.equal(2);
          res[0]['displayName'].should.equal(payload1['displayName']);
          res[1]['displayName'].should.equal(payload2['displayName']);
          done();
        })
        .catch(done);
    });


    it('should remove documents', function(done) {
      var schema = new Schema(Schema.Types.Mixed, { versionKey: false, strict: false });
      var payload1 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson'
      };
      var payload2 = {
        'userId': 'richardb789',
        'displayName': 'Richard Branson 2'
      };
      var payload3 = {
        'userId': 'richardb780',
        'displayName': 'Richard Branson 3'
      };
      var Model = mongoose.model(collectionName, schema);
      var record1 = new Model(payload1);
      record1.save()
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload1['userId']);
          res['displayName'].should.equal(payload1['displayName']);
          var record2 = new Model(payload2);
          return record2.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload2['userId']);
          res['displayName'].should.equal(payload2['displayName']);
          var record3 = new Model(payload3);
          return record3.save();
        })
        .then(function(res) {
          should.exist(res['_id']);
          res['userId'].should.equal(payload3['userId']);
          res['displayName'].should.equal(payload3['displayName']);
          return Model.remove({ userId: payload1['userId'] });
        })
        .then(function(res) {
          res.result.ok.should.equal(1);
          res.result.n.should.equal(2);
          return Model.find();
        })
        .then(function(res) {
          res.length.should.equal(1);
          res[0].get('displayName').should.equal(payload3['displayName']);
          done();
        })
        .catch(done);
    });

  });

});