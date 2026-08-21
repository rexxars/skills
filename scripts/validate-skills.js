#!/usr/bin/env node
import {readdir, readFile, stat} from 'node:fs/promises'
import {join, relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import YAML from 'yaml'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const skillsRoot = join(repoRoot, 'skills')

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---/

async function findSkillFiles(dir) {
  const entries = await readdir(dir, {withFileTypes: true}).catch(() => [])
  const files = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const skillMd = join(dir, entry.name, 'SKILL.md')
    if (await stat(skillMd).then((s) => s.isFile()).catch(() => false)) {
      files.push(skillMd)
    }
  }
  return files
}

function validateFrontmatter(content) {
  const match = content.match(FRONTMATTER_RE)
  if (!match) return {error: 'no frontmatter block (expected --- ... --- at top of file)'}

  let data
  try {
    data = YAML.parse(match[1])
  } catch (e) {
    return {error: `frontmatter is not valid YAML: ${e.message.split('\n')[0]}`}
  }

  if (!data || typeof data !== 'object') return {error: 'frontmatter parsed to non-object'}
  if (typeof data.name !== 'string' || !data.name.trim()) {
    return {error: '`name` is missing or not a non-empty string'}
  }
  if (typeof data.description !== 'string' || !data.description.trim()) {
    return {error: '`description` is missing or not a non-empty string'}
  }

  return {data}
}

const files = await findSkillFiles(skillsRoot)
if (files.length === 0) {
  console.error(`No skills found under ${relative(repoRoot, skillsRoot)}/`)
  process.exit(1)
}

const failures = []
for (const file of files) {
  const content = await readFile(file, 'utf-8')
  const result = validateFrontmatter(content)
  const rel = relative(repoRoot, file)
  if (result.error) {
    failures.push({file: rel, error: result.error})
    console.error(`✗ ${rel}\n    ${result.error}`)
  } else {
    console.log(`✓ ${rel} — ${result.data.name}`)
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} skill${failures.length === 1 ? '' : 's'} failed validation.`)
  console.error('See https://github.com/vercel-labs/skills for the format expected by `npx skills add`.')
  process.exit(1)
}
