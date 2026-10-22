# Water Lily Pond — Four-season User Input v1

这份版本在你提供的团队项目上实现四季 User Input，保留原有四季、池塘和噪声漂动。沿用团队当前的代码绘制画面，没有改回先前的原画 Demo。

## 运行和操作

解压完整项目，用浏览器打开 `index.html`，或通过 Live Server 打开。不需要 npm。`libraries/p5.min.js` 已包含，保持文件夹结构即可。

演示时先点击 **Auto: On** 关闭自动切季，再用季节按钮选择：

- **Spring**：Hover 高亮；点击带花荷叶开合，途中再点可反向。
- **Summer**：按住拖动荷叶，花随叶移动，沿途产生水波；松手留在新位置继续漂动。
- **Autumn**：按住并慢慢经过落叶，聚拢后拖动，松手留下水面叶簇。
- **Winter**：按住聚雪并拖动，留下短暂雪迹；松手散开并继续下落。
- **共同操作**：点击空白水面产生水波，附近荷叶受到轻微影响。
- **B / b**：所有花朵目标设为展开。秋冬仍遵循原来的季节外观，不强制出现花朵。
- **R / r**：逐渐闭花、恢复荷叶原基础位置，清除本次抓取、水波、落叶簇与雪迹。

标题和底部按钮区预留给界面。聚叶/聚雪只收集附近实际存在的对象；在对象经过的位置稍停，效果更明显。

## 本次新增范围

主要逻辑：`input-controls.js`。

少量标注 `USER INPUT adapter` 的连接位于 `sketch.js`、`perlin-lilies.js`、`time-mechanic.js`；`index.html` 增加操作说明。音频模块保持原样。

你的输入模块提供状态和偏移，位置更新在组员现有更新函数里合并；季节大小与单花开合分别保存，避免彼此覆盖。

## 阅读材料

- [中文操作和核心代码解释](docs/user-input-guide-zh.md)
- [你的新增代码课程技术对照](docs/user-input-course-check.md)
- [本轮改动补丁](docs/user-input-integration.patch)
- [实际浏览器检查结果](docs/user-input-test-results.json)
- 团队原始 README 归档于 `docs/team-readme-original.md`，其中的“输入空框架”等描述属于修改前状态。

## 技术与署名

User Input 使用课程已有的变量、函数、对象、数组、循环、条件判断、鼠标/键盘事件、基础图形和坐标变换。没有新增图像处理、物理引擎、框架、noise、random 或自动调度。没有依赖 lerp、splice 或第四个 alpha 参数；课程依据和替代方案见技术对照表。

以上核对只针对本次新增代码，不声称整个团队程序都在 Week 1–8 内。队友已有的库、季节和噪声代码保留其原来的技术与署名。

ChatGPT/Codex assisted with the User Input module, integration adapters, course-scope checking, tests and documentation. AI assistance is also acknowledged in the source. The student must review and understand the implementation.

本版本没有推送 GitHub、合并主分支或替任何人生成个人提交记录。

## 实际限制

手动拖动允许荷叶重叠；聚拢和散开采用固定步长及坐标排列，不是物理模拟；较低帧率会让动作变慢。四季变化可能隐藏花朵或荷叶。自动切季会结束当前抓取，并清理旧季节的叶簇与雪迹。当前验证以鼠标、键盘和桌面浏览器为主。
