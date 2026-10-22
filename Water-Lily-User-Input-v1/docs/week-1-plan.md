# 第一次提交实施与验收计划

后续更新：2026-10-15 已按视觉反馈将固定 22 片睡莲改为 16–38 片聚集分布，水面改为保存的不规则笔触；下面保留初版计划记录。当前实现以 README 与 painterly-water.md 为准。

目标：使用给定课程范围搭建可运行的 p5.js 池塘，为哲明的 Perlin noise 与 randomness 机制完成第一周原型。

架构：普通 script 标签按顺序加载文件；sketch.js 独占 p5 生命周期与事件入口。机制脚本使用普通函数和对象，不使用模块导入或构建工具。

技术：基础 HTML/CSS、JavaScript、p5.js。范围依据为用户提供的 IDEA9103_AI代码范围.pdf。四次提交为工作安排，并非从 brief 推导出的强制里程碑。

实施步骤：

- [x] 创建 index.html、style.css 和本地 p5 库，使页面可离线打开。
- [x] 创建 sketch.js，依次调用三个组员接口和哲明的噪声模块；集中处理窗口调整、鼠标和键盘入口。
- [x] 创建 perlin-lilies.js：初始化时生成 22 个睡莲对象，以归一化坐标保存位置；每帧由一维 noise 计算小幅偏移；二维 noise 控制水面色块。
- [x] 创建 audio-mechanic.js、time-mechanic.js、input-controls.js 的空接口，不实现组员的设计，不声明其姓名和贡献。
- [x] README 写清运行方式、阶段边界、AI 协助、来源、接口协议、课堂范围与四次提交建议。
- [x] 浏览器验证：初次打开无错误；运行数秒后位置变化而对象数不变；resize 保留基础坐标；极小/横竖屏无异常；点击与按键空接口不报错；离线资源齐全。

接口约定：pond 保存 width、height、unit、frame 和 ripples。width/height/unit 为像素，frame 为绘制帧数，非真实秒数。未来 ripples 的 x/y/radius 使用相对于画布/短边的比例，strength 为 0–1，age 为帧数。数组的创建、更新、清理由输入机制负责人统一维护。第一周所有接收者均不修改该数组。

睡莲位置的唯一写入者为 updatePerlinMechanic；将来需要加入水波偏移时，在该函数合并基础位置、noise 偏移和波纹响应，其他模块不要覆盖睡莲坐标。
