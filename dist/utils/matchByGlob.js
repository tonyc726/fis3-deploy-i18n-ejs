'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (str, match) {
  return (0, _isString3.default)(match) && match.length !== 0 && (0, _isString3.default)(str) ? (0, _minimatch2.default)(str, match, {}) : false;
};