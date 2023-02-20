# zsxq-openai
通过定时任务自动获取知识星球的提问主题，通过调用 OpenAi 的接口来进行自动的回答。我这里的定时任务是配置在 xxl-job 上面的，任何一个任务调度平台都可以，或者是 Linux 平台的定时也行；

# 参数配置
在网页上扫描登录知识星球
1. 找到对应要自动回答的星球里面的 待我回答的地址；
2. 登录后的cookie 信息；
3. 注册好的 OpenAi 的 API_KEY；

# 安装 request 模块
`npm install request`

# 启动脚本
`node zsxq.js`
