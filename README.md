# Water Lilies / 睡莲互动池塘

## Audio mechanic — first local commit (2026-10-27)

This is an IDEA9103 student assignment for non-commercial classroom collaboration. The audio module loads a 100-second recording, provides a Play/Pause button, and uses the song's level to change the existing 2D fish's speed (1–6×) and size (1–2.2×). It captures the fish's random base values once; its Perlin direction, drawing, and ripple response remain in the teammate's original `perlin-water-life.js`. The original seasonal timer remains independent in this first commit. Audio and seasons are connected in the next commit.

The sound is an OBS recording supplied by the student, edited from 7.2–107.2 seconds of the recording with short fades. Source: Robert Schumann, *Kinderszenen* Op. 15, performed by Anna Vinnitskaya, SWR Classic / ARD Klassik ([source video](https://www.ardmediathek.de/video/ard-klassik/schumann-kinderszenen-vinnitskaya/ard/Y3JpZDovL3N3ci5kZS9hZXgvbzE0ODU5MzY)). Attribution and non-commercial use do not establish a licence to redistribute the performance; keep the repository private and obtain permission or replace the recording before public release.

Student direction: music playback and a clear fish response. ChatGPT/Codex assisted with audio editing, the grouped `audio-mechanic.js` implementation, comments, and documentation. `loadSound`, `p5.Amplitude` and `getLevel` follow Week 10 Tutorial Part 1. `map`, `constrain` and `lerp` are course p5.js techniques. `pause()` and `loop()` are official p5.sound methods used as supplements. The bundled `p5.sound.min.js` is copied from the student's classroom pilot. The original team history remains below.

## 哲明第二周更新（2026-10-23）

鱼的水波响应已接入：按波纹的椭圆比例检查波前是否靠近鱼，每个水波只触发一次。random 决定转向强度、35–60 帧的持续时间和短暂加速；noise 连续调节转弯速率，响应随剩余时间衰减，结束后恢复基础游速。转向侧根据鱼朝向和扰动来源计算，正好同轴时随机选择。使用 dist、abs、sin/cos、random、noise、map、max、普通对象与循环，均在第 3/4、7、8、11 周范围内。未新增超纲 API。

本轮定向检查通过：波前到达触发、同一水波不重复触发、响应结束恢复、远处未到达的水波不触发；原四季输入集成检查也通过。`pondFish.disturbance` 现在由鱼响应函数维护，音乐接口仍为 0，尚未接入。

新增 `perlin-water-life.js`，仍属于哲明的 Perlin noise + randomness 机制。
点击空白水面或夏季拖动产生水波时，初始半径随机为短边的 0.008–0.024，基础速度随机为每帧 0.0025–0.0055；noise 连续调整速度倍率到 0.65–1.35。绘制与荷叶响应仍读取同一个 radius，避免视觉与响应脱节。组员原有 90 帧寿命和最多 12 个水波的限制保留。

新增一条水下鱼：random 设置出生位置、大小、速度、颜色和噪声起点；noise 连续改变方向，sin/cos 将方向转为移动坐标，并在边缘向内转向。鱼在荷叶下方绘制，缩放使用比例坐标。`pondFish.audioLevel` 为未来 0–1 音频输入接口，目前保持 0；`pondFish.disturbance` 已连接水波避让并随时间恢复为 0。R 仍仅重置组员的用户输入状态，不重新随机鱼。

课堂依据：第 3/4 周对象、函数、条件、循环；第 6 周 ellipse/triangle/circle/fill/constrain；第 8 周 random/noise/map/sin/cos/translate/rotate 与比例坐标。没有新库、向量、物理引擎或范围外 API。AI 辅助已在新脚本标注。

验证：运行后观察鱼游动；连续点击不同水面位置比较波纹初始大小与扩散速度；波纹应持续向外并消失，荷叶仍响应。四季、B/R、拖动和粒子交互需保留。已有浏览器集成检查通过，详细视觉效果仍可按团队演示需要调参。

## 本地整合更新（2026-10-23）

已保留组员 `user-input` 分支的提交历史，并将其独立预览版中的接入补丁应用到根目录项目。直接打开根目录 `index.html` 即可运行四季 + 用户输入版本，音频仍为空接口。以下第一周说明保留为阶段记录；当前交互以本节和[组员操作指南](Water-Lily-User-Input-v1/docs/user-input-guide-zh.md)为准。

- 春季：点击花朵开合；夏季：拖动睡莲；空白水面点击产生波纹。
- 秋季：按住收集附近落叶，松开留下叶簇；冬季：聚拢雪花、拖动留下雪迹。
- B：展开全部花朵；R：重置用户操作。底部按钮切换季节或暂停自动变化。
- 整合仅接入组员已有逻辑，修改根目录 input-controls.js、sketch.js、perlin-lilies.js、time-mechanic.js、index.html，保留原有作者及 AI 标注。独立预览文件夹保持不变。
- 本地浏览器验证通过：加载、B/R、夏季拖动与波纹、秋季聚叶、冬季雪迹、季节按钮、窗口缩放；无页面 JavaScript 异常。尚未全面验证触屏及所有极端交互。

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
