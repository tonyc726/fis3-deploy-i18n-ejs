'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _forEach2 = require('lodash/forEach');

var _forEach3 = _interopRequireDefault(_forEach2);

var _noop2 = require('lodash/noop');

var _noop3 = _interopRequireDefault(_noop2);

var _isFunction2 = require('lodash/isFunction');

var _isFunction3 = _interopRequireDefault(_isFunction2);

var _merge3 = require('lodash/merge');

var _merge4 = _interopRequireDefault(_merge3);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _walk = require('walk');

var _walk2 = _interopRequireDefault(_walk);

var _ejs = require('ejs');

var _ejs2 = _interopRequireDefault(_ejs);

var _converArrayStringToPropsObject = require('./utils/converArrayStringToPropsObject');

var _converArrayStringToPropsObject2 = _interopRequireDefault(_converArrayStringToPropsObject);

var _matchByGlob = require('./utils/matchByGlob');

var _matchByGlob2 = _interopRequireDefault(_matchByGlob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_CONFIG = {
  open: '<%',
  close: '%>',
  i18nDir: 'translations',
  dist: 'i18n/$lang/$file',
  defaultLangName: '',
  ignoreMatch: '',
  notKeepOriginSubPathMatch: '',

  onLangFileParse: _noop3.default
};

exports.default = function (options, modified, total, fisDeployNextEvent) {
  var config = (0, _merge4.default)(DEFAULT_CONFIG, options);

  var i18nResourcePath = _path2.default.join(fis.project.getProjectPath(), config.i18nDir);
  var langFilesWalker = _walk2.default.walk(i18nResourcePath, {
    followLinks: false,

    filters: ['.DS_Store']
  });

  var i18nData = {};
  var defaultLangName = config.defaultLangName || null;

  langFilesWalker.on('file', function (root, stats, nextWalkEvent) {
    var langName = stats.name ? stats.name.replace(/\.(json|js)$/, '') : '';
    if (!langName || langName.length === 0) {
      fis.log.error('i18n(' + stats.name + ') fileName is error.');
      nextWalkEvent();
    }

    var fileJSON = fis.util.readJSON(_path2.default.join(root, stats.name));

    if ((0, _isFunction3.default)(config.onLangFileParse)) {
      (0, _merge4.default)(fileJSON, config.onLangFileParse((0, _extends3.default)({}, fileJSON), defaultLangName, langName));
    }

    (0, _merge4.default)(i18nData, (0, _defineProperty3.default)({}, langName, (0, _converArrayStringToPropsObject2.default)(root.replace(i18nResourcePath, '').replace(/^\//, '').replace(/\/$/, '').split('/').filter(function (propPath) {
      return propPath && propPath.length !== 0;
    }), fileJSON)));
    nextWalkEvent();
  });

  langFilesWalker.on('error', function (root, stats) {
    fis.log.error('Walker is error');

    fis.log.error((0, _stringify2.default)(stats, null, 2));
  });

  langFilesWalker.on('end', function () {
    var ejsCompilerOptions = {
      open: config.open,
      close: config.close
    };
    var defaultLangNameRegExp = defaultLangName === null ? null : new RegExp('' + defaultLangName, 'gi');
    var ejsCompilerResult = [];
    var needRemoveIndexs = [];

    modified.forEach(function (modifiedFile, modifiedFileIndex) {
      if (modifiedFile.release !== false && modifiedFile.isHtmlLike && !(0, _matchByGlob2.default)(modifiedFile.subpath, config.ignoreMatch)) {
        var fileCompiler = _ejs2.default.compile(modifiedFile.getContent(), ejsCompilerOptions);
        var distFilePath = (0, _matchByGlob2.default)(modifiedFile.subpath, config.notKeepOriginSubPathMatch) ? modifiedFile.basename : modifiedFile.release;

        (0, _forEach3.default)(i18nData, function (langData, langName) {
          var distPath = config.dist.replace(/^\//, '').replace(/\/$/, '').replace('$lang/', defaultLangNameRegExp === null || !defaultLangNameRegExp.test(langName) ? langName + '/' : '').replace('$file', distFilePath.replace(/^\//, ''));

          var distFile = fis.file(fis.project.getProjectPath(), distPath);
          distFile.setContent(fileCompiler(i18nData[langName]));

          ejsCompilerResult.push(distFile);
          needRemoveIndexs.push(modifiedFileIndex);
        });
      }
    });

    if (ejsCompilerResult && ejsCompilerResult.length !== 0) {
      (0, _forEach3.default)(needRemoveIndexs, function (removeIndex, i) {
        modified.splice(removeIndex - i, 1);
      });

      ejsCompilerResult.forEach(function (newModifiedFile) {
        modified.push(newModifiedFile);
      });
    }

    fisDeployNextEvent();
  });
};

module.exports = exports['default'];