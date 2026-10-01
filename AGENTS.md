# 协作规则

- 回答用户（= 当前对话人）时使用中文；回答 white / crypt 等 dev 时使用英文。
- 没有用户明确授权，禁止 `git push`（也禁止直接推 main / 部署生产）。
- 每次 push 都必须先征得用户同意。
- commit 也只做请求范围内的事；commit message 保持简洁，不要括号、不要过细。
- 改动完成后，除了需要 push 的命令，还要输出更新服务器的命令，让用户自己执行：
  `cd game && git pull && bun run deploy && pm2 restart frog`