import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages는 https://<사용자>.github.io/<저장소>/ 하위에 올라가므로
  // 빌드 결과가 참조하는 경로 앞에 저장소 이름을 붙여야 한다. 개발 서버(pnpm dev)에서는 '/'.
  base: process.env.NODE_ENV === 'production' ? '/redmoon/' : '/',
  plugins: [react(), tailwindcss()],
})
