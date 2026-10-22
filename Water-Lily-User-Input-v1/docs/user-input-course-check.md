# 你的 User Input：课程技术核对

本表只核对本次新增的 User Input 代码及适配行，不替组员原有代码作范围保证。依据为实际上传的 Week 1–8 Lecture / Tutorial，不把队友整理的范围文档当成教师官方白名单。

| 本次使用的技术 | 实际课程依据 | 用途 |
| --- | --- | --- |
| let、数值、布尔值、字符串、四则运算与赋值 | Week 2 Canvas Slides / Lecture | 位置、进度、开关和计数 |
| function、参数、return、函数调用 | Week 3 Lecture 的 computeArea 示例与函数拆分 | 按功能组织输入模块 |
| 对象、属性、数组、索引、length、嵌套数组 | Week 3 Canvas 的 Objects / Arrays | inputHand、荷叶状态、颜色和效果列表 |
| if/else、比较、&&、||、!、for、取余 | Week 4 Lecture / Tutorial；Week 8 Tutorial 亦有取余示例 | 命中检测、状态转换、循环复用 |
| mouseX、mouseY、mousePressed、keyPressed、key | Week 6 Canvas Interaction；Week 6 Tutorial 键盘 1/2 示例 | 鼠标位置、按下与 B/R |
| mouseReleased | Week 6 Lecture 的 image10 截图明确列出 mouseReleased() | 区分点击/拖动，释放落叶和雪 |
| dist | Week 7 Tutorial 的图像分段示例，计算 segment 与鼠标距离 | 鼠标到对象的距离 |
| 数组 push / pop | Week 7 Canvas 的 Push / Pop 示例 | 保存、保留和限制效果对象 |
| fill(r,g,b)、stroke(r,g,b)、strokeWeight、noFill、noStroke | Week 6 Lecture 的颜色与 Styling functions | RGB 颜色、线条与轮廓 |
| ellipse、circle | Week 6–7 的基础图形示例；Week 8 Tutorial 的形状示例 | 水波、高亮、花瓣、雪迹 |
| push / pop（绘图状态）、translate、rotate、sin、cos | Week 8 Tutorial 的 DotAnimator 示例 | 花瓣角度、聚拢对象的松散排列 |
| 全局变量与局部变量 | Week 6 Canvas 的 Scope 内容 | 跨帧状态与函数临时计算 |

## 新效果是基础技术的组合应用

- 点击和拖动：记录按下坐标，用 dist 比较位移；超过 6 像素当作拖动。松开时再决定是否开花。
- 开花：每朵花保存 inputBloom 和 inputTarget，当前值每帧加减 0.5；用同一组椭圆改变排列角度。
- 让开和回位：用距离判断附近荷叶，普通乘除计算方向，固定步长接近目标偏移。
- 拖荷叶：把鼠标位置写入基础位置，保留最初抓取点到荷叶中心的偏移。
- 聚落叶/雪：用数组保存被选中的原有对象，用普通坐标加减让它们跟随。
- 聚拢排列：sin/cos 将对象摆在一小团松散位置；不是力场或粒子物理算法。
- 水波：每帧增加半径、减少强度；画基础椭圆。其他模块读取同一份水波字段。
- 雪迹：小椭圆逐渐缩小、颜色对比减弱，然后从数组移除。

自定义函数名称是本项目自己取的，并不意味着引入了新 API。它们内部只组合上表中的基础技术。

## 没有明确依据时的处理

- 不使用 lerp、constrain、map 或 p5.Vector 实现你的逻辑；固定步长和边界判断全部使用 if。
- 没有找到 splice 的明确调用依据，改为循环建立保留列表，再用 push；数量上限使用循环和 pop。
- 本次没有依赖 fill/stroke 的第四个 alpha 参数。高亮、水波和雪迹用三通道 RGB 算术改变对比度，配合尺寸变化和移除。
- 不使用 mouseIsPressed、事件监听器、拖放库；用已经确认的按下/松开事件记录布尔状态。
- 不使用 shader、WebGL、像素处理、碰撞库、物理引擎、Promise、async/await、fetch、箭头函数或高级数组方法。
- 不使用 noise / random / 音频分析 / 定时器驱动你的机制。动画是在用户输入之后逐帧执行，季节切换保留在队友的时间模块。

## 核对边界

Time-based 和 Perlin 文件里保留了组员原本已有的 lerp、random、noise 等代码；本表没有声称这些代码均在 Week 1–8 内。你新增的连接行只调用本模块函数、读取返回的对象属性和做基本算术。

HTML 修改仅为三行操作说明。自动浏览器检查脚本属于开发工具，不在交付的学生网页中执行，也不作为你的课程技术成果。
