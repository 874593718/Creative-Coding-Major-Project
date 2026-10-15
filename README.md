# Water Lilies / 睡莲互动池塘

IDEA9103 Creative Coding Major Project — 第一次提交工作版。

## 概念与当前阶段

根据小组《睡莲互动项目统一工作方案》，以莫奈《睡莲》的平静水面为灵感，最终表现“平静 → 观众扰动 → 局部响应 → 恢复”的池塘。第一周只实现平静状态：蓝绿色水面、睡莲分布与缓慢自然漂动。使用基本几何图形重新组织画面，没有导入画作图片。

这是四次开发安排中的第一版，不是完成全部机制的最终作业。提供的 brief 没有说明四次提交的日期；具体日期与阶段要求按课程安排确认。

## 如何运行

下载或克隆整个仓库，双击 `index.html`，使用现代浏览器打开。所有当前运行资源均在仓库内，不需要安装 npm 或联网加载 CDN。也可用编辑器的静态服务器打开。

目前操作：观察睡莲慢慢漂动；调整窗口大小，布局保持。刷新页面会重新随机分布。点击和按键只进入预留函数，暂时没有交互反馈。没有音频、鱼或水波；这些是后续工作。

## 文件与分工

| 文件 | 职责 | 本阶段状态 |
| --- | --- | --- |
| `index.html` / `style.css` | 加载顺序与基础页面样式 | 完成 |
| `sketch.js` | 唯一 setup/draw/输入/缩放入口、共享数据和图层顺序 | 完成框架 |
| `perlin-lilies.js` | 哲明 Zheming Yu：Perlin noise + randomness | 第一周原型，AI 辅助，需本人理解审阅 |
| `audio-mechanic.js` | 音频机制接口 | 空框架，姓名和原设计待确认 |
| `time-mechanic.js` | 时间/事件机制接口 | 空框架，姓名和原设计待确认 |
| `input-controls.js` | 鼠标/键盘机制接口 | 空框架，姓名和原规则待确认 |

后三个文件按 brief 中剩余机制类型预留，不代表已经替组员确定具体功能或重新分工。请保留每个人原有设计，再填写姓名、触发规则、效果和需要的数据。空接口不是组员已完成的贡献。

## 代码如何工作

1. `setup()` 创建画布、保存尺寸，并调用各模块初始化函数。
2. `setupPerlinMechanic()` 随机选择四套配色之一、目标 58–68 片睡莲。在整个池塘随机选择位置，二维 noise 控制接纳概率，距离检查防止严重重叠，最后少量补点缩小较大的空白。若有限次数内没有合法位置则不强行插入。初始位置、尺寸、色彩、花朵开关和噪声起点都保存在数组里。
3. `updatePerlinMechanic()` 每帧小幅增加 `noiseTime`。`noise(seed + time)` 产生连续变化，`map()` 把 0–1 转成正负偏移，再叠加到初始位置上；不是每帧重新随机，也不是无限累加位移。
4. `setupWaterMarks()` 在初始化时生成 3750 个笔触对象：550 个大色块、两层各 1600 个细笔触。随机位置打破网格，二维噪声关联附近颜色，随机反光带组织明暗，`lerp()` 分别混合 RGB 通道。`drawPondWater()` 按顺序叠加半透明椭圆，表现水面短笔触和植物的纵向倒影。水面纹理保持静态，漂动来自睡莲。
5. `drawPerlinMechanic()` 遍历睡莲；`drawLily()` 绘制叶片、阴影和缺口；`drawLilyFlower()` 用旋转的椭圆组成花瓣。
6. `windowResized()` 只更新尺寸，不重新生成对象。`x/y` 使用比例坐标，睡莲大小与移动幅度按画布短边计算。

主要参数：`lilyCount` 在初始化时以 58–68 为目标，记录实际生成数量；`noiseSpeed = 0.003` 为每帧取样推进量；`driftAmount = 0.008` 为短边比例的最大偏移。`pondPalettes` 保存蓝紫、青绿、紫粉、暖绿四套配色。随机允许连续抽到同一色系，不承诺每次刷新都换色系；布局、数量、笔触仍重新生成。动画速度按帧计，在低帧率设备上会变慢；没有使用未核实的 deltaTime/millis。

2026-10-15 视觉修改说明见 [随机性与水面笔触解释](docs/painterly-water.md)。本次没有使用范围外技术。

## 组员怎样继续

每个模块有 `setup...Mechanic(state)`、`update...Mechanic(state)`、`draw...Mechanic(state)`，已由主程序调用。把初始化、状态变化、绘制分别写在对应函数中。模块变量使用明确前缀，避免全局命名冲突。

- 不要在个人文件重新声明 `setup()`、`draw()`、`mousePressed()`、`keyPressed()` 或 `windowResized()`。
- 绘制代码包在 `push()` / `pop()` 中，避免修改其他模块的颜色、旋转状态。只有水面函数清除背景。
- 输入负责人实现 `handleInputPressed(state, x, y)` 和 `handleInputKey(state, pressedKey)`，沿用原定交互规则。
- 音频负责人确认课程库版本后添加对应 `p5.sound` 文件及有来源记录的音频；如需 `preload()`，在主程序添加唯一入口并调用模块加载函数。播放放在已连接到真实点击的 `handleAudioPressed()` 中。当前没有音频依赖或资源。
- 时间机制可读取 `state.frame`（单位是帧），不能当成毫秒。`drawTimeMechanic()` 当前位于水面上、睡莲下；实际图层按组员原设计调整。

共享 `pond` 包含 `width/height/unit`（像素）、`frame`（帧数）与 `ripples`（当前空数组）。未来水波格式建议为 `{x, y, radius, strength, age}`：`x/y` 为画布比例，`radius` 为短边比例，`strength` 为 0–1，`age` 为帧数。输入负责人统一创建、推进和清理水波，并限制数量；其他模块只读取。

睡莲坐标仅由 `updatePerlinMechanic()` 写入。未来水波响应在这里与噪声偏移合并，避免两个模块轮流覆盖位置。目前尚未实现水波读取或响应；鱼的行为和归属也尚未指定。

## 四次开发建议

| 次数 | 哲明个人内容 | 团队工作 |
| --- | --- | --- |
| 1（本次） | 噪声与随机基础画面、连续漂动、缩放适配 | 主程序与模块接口 |
| 2 | 调整分布、色彩、运动参数并解释取样逻辑 | 各成员实现原定机制，确认共享数据 |
| 3 | 接收水波局部偏移，与基础漂动合并 | 联调传播、响应、衰减与恢复 |
| 4 | 调整视觉、检查运行表现、补齐个人说明 | 完整演示、引用、资源、README 和提交检查 |

brief 要求每位成员在初始化以外至少三次有意义的 Git commits。四次工作安排不自动等于满足要求。各成员应在真实完成本人工作后提交，不代填贡献、不虚构历史。本版由哲明统一提交框架及个人原型，其他成员的机制仍需各自完成并提交。

## 课堂技术与来源

详见 [技术范围与 API 清单](docs/course-scope.md)。范围来自用户提供的 `IDEA9103_AI代码范围.pdf`，并核对同目录的 `IDEA9103_课堂代码摘录.md`。这些是整理材料，不是教师发布的官方白名单；代码仅选用其“已核实范围”。

- 第 3/4 周：函数、数组、对象、条件和循环。
- 第 6 周：p5 生命周期、绘图和输入回调。
- 第 8 周：random/noise、数值映射、比例坐标、变换、窗口适配。
- 摘录 `W08-T-C01` / `W08-T-C02` 展示随机数、噪声与数组保存；此处借鉴技术概念，重新编写为池塘设计，没有逐字复制课堂示例。

依赖：本地 `libraries/p5.min.js` 为 p5.js **1.11.11**，来自 [固定版本发布文件](https://cdn.jsdelivr.net/npm/p5@1.11.11/lib/p5.min.js)，许可见 `libraries/p5-LICENSE.txt`。课堂材料只引用本地 `libraries/p5.min.js`，未明确版本，因此本版本不宣称与课程一致；拿到课程模板后应核对并统一。库内部代码不是学生自写代码的范围，范围核对针对本项目自写脚本使用的 API。

新增资源仅为上述库及许可证；没有图片、字体、音频或其他第三方代码。莫奈作品名称来自小组方案；最终汇报需补充小组实际选用画作的名称、年份及馆藏链接，当前不猜测具体版本。

## AI acknowledgement

ChatGPT/Codex assisted with the initial project structure, Week 1 Perlin noise prototype, comments, documentation and browser checks. The generated code stores random starting values once, samples continuous noise for bounded lily movement, and uses normalized coordinates for resizing. The other three mechanics are empty integration hooks. The students must review, understand and adapt this work; these files do not establish completed contributions by other team members. AI assistance is also identified in each authored source file.

## 手动验收

1. 断网后打开 `index.html`：出现池塘和睡莲，开发者控制台无报错。
2. 观察 10 秒：睡莲缓慢漂动，数量不增长，画面不逐帧随机闪烁。
3. 改成横屏、竖屏、小窗口：画布适配窗口，睡莲原始布局不被重新抽签。
4. 连续点击并按键：目前无水波/声音，这是空接口的预期行为，控制台不应报错。
5. 修改一个模块时，只在该文件内增加实现，再检查其他模块是否仍正常。

本次已通过本地 Edge 自动浏览器检查：加载、动画变化、数量稳定、390×844 / 1400×650 / 240×240 缩放保留基础坐标、输入空接口、零 JavaScript 页面异常。已检查 1100×780 截图。测试工具位于开发环境，不是网页依赖，也没有添加到提交项目。最终四机制集成与音频尚未测试，因为尚未实现。
