import fs from 'node:fs'
fs.mkdirSync('dist/ui', { recursive: true })
fs.cpSync('src/ui', 'dist/ui', { recursive: true })
