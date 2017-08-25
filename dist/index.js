'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isEmpty2 = require('lodash/isEmpty');

var _isEmpty3 = _interopRequireDefault(_isEmpty2);

var _forEach2 = require('lodash/forEach');

var _forEach3 = _interopRequireDefault(_forEach2);

var _noop2 = require('lodash/noop');

var _noop3 = _interopRequireDefault(_noop2);

var _isString2 = require('lodash/isString');

var _isString3 = _interopRequireDefault(_isString2);

var _merge2 = require('lodash/merge');

var _merge3 = _interopRequireDefault(_merge2);

var _ejs = require('ejs');

var _ejs2 = _interopRequireDefault(_ejs);

var _isGlob = require('is-glob');

var _isGlob2 = _interopRequireDefault(_isGlob);

var _compileFileToI18nData = require('./utils/compileFileToI18nData');

var _compileFileToI18nData2 = _interopRequireDefault(_compileFileToI18nData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_CONFIG = {
  open: '<%',
  close: '%>',
  dist: 'i18n/$lang/$file',
  templatePattern: '',
  defaultLangName: '',
  i18nPattern: 'translations/*.{js,json}',
  ignorePattern: '',
  noKeepSubPathPattern: '',

  onLangFileParse: _noop3.default
};

exports.default = function (options, modified, total, fisDeployNextEvent) {
  var config = (0, _merge3.default)(DEFAULT_CONFIG, options);
  var defaultLangName = config.defaultLangName || null;

  if (!(0, _isGlob2.default)(config.i18nPattern) || !(0, _isString3.default)(config.dist) || config.dist.indexOf('$lang') < 0 || config.dist.indexOf('$file') < 0) {
    fis.log.warn('fis3-deploy-i18n-ejs: wrong configurations.');
    fisDeployNextEvent();
  } else {
    var i18nData = (0, _compileFileToI18nData2.default)(config.i18nPattern, fis.project.getProjectPath(), defaultLangName, config.onLangFileParse);

    if ((0, _isEmpty3.default)(i18nData)) {
      fis.log.warn('fis3-deploy-i18n-ejs: can\'t found i18n files.');
      fisDeployNextEvent();
    } else {
      var ejsCompilerOptions = {
        open: config.open,
        close: config.close
      };
      var defaultLangNameRegExp = defaultLangName === null ? null : new RegExp('' + defaultLangName, 'gi');
      var ejsCompilerResult = [];
      var needRemoveIndexs = [];

      (0, _forEach3.default)(modified, function (modifiedFile, modifiedFileIndex) {
        if (modifiedFile.release && (!(0, _isGlob2.default)(config.templatePattern) ? modifiedFile.isHtmlLike : fis.util.glob(config.templatePattern, modifiedFile.subpath))) {
          var fileCompiler = _ejs2.default.compile(modifiedFile.getContent(), ejsCompilerOptions);

          var distFilePath = fis.util.glob(config.noKeepSubPathPattern, modifiedFile.subpath) ? modifiedFile.basename : modifiedFile.release;

          (0, _forEach3.default)(i18nData, function (langData, langName) {
            var distPath = config.dist.replace(/^\//, '').replace(/\/$/, '').replace('$lang/', defaultLangNameRegExp === null || !defaultLangNameRegExp.test(langName) ? langName + '/' : '').replace('$file', distFilePath.replace(/^\//, ''));

            var distFile = fis.file(fis.project.getProjectPath(), distPath);
            distFile.setContent(fileCompiler(i18nData[langName]));

            ejsCompilerResult.push(distFile);
          });

          needRemoveIndexs.push(modifiedFileIndex);
        }
      });

      if (ejsCompilerResult && ejsCompilerResult.length !== 0) {
        (0, _forEach3.default)(needRemoveIndexs, function (removeIndex, i) {
          modified.splice(removeIndex - i, 1);
        });

        (0, _forEach3.default)(ejsCompilerResult, function (newModifiedFile) {
          modified.push(newModifiedFile);
        });
      }

      fisDeployNextEvent();
    }
  }
};

module.exports = exports['default'];