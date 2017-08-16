'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _isArray2 = require('lodash/isArray');

var _isArray3 = _interopRequireDefault(_isArray2);

var _merge2 = require('lodash/merge');

var _merge3 = _interopRequireDefault(_merge2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var stringsArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var lastContent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var length = (0, _isArray3.default)(stringsArray) ? stringsArray.length : 0;
  var result = length === 0 ? (0, _merge3.default)({}, lastContent) : {};

  if (stringsArray && stringsArray.length) {
    var prevProp = result;
    stringsArray.forEach(function (propName, i) {
      if ((0, _isString3.default)(propName)) {
        var isLast = i + 1 === length;
        var nextProp = (0, _defineProperty3.default)({}, propName, isLast ? lastContent : {});

        (0, _merge3.default)(prevProp, nextProp);

        if (!isLast) {
          prevProp = prevProp[propName];
        }
      }
    });
  }
  return result;
};

module.exports = exports['default'];