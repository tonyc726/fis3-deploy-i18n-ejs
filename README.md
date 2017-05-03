#fis3-deploy-i18n-template
A i18n deploy plugin for [fis3](http://fis.baidu.com/) using [ejs](https://www.npmjs.com/package/ejs)

> Thank [fis3-deploy-i18n-template](https://github.com/foio/fis3-deploy-i18n-template)

## Usage

### i18n

```
src
├── i18n-folder-name
│   ├── en.json
│   ├── zh.json
│   └── ...
│ 
├── template-folder
│   ├── index.tpl
│   ├── ...
│   └── keep-parent-floder
│       ├── detail.tpl
│       └── ...
│ 
├── fis-conf.js
│ 
└── package.json
```

### fis-conf.js

``` javascript

fis.match('*.tpl',{
    isHtmlLike: true
});

fis.match('**', {
    deploy: [
        fis.plugin('i18n-template', {
        open: '<%',
        close: '%>',
        i18n: 'i18n-folder-name',
        default: 'zh', // 新增默认语言配置项
        dist: 'html/$lang/$file',  //destination: $lang(en,zh....),$file
        keepParentDirectoryList: ['keep-parent-floder'] // 新增保留父级目录结构的关键字清单
        langFileWalkerProcess: (langFileContent, langDefault, langFileName) => {...}
    }),
    fis.plugin('local-deliver'),
    ]
});
```

## Example

### i18n-folder-name

> V0.2.* 以上版本，升级了i18n-folder的规则，可以根据子文件的形式生成JSON。

- i18n-folder-name/en.json

```
{
    "hello": "hello",
    "world": "world"
}
```

- i18n-folder-name/zh.json

```
{
    "hello": "你好",
    "world": "世界"
}
```

### template-folder

- template-folder/index.tpl
- template-folder/keep-parent-floder/detail.tpl

```
<html>
<head>
    <meta charset="UTF-8">
    <title>index.html</title>
</head>
<body>
    <p><%=hello%></p>
    <p><%=world%></p>
</body>
</html>
```

### output
- dist/html/en/index.html

```
<html>
<head>
    <meta charset="UTF-8">
    <title>index.html</title>
</head>
<body>
    <p>hello</p>
    <p>world</p>
</body>
</html>
```

- `default: zh`    // 默认语言输出文件去除 `$lang` 层级的目录
- dist/html/index.html

```
<html>
<head>
    <meta charset="UTF-8">
    <title>index.html</title>
</head>
<body>
    <p>你好</p>
    <p>世界</p>
</body>
</html>
```

- `keepParentDirectoryList: ['keep-parent-floder']`    // 保留 `keep-parent-floder` 这个目录结构
- dist/html/keep-parent-floder/detail.html
- dist/html/en/keep-parent-floder/detail.html

```
<html>
<head>
    <meta charset="UTF-8">
    <title>detail.html</title>
</head>
<body>
    <p>你好</p>
    <p>世界</p>
</body>
</html>
```

## More

Since we using [ejs](https://www.npmjs.com/package/ejs) as the template engin, any syntax supported by ejs is supported by this plugin.
