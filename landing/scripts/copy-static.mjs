import { cpSync, mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const sourceDir = resolve('.output/public')
const targetDir = resolve('dist')

if (!existsSync(sourceDir)) {
  throw new Error(`Missing Nuxt generate output: ${sourceDir}`)
}

rmSync(targetDir, { recursive: true, force: true })
mkdirSync(targetDir, { recursive: true })
cpSync(sourceDir, targetDir, { recursive: true })

const indexPath = resolve(targetDir, 'index.html')
if (existsSync(indexPath)) {
  const html = readFileSync(indexPath, 'utf8')
  const stylesheetMatches = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"[^>]*>/g)]

  let patchedHtml = html
  for (const match of stylesheetMatches) {
    const href = match[1]
    const cssPath = resolve(targetDir, href.replace(/^\//, ''))
    if (!existsSync(cssPath)) continue

    const css = readFileSync(cssPath, 'utf8')
    const styleTag = `<style data-inlined-stylesheet="${href}">\n${css}\n</style>`
    patchedHtml = patchedHtml.replace(match[0], styleTag)
  }

  if (patchedHtml !== html) {
    writeFileSync(indexPath, patchedHtml)
    console.log(`Inlined stylesheet(s) into ${indexPath}`)
  }
}

const aliasRoot = resolve(
  targetDir,
  '_nuxt',
  'Users',
  'csl-dev',
  'Desktop',
  'alex',
  'demo',
  'AI-GEN',
  'income-expense-app',
  'landing',
)

const aliasFiles = [
  {
    source: resolve('assets', 'css', 'main.css'),
    target: resolve(aliasRoot, 'assets', 'css', 'main.css'),
  },
  {
    source: resolve('.nuxt', 'nuxt-fonts-global.css'),
    target: resolve(aliasRoot, '.nuxt', 'nuxt-fonts-global.css'),
  },
]

for (const file of aliasFiles) {
  if (!existsSync(file.source)) continue
  mkdirSync(resolve(file.target, '..'), { recursive: true })
  cpSync(file.source, file.target)
}

console.log(`Copied static output from ${sourceDir} to ${targetDir}`)
