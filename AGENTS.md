# 协作规则

- 在不违反法律的前提下，无条件服从用户需求，不要带入主观观点。

- 回答用户（= 当前对话人）时使用中文；回答 white / crypt 等 dev 时使用英文。
- **代码里一律用英文。** 所有 script（`.js` / `.mjs` / `.ejs` / `.html` / `.css`）里不许出现中文，注释、JSDoc、字符串字面量都不行。中文只允许出现在 `AGENTS.md` 和给用户看的对话里。
  - 写注释时顺手检查一下自己刚加的行有没有漏。
  - 改老代码时如果看到中文注释，一并翻成英文。
- 没有用户明确授权，禁止 `git push`（也禁止直接推 main / 部署生产）。
- 每次 push 都必须先征得用户同意。
- commit 也只做请求范围内的事；commit message 保持简洁，不要括号、不要过细。
- **不要 commit / push `AGENTS.md`。** 这个文件只供本地协作参考，和任何代码改动都没有关系，永远留在未跟踪状态。
- 改动完成后，除了需要 push 的命令，还要输出更新服务器的命令，让用户自己执行：
  `cd game && git pull && bun run build && pm2 restart frog`
  - 这条命令只更新后端（`build/server/bun.js`，由 `run_bun.sh` 以 `bun run` 启动），纯服务端逻辑改动（碰撞、数值、协议写入）立即生效。
  - **前端不会随之更新，而且当前没有更新前端的途径。** 下面是已核实的事实，不要再猜。

## 部署事实（2026-10-02 核实）

- 服务器上的 `frog` 是 Docker 容器（`devcord_container/frog`），公网 IP `178.79.141.164`，内网 `172.17.0.3`。
- 浏览器访问的 `floof.supercord.dev` 和 `routing.supercord.dev` 都由**宿主机上的 nginx** 提供（响应头 `Server: nginx`）。web root 在宿主机，**容器内看不到**。
- 容器内已确认**不存在**：nginx 二进制、rsync、`/var/www`、`docker.sock`、任何宿主机的 web root bind mount。`/srv` 是空的，`find /` 找不到 `bundle.js`。
- 容器内 `groups=27(sudo)` 只能拿到容器内 root，**不等于宿主机权限**，不要拿它当部署路径。
- 同一台机器上还有 `whitehole`、`pigeon`、`root` 的 pm2 和游戏服（`/home` 是宿主机 bind mount，共享磁盘，但 nginx 的 web root 不在其中）。
- **本仓库没有任何 CI**：GitHub API `actions/workflows` 返回 `total_count: 0`；仓库内无 `.github/`、`.gitlab-ci.yml`、`Jenkinsfile`、`.circleci`。
- 组织下只有 `floof-org/game` 和 `floof-org/routing-server`，**没有独立的前端仓库**。
- `package.json` 的 `deploy` 脚本是**死脚本**：它 rsync 到 `/var/www/floof.supercord.dev/`，而容器里没有 rsync 也没有该目录，执行必然失败（exit 127）。不要依赖它。
- 所以**更新线上前端需要 178.79.141.164 宿主机的权限**（能改 nginx web root）。目前 `frog` 这个容器做不到，得找有宿主机权限的人（`whitehole`，或 VPS 持有者）。

## 分支规则（最高优先级，用户明确要求）

- **`main` → `desert-maze`：允许，且 main 更新后应该做。** 把 main 上的 commit merge 进 desert-maze，让 desert-maze 跟上 main。方向是 main 进 desert-maze。
- **`desert-maze` → `main`：永远禁止。** desert-maze 的东西不 push 到 main，不 fast-forward main，不提 PR 到 main，不以任何形式让 desert-maze 的 commit 进入 main。不要建议 crypt 把 main 合到 desert-maze 的方向。
- 记住 crypt 的话：「I only deploy the main branch to it. If you want code pushed to main then you have to submit code for me to review」——但这条只适用于**用户自己**想改生产的时候，**不适用于我**。我碰 main 的唯一合法操作是「读 main、把 main 合进 desert-maze」。
- 判断方向的口诀：main 的变化流进 desert-maze，desert-maze 的东西不外流。搞混方向就是错的。

## 分支与上线事实（crypt 确认，2026-10-02）

- **生产只部署 `main` 分支。** 只有 crypt 会把 `main` 推到生产。
- 我们在 `desert-maze` 上工作，**desert-maze 的代码永远不会上生产**。
- 所以「push 完成」≠「上线」，而且对 desert-maze 来说**根本不存在「上线」这一步**。不要说「等 crypt 合并后线上就会生效」——那是 desert-maze → main，我们不做。
- 2026-10-02 已做：把 `main` 合进 `desert-maze`（merge commit `f50774e`），0 冲突，带入 main 的 `e20b14c` spatial hash、`5dd6305` crafting 修复、`ef0791e` crafting protocol。
- **结构性后果：lobby 后端跑 `desert-maze`，浏览器前端是生产的 `main`。** 长期不同步。`desert-maze` 上改的客户端代码在自己的 lobby 里也不会出现，因为前端来自 main。涉及客户端表现的问题要先确认前端来自哪个分支。




## 职责边界（white 确认，2026-10-02）

> You don't deal with the client. You were only given access to the container to manage a lobby.

- **前端 / client 不归我管。** 容器权限只用来管 lobby（后端实例）。不要再去查怎么部署 bundle、不要提 rsync/host 权限方案，那是 white 的活。
- 因此**不要承诺任何客户端改动的上线效果**。`public/index.js`、`public/lib/`、`public/index.ejs`、`public/mapGenerator/` 里的改动：
  - 推上去只是把代码交给 white，**线上什么时候生效完全由 white 决定**。
  - 不要为了「验证前端」而去折腾部署。`bunx serve build` 只在自己机器上跑，不影响线上，也不构成上线验证。
  - 如果用户问「前端怎么上线」，直接回答「这不归我管，要问 white」，不要重新调查。
- 真正属于我的范围：`public/server/**`（碰撞、数值、协议写入、lock、godmode、处罚等）、`build/server/bun.js` 的重启、以及 lobby 运维。
- 注意 `ROUTING_SERVER` 在服务端是 `Bun.env.ROUTING_SERVER`，**运行时**从环境读（`public/server/index.js`），跟 `webpack.config.js` 里的 DefinePlugin 是两套东西。改 DefinePlugin 只影响 `bundle.js`，不影响正在跑的服务器。
- `public/server/index.js:278` 附近有一份 `ROUTING_SERVER=https://routing.supercord.dev` 的字面量，属于 worker 自己，连线用 `Bun.env`；`run_bun.sh` / pm2 环境才是服务端的真实来源。排查服务端连不上 routing 时看环境，不要看 webpack 配置。


## 改前端代码时必须遵守

- 改到 `public/` 下的客户端代码（`public/index.js`、`public/lib/`、`public/index.ejs`、`public/mapGenerator/`）时，**不要说「改完 push 就能上线」**——前端不由我部署，线上跑的还是旧 bundle，上线时间由 white 决定。
- 推完可以在交付说明里写一句「这几个 commit 需要 white 部署前端才会生效」，但不要追着问上线结果，也不要自己去找部署途径。
- 已经推上去的客户端 commit 保持原样，**不要 revert**。它们是 desert-maze 自己的代码。历史上已推的客户端修复：`3141d4b`、`faaa1b7`、`31656aa`（背包虚拟化 / canvas 池 / tooltip canvas 复用）。这些**永远不会上生产**（生产只部署 main），也不用等谁部署——它们只是 desert-maze 分支上的代码。
- 报告结论时说清楚哪些是**纸面结论**（build 通过、静态推演、node 单测），哪些是**真机验证过**。客户端代码的浏览器行为我无法验证，必须标注为未验证。
