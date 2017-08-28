# fis3-deploy-i18n-ejs -- A FIS3 plugin to generate html file with i18n data on deploy stage.
[![npm](https://img.shields.io/npm/v/fis3-deploy-i18n-ejs.svg?style=flat-square)](https://github.com/tonyc726/fis3-deploy-i18n-ejs)
[![Build Status](https://travis-ci.org/tonyc726/fis3-deploy-i18n-ejs.svg?style=flat-square&branch=master)](https://travis-ci.org/tonyc726/fis3-deploy-i18n-ejs)
[![bitHound Code](https://www.bithound.io/github/tonyc726/fis3-deploy-i18n-ejs/badges/code.svg)](https://www.bithound.io/github/tonyc726/fis3-deploy-i18n-ejs)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg?style=flat-square)](https://github.com/facebook/jest)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)](https://github.com/tonyc726/fis3-deploy-i18n-ejs)

> Thanks for [fis3-deploy-i18n-template](https://github.com/foio/fis3-deploy-i18n-template)

在前端的工程构建工具[FIS3](http://fis.baidu.com/)发布阶段，将所有拥有`isHtmlLike: true`的文件包含的多语言标记替换成指定内容，并生成文件的插件。

## 使用说明
### 如何安装
```shell
yarn add fis3-deploy-i18n-ejs -D
# OR
npm install fis3-deploy-i18n-ejs -D
```

### 默认配置
```javascript
/**
 * @type {Object} DEFAULT_CONFIG - 插件默认配置
 * @property {string} [open='<%'] - ejs模板的起始标识符
 * @property {string} [close='%>'] - ejs模板的结束标识符
 * @property {string} [dist='i18n/$lang/$file'] - 编译后的输出路径，相对于release的根目录，其中`$lang`代表语言文件夹，`$file`代表编译的文件
 * @property {string} [templatePattern=''] - 需要做多语言处理文件subpath的glob规则，默认为所有html文件
 * @property {string} [defaultLangName=''] - 默认语言名字，如果匹配默认语言，该语言的输出将自动去除dist中的`$lang`部分
 * @property {string} [i18nPattern='translations/*.{js,json}'] - 多语言文件的glob规则
 * @property {string} [ignorePattern=''] - 需要忽略编译的glob规则
 * @property {string} [noKeepSubPathPattern=''] - 不需要保持原有目录结构输出的glob规则
 * @property {function} [onLangFileParse=noop] - 在读取多语言文件后的自定义处理函数，其返回值会与当前读取的文件内容合并
 */
{
  open: '<%',
  close: '%>',
  dist: 'i18n/$lang/$file',
  templatePattern: '',
  defaultLangName: '',
  i18nPattern: 'translations/*.{js,json}',
  ignorePattern: '',
  noKeepSubPathPattern: '',
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
}
```

## 参考示例
> 具体的实验可以参考这个项目[fis3-examples](https://github.com/tonyc726/fis3-examples)。

### 项目目录结构
```
# project root path
│
├── i18n-folder # 文件名及语言名
│   ├── en.json
│   ├── zh.json
│   └── ...
│
├── template-folder
│   ├── index.html
│   ├── ...
│   └── sub-folder
│       ├── detail.html
│       └── ...
│
├── fis-conf.js
│
└── package.json
```

### 配置`fis-conf.js`中`fis3-deploy-i18n-ejs`相关的内容
``` javascript
// ------ translations ------
fis.match('/i18n-folder/**', {
  release: false
});
// ------ templates ------
fis.match('/template-folder/(**)/(*.html)', {
  release: '/$1/$2'
});
// ------ deploy ------
fis.match('**', {
  deploy: [
    fis.plugin('i18n-folder', {
      open: '<%',
      close: '%>',
      dist: '$lang/$file',
      defaultLangName: 'zh',
      templatePattern: '',
      i18nPattern: 'i18n-folder/*.json',
      ignorePattern: '',
      noKeepSubPathPattern: '',
      onLangFileParse() {},
    }),
  ]
});
```

### `i18n-folder`中的文件内容示例
i18n-folder/en.json
```
{
    "hello": "hello",
    "world": "world"
}
```

i18n-folder/zh.json
```
{
    "hello": "你好",
    "world": "世界"
}
```

### `template-folder`待转换的模板文件夹
#### `template-folder/index.html`
```
<html>
<head>
    <meta charset="UTF-8">
    <title>index</title>
</head>
<body>
    <p><%= hello %></p>
    <p><%= world %></p>
</body>
</html>
```
#### `template-folder/sub-floder/detail.html`
```
<html>
<head>
    <meta charset="UTF-8">
    <title>detail</title>
</head>
<body>
    <p><%= hello %></p>
    <p><%= world %></p>
</body>
</html>
```

### 输出结果
#### 语言为`zh`的输出结果：
> 默认语言为`zh`，所以输出的文件去除`$lang`层级的目录，即

- `dist/index.html`
```
<html>
<head>
    <meta charset="UTF-8">
    <title>index</title>
</head>
<body>
    <p>你好</p>
    <p>世界</p>
</body>
</html>
```
- `dist/sub-folder/detail.html`
```
<html>
<head>
    <meta charset="UTF-8">
    <title>detail</title>
</head>
<body>
    <p>你好</p>
    <p>世界</p>
</body>
</html>
```

#### 语言为`en`的输出结果：
- `dist/en/index.html`
```
<html>
<head>
    <meta charset="UTF-8">
    <title>index</title>
</head>
<body>
    <p>hello</p>
    <p>world</p>
</body>
</html>
```
- `dist/en/sub-folder/detail.html`
```
<html>
<head>
    <meta charset="UTF-8">
    <title>detail</title>
</head>
<body>
    <p>hello</p>
    <p>world</p>
</body>
</html>
```

## 参考
- [node-project-kit](https://github.com/tonyc726/node-project-kit) - 快速创建项目的模板
- [glob](https://github.com/isaacs/node-glob) - 使用glob语法获取匹配文件的工具
- [ejs](https://www.npmjs.com/package/ejs) - 模板引擎

## License
Copyright © 2017-present. This source code is licensed under the MIT license found in the
[LICENSE](https://github.com/tonyc726/fis3-deploy-i18n-ejs/blob/master/LICENSE) file.

---
Made by Tony ([blog](https://itony.net))
