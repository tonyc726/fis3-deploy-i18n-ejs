"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/splice"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));

var _isEmpty2 = _interopRequireDefault(require("lodash/isEmpty"));

var _forEach2 = _interopRequireDefault(require("lodash/forEach"));

var _noop2 = _interopRequireDefault(require("lodash/noop"));

var _isString2 = _interopRequireDefault(require("lodash/isString"));

var _merge2 = _interopRequireDefault(require("lodash/merge"));

var _ejs = _interopRequireDefault(require("ejs"));

var _isGlob = _interopRequireDefault(require("is-glob"));

var _compileFileToI18nData = _interopRequireDefault(require("./utils/compileFileToI18nData"));

const DEFAULT_CONFIG = {
  open: '<%',
  close: '%>',
  dist: 'i18n/$lang/$file',
  templatePattern: '',
  defaultLangName: '',
  i18nPattern: 'translations/*.{js,json}',
  ignorePattern: '',
  noKeepSubPathPattern: '',
  onLangFileParse: _noop2.default
};

var _default = (options, modified, total, fisDeployNextEvent) => {
  var _context, _context2;

  const config = (0, _merge2.default)(DEFAULT_CONFIG, options);
  const defaultLangName = config.defaultLangName || null;

  if (!(0, _isGlob.default)(config.i18nPattern) || !(0, _isString2.default)(config.dist) || (0, _indexOf.default)(_context = config.dist).call(_context, '$lang') < 0 || (0, _indexOf.default)(_context2 = config.dist).call(_context2, '$file') < 0) {
    fis.log.warn('fis3-deploy-i18n-ejs: wrong configurations.');
    fisDeployNextEvent();
  } else {
    const i18nData = (0, _compileFileToI18nData.default)(config.i18nPattern, fis.project.getProjectPath(), defaultLangName, config.onLangFileParse);

    if ((0, _isEmpty2.default)(i18nData)) {
      fis.log.warn("fis3-deploy-i18n-ejs: can't found i18n files.");
      fisDeployNextEvent();
    } else {
      const ejsCompilerOptions = {
        open: config.open,
        close: config.close
      };
      const defaultLangNameRegExp = defaultLangName === null ? null : new RegExp(`${defaultLangName}`, 'gi');
      const ejsCompilerResult = [];
      const needRemoveIndexs = [];
      (0, _forEach2.default)(modified, (modifiedFile, modifiedFileIndex) => {
        if (modifiedFile.release && (!(0, _isGlob.default)(config.templatePattern) ? modifiedFile.isHtmlLike : fis.util.glob(config.templatePattern, modifiedFile.subpath)) && (!config.ignorePattern || !(0, _isGlob.default)(config.ignorePattern) || !fis.util.glob(config.ignorePattern, modifiedFile.subpath))) {
          const fileCompiler = _ejs.default.compile(modifiedFile.getContent(), ejsCompilerOptions);

          const distFilePath = fis.util.glob(config.noKeepSubPathPattern, modifiedFile.subpath) ? modifiedFile.basename : modifiedFile.release;
          (0, _forEach2.default)(i18nData, (langData, langName) => {
            const distPath = config.dist.replace(/^\//, '').replace(/\/$/, '').replace('$lang/', defaultLangNameRegExp === null || !defaultLangNameRegExp.test(langName) ? `${langName}/` : '').replace('$file', distFilePath.replace(/^\//, ''));
            const distFile = fis.file(fis.project.getProjectPath(), distPath);
            distFile.setContent(fileCompiler(i18nData[langName]));
            ejsCompilerResult.push(distFile);
          });
          needRemoveIndexs.push(modifiedFileIndex);
        }
      });

      if (ejsCompilerResult && ejsCompilerResult.length !== 0) {
        (0, _forEach2.default)(needRemoveIndexs, (removeIndex, i) => {
          (0, _splice.default)(modified).call(modified, removeIndex - i, 1);
        });
        (0, _forEach2.default)(ejsCompilerResult, newModifiedFile => {
          modified.push(newModifiedFile);
        });
      }

      fisDeployNextEvent();
    }
  }
};

exports.default = _default;
module.exports = exports.default;