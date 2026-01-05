import { defineConfig } from 'vite'

// GitHub Pages 部署时，base 需要是仓库名路径： /<repo>/
// 你的仓库名是：Wenyu-Cai
// 如果你未来改了仓库名，把下面这一行同步改掉即可。
const base = '/Wenyu-Cai/'

export default defineConfig({
  base
})


