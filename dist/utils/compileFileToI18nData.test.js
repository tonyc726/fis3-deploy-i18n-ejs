"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _pick2 = _interopRequireDefault(require("lodash/pick"));

var _path = _interopRequireDefault(require("path"));

var _compileFileToI18nData = _interopRequireDefault(require("./compileFileToI18nData"));

var _en = _interopRequireDefault(require("./__mock__/en.json"));

var _zh = _interopRequireDefault(require("./__mock__/zh.json"));

const MOCK_DATA = {
  en: _en.default,
  zh: _zh.default
};
test('default config', () => {
  expect((0, _compileFileToI18nData.default)()).toEqual({});
});
test('set pattern without glob rules', () => {
  expect((0, _compileFileToI18nData.default)('\\*.json')).toEqual({});
});
test('set pattern "{,!(node_modules)/**/}*.json", but without cwd', () => {
  expect((0, _compileFileToI18nData.default)('{,!(node_modules)/**/}*.json')).toHaveProperty('package');
  expect((0, _compileFileToI18nData.default)('{,!(node_modules)/**/}*.json')).toHaveProperty('en');
  expect((0, _compileFileToI18nData.default)('{,!(node_modules)/**/}*.json')).toHaveProperty('zh');
});
test('set pattern "{,!(node_modules)/**/}*.{json,js}", with cwd "path.join(__dirname, \'__mock__\')"', () => {
  expect((0, _compileFileToI18nData.default)('{,!(node_modules)/**/}*.{json,js}', _path.default.join(__dirname, '__mock__'))).not.toHaveProperty('package');
  expect((0, _compileFileToI18nData.default)('{,!(node_modules)/**/}*.{json,js}', _path.default.join(__dirname, '__mock__'))).toHaveProperty('en');
  expect((0, _compileFileToI18nData.default)('{,!(node_modules)/**/}*.{json,js}', _path.default.join(__dirname, '__mock__'))).toHaveProperty('zh');
});
test('set pattern "{,!(node_modules)/**/}*.{json,js}", with cwd "path.join(__dirname, \'__mock__\')"', () => {
  expect((0, _compileFileToI18nData.default)('{,!(node_modules)/**/}*.{json,js}', _path.default.join(__dirname, '__mock__'))).toEqual(MOCK_DATA);
});
test('set pattern "{,!(node_modules)/**/}*.{json,js}", cwd "path.join(__dirname, \'__mock__\')", defaultLangName "en" and remove the defaultLangName data\'s prop[title].', () => {
  expect((0, _compileFileToI18nData.default)('{,!(node_modules)/**/}*.{json,js}', _path.default.join(__dirname, '__mock__'), 'en', (fileJSON, defaultLangName, fileName) => fileName === defaultLangName ? (0, _pick2.default)(fileJSON, ['subdir.name']) : fileJSON)).not.toHaveProperty('en.title');
});