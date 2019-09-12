## 自动探测资源

为了方便用户使用 recore，在工具层做了资源自动探测的功能。为此，我们需要约定项目开发的目录。

我们约定所有页面必须在文件目录夹中(这里区别于组件)，即如下形式：

```txt
- awesome-page/
  - awesome-page.vx          # 页面入口，视图文件
  - awesome-page.[js|ts]     # 视图控制器
  - awesome-page.[less|css]  # 样式（可选）
  - router.[js|ts]           # 子路由配置（可选）
  - pages/                   # 子页面（可选）
```


目前主要支持如下文件格式的探测

### 探测视图文件(.vx)

注：探测 app.vx 的逻辑是在 boot 部分，在这里不赘述。

探测列表：index.vx, awesome-page.vx

### 探测路由文件(router.js, router.ts)

探测列表：router.js, router.ts

### 探测控制器文件(.js, .ts)

探测列表: index.js, index.ts, awesome-page.js, awesome-page.ts, same-as-vx.ts

### 探测样式文件(.less, .css)

注：暂不支持 sass 文件

探测列表：index.less, index.css, awesome-page.less, awesome-page.css, same-as-vx.ts

### 探测具体资源(.tsx, etc)

探测具体的文件资源
