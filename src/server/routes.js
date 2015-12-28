'use strict';

import express from 'express';
import debug from 'debug';
var logger = debug('app:routes');

var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index');
});


/**
 * Use this to wrap a route that uses async/await.
 * It helps catch any rejected promises.
 */
function Catch(fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(next)
  };
}

module.exports = router;
