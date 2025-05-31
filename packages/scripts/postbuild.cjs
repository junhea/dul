// prepare for publish
const fs = require('fs')
fs.copyFileSync('./README.md', './dist/README.md')
fs.copyFileSync('./LICENSE', './dist/LICENSE')

const packageJson = JSON.parse(fs.readFileSync('./package.json'))
packageJson.private = false
packageJson.scripts = undefined
packageJson.prettier = undefined
packageJson.exports = { import: './index.mjs', types: './index.d.ts' }

fs.writeFileSync(
  './dist/package.json',
  JSON.stringify(packageJson, undefined, 2)
)
