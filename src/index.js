/**
 * A FIS3 plugin to generate html file with i18n data in deploy stage
 * Copyright (c) 2017
 * All rights reserved
 *
 * Author: tonyc726@gmail.com
 */

import path from 'path';
import walk from 'walk';
import ejs from 'ejs';
import { merge, isFunction, noop, forEach } from 'lodash';

import converArrayStringToPropsObject from './utils/converArrayStringToPropsObject';
import matchByGlob from './utils/matchByGlob';

/**
 * @type {Object} DEFAULT_CONFIG - 插件默认配置
 * @property {string} [open='<%'] - ejs模板的起始标识符
 * @property {string} [close='%>'] - ejs模板的结束标识符
 * @property {string} [i18nDir='translations'] - 多语言文件目录，相对于项目根目录的路径
 * @property {string} [dist='i18n/$lang/$file] - 编译后的输出路径，相对于release的根目录，其中`$lang`代表语言文件夹，`$file`代表编译的文件
 * @property {string} [defaultLangName=''] - 默认语言名字，用户控制输出的目录结构
 * @property {string} [ignoreMatch=''] - 需要忽略编译的glob规则
 * @property {string} [notKeepOriginSubPathMatch=''] - 不需要保持原有目录结构输出的glob规则
 * @property {function} [onLangFileParse=noop] - 在读取多语言文件后的自定义处理函数，其返回值会与当前读取的文件内容合并
 */
const DEFAULT_CONFIG = {
  open: '<%',
  close: '%>',
  i18nDir: 'translations',
  dist: 'i18n/$lang/$file',
  defaultLangName: '',
  ignoreMatch: '',
  notKeepOriginSubPathMatch: '',
  /**
   * @desc 多语言文件处理函数
   * @param {string} i18nFileJSONClone - 语言文件内容(JSON格式)的拷贝对象
   * @param {string} fileLangName - 当前语言文件对应的语言名字
   * @param {string} defaultLangName - 默认语言名字
   * @return {object} 处理以后的文件内容
   *
   * @example
   * onLangFileParse(i18nFileJSONClone, fileLangName, defaultLangName) {},
   */
  onLangFileParse: noop,
};

/**
 * FIS3 deploy i18n plugin
 *
 * http://fis.baidu.com/fis3/docs/api/dev-plugin.html
 * @param {object} options - 插件配置
 * @param {object} modified - 修改了的文件列表（对应watch功能）
 * @param {object} total - 所有文件列表
 * @param {function} next - 调用下一个插件
 * @return {undefined}
 */
export default (options, modified, total, fisDeployNextEvent) => {
  const config = merge(DEFAULT_CONFIG, options);
  // eslint-disable-next-line no-undef
  const i18nResourcePath = path.join(fis.project.getProjectPath(), config.i18nDir);
  const langFilesWalker = walk.walk(i18nResourcePath, {
    followLinks: false,
    // directories with these keys will be skipped
    filters: ['.DS_Store'],
  });

  const i18nData = {};
  const defaultLangName = config.defaultLangName || null;

  langFilesWalker.on(
    'file',
    /**
     * @see https://www.npmjs.com/package/walk#api
     *
     * @param {string} root - the containing the files to be inspected
     * @param {object | array} stats - a single stats object or an array with some added attributes
     * @param {string} stats.type - 'file', 'directory', etc
     * @param {string} stats.name - the name of the file, dir, etc
     * @param {string} stats.error
     * @param {function} next - no more files will be read until this is called
     */
    (root, stats, nextWalkEvent) => {
      const langName = stats.name ? stats.name.replace(/\.(json|js)$/, '') : '';
      if (!langName || langName.length === 0) {
        // eslint-disable-next-line no-undef
        fis.log.error(`i18n(${stats.name}) fileName is error.`);
        nextWalkEvent();
      }

      // @see http://fis.baidu.com/fis3/api/fis.util.html#.readJson
      // eslint-disable-next-line no-undef
      const fileJSON = fis.util.readJSON(path.join(root, stats.name));

      if (isFunction(config.onLangFileParse)) {
        merge(fileJSON, config.onLangFileParse({ ...fileJSON }, defaultLangName, langName));
      }

      // 合并
      merge(
        i18nData,
        {
          [langName]: converArrayStringToPropsObject(
            // langPropsPathArray - 将path转换为Array形式，用于转换为多层级的PlainObject格式
            root.replace(i18nResourcePath, '')
              .replace(/^\//, '')
              .replace(/\/$/, '')
              .split('/')
              .filter((propPath) => (
                propPath && propPath.length !== 0
              )),
            fileJSON
          ),
        }
      );
      nextWalkEvent();
    }
  );

  langFilesWalker.on(
    'error',
    (root, stats) => {
      // eslint-disable-next-line no-undef
      fis.log.error('Walker is error');
      // eslint-disable-next-line no-undef
      fis.log.error(JSON.stringify(stats, null, 2));
    }
  );

  langFilesWalker.on(
    'end',
    () => {
      // ejs compile config
      const ejsCompilerOptions = {
        open: config.open,
        close: config.close,
      };
      const defaultLangNameRegExp = defaultLangName === null ? null : (new RegExp(`${defaultLangName}`, 'gi'));
      const ejsCompilerResult = [];
      const needRemoveIndexs = [];

      /**
       * @see http://fis.baidu.com/fis3/api/fis.file-File.html
       *
       * @param {string}  modifiedFile.ext - 文件名后缀
       * @param {string}  modifiedFile.filename - 文件名，没有后缀
       * @param {string}  modifiedFile.basename - 文件名
       * @param {string}  modifiedFile.realpath - 文件物理地址
       * @param {string}  modifiedFile.realpathNoExt - 文件物理地址，没有后缀
       * @param {string}  modifiedFile.subpath - 文件基于项目 root 的绝对路径
       * @param {string}  modifiedFile.subdirname - 文件基于项目 root 的绝对路径，仅文件夹目录
       * @param {string}  modifiedFile.subpathNoExt - 文件基于项目 root 的绝对路径，没有后缀
       * @param {string | boolean}  modifiedFile.release - 文件的发布路径，当值为 false 时，文件不会发布
       *
       * @example
       *
       * [{
       *   "ext": ".fileExt",
       *   "filename": "fileName",
       *   "basename": "fileName.fileExt",
       *   "realpath": "/projectRootPath/fileParentDirPath/fileName.fileExt",
       *   "realpathNoExt": "/projectRootPath/fileParentDirPath/fileName",
       *   "subpath": "/fileParentDirPath/fileName.fileExt",
       *   "subdirname": "/fileParentDirPath",
       *   "subpathNoExt": "/fileParentDirPath/fileName",
       *   "release": "/fileParentDirPath/fileName.fileExt",
       * }...]
       */
      modified.forEach((modifiedFile, modifiedFileIndex) => {
        if (
          modifiedFile.release !== false &&
          modifiedFile.isHtmlLike &&
          // 如果没有有过滤的正则，或者不符合过滤条件则进行i18n处理
          !matchByGlob(modifiedFile.subpath, config.ignoreMatch)
        ) {
          const fileCompiler = ejs.compile(modifiedFile.getContent(), ejsCompilerOptions);
          const distFilePath = matchByGlob(modifiedFile.subpath, config.notKeepOriginSubPathMatch) ?
            modifiedFile.basename :
            modifiedFile.release;

          forEach(i18nData, (langData, langName) => {
            const distPath = config.dist
              .replace(/^\//, '')
              .replace(/\/$/, '')
              .replace('$lang/', (
                (
                  // 如果没有默认语言或者不匹配默认语言，
                  // 则在文件输出路劲最外层加入`$lang/`的层级
                  defaultLangNameRegExp === null ||
                  !defaultLangNameRegExp.test(langName)
                ) ? `${langName}/` : ''
              ))
              .replace('$file', distFilePath.replace(/^\//, ''));
            // eslint-disable-next-line no-undef
            const distFile = fis.file(fis.project.getProjectPath(), distPath);
            distFile.setContent(fileCompiler(i18nData[langName]));

            // save compiled result
            ejsCompilerResult.push(distFile);
          });

          // save the remove index
          needRemoveIndexs.push(modifiedFileIndex);
        }
      });

      if (ejsCompilerResult && ejsCompilerResult.length !== 0) {
        forEach(needRemoveIndexs, (removeIndex, i) => {
          modified.splice(removeIndex - i, 1);
        });

        ejsCompilerResult.forEach((newModifiedFile) => {
          // 增加至 modified，用于deploy
          modified.push(newModifiedFile);
        });
      }

      // 由于是异步的如果后续还需要执行必须调用 fisDeployNextEvent
      fisDeployNextEvent();
    }
  );
};
