# 自写代码技术范围核对

依据：用户提供的《IDEA9103_AI代码范围.pdf》，2026-10-14 整理；同时检查同目录课堂代码摘录。以下页码是该范围 PDF 的页码。没有对应代码块编号时只写已确认周次，不编造源编号。

| 功能 | 自写代码所用 API / 语法 | 范围依据 |
| --- | --- | --- |
| 页面加载 | HTML、外部 stylesheet、script src；基础 CSS | 第 1/2 周，页 2–3 |
| 状态与模块 | let、对象、点号访问、数组、length、function、参数、调用 | 第 2/3 周，页 3–4 |
| 控制流程 | for、if、比较、&&、四则运算、+=、++ | 第 2/4 周，页 3、5 |
| 数组添加 | lilies.push(object) | 第 7 周，页 8；W08-T-C01/02 亦使用数组 push |
| p5 入口 | setup、draw、createCanvas、width、height | 第 6 周，页 7 |
| 事件转发 | mousePressed、mouseX、mouseY、keyPressed、key | 第 6 周，页 7 |
| 图形与颜色 | background、fill（含 alpha）、stroke、strokeWeight、noStroke、ellipse、triangle、line、circle、text | 第 6/7 周，页 7–8 |
| 自然分布 | random、noise(t)、map | 第 6/8 周，页 7、9；W08-T-C01/02 支持 random/noise 与数组概念 |
| 空间色块 | noise(x,y) | 第 8 周，页 9，指向课程 Week 11 - Canvas.pdf 第 51–52 页；不杜撰代码块编号 |
| 变换与样式隔离 | push、pop、translate、rotate、angleMode、DEGREES | 第 8 周，页 9 |
| 字号与范围 | textSize、constrain | 第 6/8 周，页 7、9 |
| 尺寸与帧 | windowWidth、windowHeight、windowResized、resizeCanvas、min、frameCount | 第 8 周，页 9 |
| 随机整数与配色索引 | Math.floor、嵌套数组与数组下标 | 第 3 周，页 4 |
| 反光带与 RGB 混色 | abs、lerp（分别插值三个数字通道） | 第 11 周，页 12 |

自定义函数都只是组合上表的技术：

- `updatePondSize`：更新尺寸和短边；`drawWeekOneLabel`：说明当前阶段。
- `setupPerlinMechanic`：初始化随机对象；`updatePerlinMechanic`：更新连续偏移。
- `setupWaterMarks`：生成并保存不规则色块与笔触；使用 random、二维 noise、abs 和 lerp，没有使用图像滤镜或着色器。
- `drawPondWater`：二维噪声色块；`drawPerlinMechanic`：遍历睡莲；`drawLily` / `drawLilyFlower`：图形组合。
- `setup/update/drawAudioMechanic`、`handleAudioPressed`：空音频接口。
- `setup/update/drawTimeMechanic`：空时间接口。
- `setup/update/drawInputMechanic`、`handleInputPressed`、`handleInputKey`：空输入接口。

未使用：箭头函数、解构、展开、数组 map/filter/reduce/forEach、Promise、async/await、fetch、import/export、框架、shader、p5.Vector、像素处理、millis、deltaTime、randomSeed。没有构建系统或复杂继承。

尚需核实：课程 p5.js 的确切版本。本项目暂固定 1.11.11；后续音频版本和资源需与课程模板匹配。没有其他待补依据的自写 JavaScript API；HTML meta/语言属性属于页面元信息，不承担交互逻辑。

分布修订：`addLily` 保存睡莲对象；`nearestLilyDistance` 和 `lilyPositionIsClear` 使用第 7 周 dist、第 8 周 min 及普通循环。第 4 周 break 用于结束有上限的尝试。二维 noise 控制随机候选的接纳概率，最后选择较空的候选补点；没有网格、物理引擎或范围外 API。
