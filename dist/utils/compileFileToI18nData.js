"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _forEach2 = _interopRequireDefault(require("lodash/forEach"));

var _cloneDeep2 = _interopRequireDefault(require("lodash/cloneDeep"));

var _isFunction2 = _interopRequireDefault(require("lodash/isFunction"));

var _isEmpty2 = _interopRequireDefault(require("lodash/isEmpty"));

var _isPlainObject2 = _interopRequireDefault(require("lodash/isPlainObject"));

var _merge2 = _interopRequireDefault(require("lodash/merge"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _glob = _interopRequireDefault(require("glob"));

var _isGlob = _interopRequireDefault(require("is-glob"));

var _default = (pattern, cwd = process.cwd(), defaultLangName = '', onFileParse, init) => {
  const result = (0, _isPlainObject2.default)(init) && !(0, _isEmpty2.default)(init) ? (0, _cloneDeep2.default)(init) : {};

  if ((0, _isGlob.default)(pattern)) {
    const i18nFiles = _glob.default.sync(pattern, {
      cwd
    });

    (0, _forEach2.default)(i18nFiles, filePath => {
      const fileAbsolutePath = _path.default.join(cwd, filePath);

      const filePathParse = _path.default.parse(fileAbsolutePath);

      const fileName = filePathParse.name;
      let fileJSON = null;

      try {
        fileJSON = JSON.parse(_fs.default.readFileSync(fileAbsolutePath, 'utf8'));
      } catch (err) {
        console.error(`
Plugin(fis3-deploy-i18n-ejs/utils/compileFileToI18nData) Error:
${err}
        `);
      }

      (0, _merge2.default)(result, {
        [fileName]: !(0, _isFunction2.default)(onFileParse) ? fileJSON : onFileParse(fileJSON, defaultLangName, fileName)
      });
    });
  }

  return result;
};

exports.default = _default;
module.exports = exports.default;