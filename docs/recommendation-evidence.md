# 球鞋推荐依据与边界

更新：2026-10-05。本站提供试穿候选，不提供大众适配概率，也不承诺任何鞋款必然合脚。

## 第 16 版二次复核

17 款均核对了目录与主要官方配置资料。这是资料复核，不是本站对 17 款鞋做过实物测试。五维分数仍是编辑参考，不能验证大众适配率。此前将“大体重中锋必须优先匹配 C 标签”的程序断言取消：位置标签本身也属编辑判断，不是实测适配条件。

- 修正 808 6 Ultra 重复科技字符，保留双密度主体与局部后跟嵌件边界，不当成两块全掌泡棉。
- Ja 4、Book 2、KD19 官方写明 Snug，对宽前掌降低优先级并提醒核对；不称为已实测窄楦。KD19 官方尺码偏小，按当地尺码表试穿，不统一建议加码。
- WOW 12 补 Coming Home 官方 330 g / 男 US 9.5 单鞋。MB.06 补同款 313624-01 的日本官方约 440 g / 27 cm，原页没有明确单/双鞋口径；不能冒充统一 US 9 单鞋实测。
- 不同尺码或称重口径不做“哪双更轻”结论，也不据此改编辑轻量分。
- Gamma 2 完整销售版本和关键配置未核实，降低候选优先级；未来新款的品牌介绍不等于真实外场使用证据。
- 体重由 65/85 kg 分段跳变改成连续编辑权重；这个变化只消除人为边界，不意味着权重经过人群研究验证。
- 降低位置标签排序影响。NBA 模板与球鞋品牌、签名球星不绑定；不会因为模板是欧文就自动推荐欧文鞋。
- 所有外场结果明确“场地适配待核实”，没有同版本、同条件证据时不使用“已适合”或性能保证。

### 逐款官方资料核对记录

|款式|已核对配置与限制|
|---|---|
|WOW 12|Coming Home 双层超䨻、纵向碳板、GCU；不混 LUX/AAPE|
|Kobe 6 Protro|IQ3902-002 前掌 Zoom Turbo、Cushlon、TPU 后跟；不加未确认碳板|
|Sabrina 4|IX5223-001 TPU FlyPlate、Cushlon 3.0、前掌 Zoom；发售日来源改为 Nike release info|
|Ja 4|IM4135-001 SPRPWR、Cushlon 3.0、JA-Frame；Snug 不等于实测窄楦|
|Book 2|FZ7013-500 前掌 Zoom、Cushlon 3.0；Snug 提醒|
|Gamma 2|官方财报确认超䨻、Carbon Core；完整版本与外底仍未核实|
|KD19|IH1117-800 全掌 Strobel、Cushlon 3.0、中足与 TPU 支撑；重量来源锁定 SKU，尺码偏小|
|Air Jordan 41|ZoomX、全掌 Strobel、后跟 Zoom、碳纤维与 TPU 支撑、HART；不由 HART 推断外场寿命|
|KAI 3|官方 CNY 全掌氮科技、中足碳板、TPU 侧墙；楦宽与重量未验证|
|808 6 Ultra|双密度超䨻、后跟 LIGHT FOAM ULTRA、中足碳板、前掌 TPU、GCU；不是两块全掌泡棉|
|Harden 10|LIGHTBOOST、Conforming Cuff、多向纹路；独立重、窄、外场限制保留|
|Luka 5|Strobel、Cushlon 3.0、IsoPlate、ISOband；不称已确认碳板|
|LeBron 23|抽取式 ZoomX、碳纤维支撑、Crown、同款约 460 g / US 9；不增画未明确气垫|
|Freak 8|ReactX、强化后跟、合成鞋面；不补未公开气垫或碳板|
|G.T. Cut 1|CZ0175-600 原版 React、Strobel、后跟 Zoom；不混 EP 或复刻鞋|
|MB.06|313624-01 抽取中底、TPU 侧墙；不借用前代 NITRO|
|AE 2|LIGHTBOOST、Lightstrike、Propulsion Plate、Articulated Fangs；板不称碳板，独立重量仅测试样鞋|

每款源链接保留在 src/catalog2026.json 的 specs / layers / weight / fit / releaseSource 字段，并显示在网站档案中。

### 15 位 NBA 动作参考

保留欧文、库里、杜兰特、詹姆斯、字母哥、约基奇、东契奇、哈登；新增亚历山大、爱德华兹、伦纳德、汤普森、戴维斯、罗德曼、布伦森。9 种打法 × 6 个位置（含不限位置）对应 54 个可解释的编辑映射，15 位均可触发，不是无法出现的占位。

篮板侧翼/不限位置以罗德曼为动作参照，中锋篮板以戴维斯为参照；小钢炮后卫对应布伦森；无球接投 SG/SF 对应汤普森；锋卫 SG 对应爱德华兹、SF 对应伦纳德。参照的是动作特点，不宣称用户具有该球星能力。每位原始 NBA 来源在 advisor.js；照片保留作者、许可、年份和比赛背景，历史照片不是当前阵容照片。

## 本轮核验

|资料|用途|不用于|
|---|---|---|
|Nike、PUMA、adidas 原始产品及发布页面|确认具体代数、缓震与支撑部件、档案配色|把科技名自动换算为性能高低|
|RunRepeat 自购样鞋实验与实穿|发现 AE 2 和 Harden 10 的重量、楦型及外场限制|套用到所有尺码、配色和球员|
|WearTesters 原版 G.T. Cut 评测|识别室内与外场抓地取舍|套用到 EP、复刻鞋或后续代数|
|有自述条件的公开穿着反馈|检查个人体验是否存在分歧|统计总体满意度、合脚率或因果关系|

没有开展代表大众篮球人群的问卷，也没有取得足够、统一条件的用户实穿数据。本站鞋友分享暂不进入自动评分：分享的脚型、鞋况、版本、场地和磨合时间不统一，不能把好评数当作性能或适配率。

## 执行规则

1. 先识别已经有来源的冲突。G.T. Cut 1 原版、AE 2、Harden 10 不优先进入水泥地试穿清单；Harden 10 的测试楦型偏窄，对宽前掌降级；AE 2、Harden 10 的样鞋偏重，对轻量脚感需求降级。这些是保守初筛，不是绝对禁止使用。
2. 未核实不是已经适合。其他鞋款没有同条件外场证据时，明确标记“待实穿验证”，不把橡胶、GCU、HART 或品牌“耐磨”声明等同于水泥地抓地或寿命。
3. 再按动作、脚感和公开配置形成候选。五维图、体重分段、打法/位置权重是编辑规则，不是统一实验结果、机器学习预测或保护能力阈值；1–2 分的差距不解释为优势。
4. 身高只保存和展示。没有可靠的身高与具体鞋款性能映射，不加分、不推断位置。趾形和足弓用于具体试穿检查，不保证适配，也不自动建议加码。
5. 不考虑价格，旧档案的预算字段读取时丢弃。脚宽与趾形独立：希腊脚按最长脚趾检查空间，不能由趾形推断楦宽。
6. 单独点名有冲突的鞋时，X-dragon 先说明限制，不继续给出“优先试穿这双”的肯定回答。对比配置指数也显示已知冲突。

## 原始来源

- [Nike G.T. Cut 原版](https://www.nike.com/t/gt-cut-basketball-shoes-kTDfNK/CZ0175-600)：React 抽取式中底、全掌 Air Zoom Strobel、后跟 Zoom Air；不套用 EP。
- [PUMA MB.06](https://us.puma.com/us/en/pd/mb.06-shooting-star-basketball-shoes/313624)、[PUMA Japan 发布资料](https://prtimes.jp/main/html/rd/p/000000377.000010697.html)：抽取式中底、TPU 侧墙、橡胶外底。未确认泡棉商品名，不借用前代 NITRO 配置。
- [adidas AE 2 发布资料](https://grassroots.adidas.com/eurocamp/news/adidas-basketball-and-anthony-edwards-unveil-the-anthony-edwards-2)：LIGHTBOOST、Lightstrike、Propulsion Plate、Articulated Fangs；未把板件称为碳板。
- [RunRepeat AE 2](https://runrepeat.com/adidas-anthony-edwards-2)：男 US 9 测试单鞋 428 g，外场存在取舍。数值仅针对测试样鞋。
- [RunRepeat Harden Volume 10](https://runrepeat.com/adidas-harden-volume-10)：男 US 9 测试单鞋 434 g、内部偏窄，粗糙外场不优先。
- [RunRepeat 方法](https://runrepeat.com/testing-methodology)：购买测试样鞋；测量和使用条件需要随结果一起看。
- [WearTesters G.T. Cut](https://weartesters.com/nike-air-zoom-gt-cut-performance-review/)：原版的室内与外场抓地体验不同。
- [Harden 10 用户原始讨论](https://www.reddit.com/r/BBallShoes/comments/1u47933/harden_10_is_underrated_and_no_one_is_talking/)：自述打法、体型与足部感受；评论中的宽脚、热感和鞋感存在分歧。这类反馈用来提醒检查条件，未转成数值评分。
- [G.T. Cut 原始实穿讨论](https://www.reddit.com/r/BBallShoes/comments/oqx60t)：外场磨损反馈不同，评论涉及 EP 差异，不能跨版本混算。

## 需要补充的用户数据

鞋款完整名称与版本、配色、尺码、脚长/脚宽测量、比赛袜、体重、主要动作、室内/室外及地面材质、积灰、使用小时数、是否磨合、是否旧伤。将同条件反馈分组并保留分歧；未经核实的匿名自述与重复分享不能用来保证推荐准确。

## 当前验证

自动回归覆盖 810 个档案组合、已知外场/宽前掌/轻量冲突、身高不改变性能权重、旧预算迁移、脚型与身高解析、中英文和多轮问答。程序测试只证明这些规则按预期执行，不证明实际合脚率或性能优越。
