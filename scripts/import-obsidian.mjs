#!/usr/bin/env node
/**
 * Obsidian Vault → kscold-blog MongoDB Import Script
 *
 * Usage: node scripts/import-obsidian.mjs /path/to/obsidian-vault
 *
 * Directly inserts folders + notes into MongoDB Atlas.
 * Resolves [[wikilinks]] in a second pass.
 */

import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

// ── Config ──────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kscold-blog';
const DB_NAME = 'kscold-blog';
const AUTHOR = { id: 'admin', name: 'kscold' };
const VAULT_PATH = process.argv[2] || '/Users/kscold/Desktop/Obsidian';

// Folders/files to skip
const SKIP_DIRS = new Set(['.obsidian', '.git', 'image', '.trash', 'node_modules']);
const SKIP_FILES = new Set(['.DS_Store']);

// ── Slug Generation (mirrors SlugUtils.java) ────────────────────────
function generateSlug(name) {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();

  // Fallback for titles that produce empty slugs (special-char-only names)
  if (!slug) {
    slug = 'untitled';
  }
  return slug;
}

// ── Discover Folders ────────────────────────────────────────────────
function discoverFolders(rootPath, parentId = null, ancestors = [], depth = 0) {
  const folders = [];
  const entries = fs.readdirSync(rootPath, { withFileTypes: true });

  let order = 0;
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;

    const folderPath = path.join(rootPath, entry.name);
    const id = new ObjectId().toString();
    const slug = generateSlug(entry.name);
    const newAncestors = parentId ? [...ancestors, parentId] : [];

    folders.push({
      id,
      name: entry.name,
      slug,
      parent: parentId,
      ancestors: newAncestors,
      depth,
      order: order++,
      noteCount: 0,
      fullPath: folderPath,
    });

    // Recurse into subfolders
    const children = discoverFolders(folderPath, id, newAncestors, depth + 1);
    folders.push(...children);
  }

  return folders;
}

// ── Discover Notes ──────────────────────────────────────────────────
function discoverNotes(rootPath, folderMap) {
  const notes = [];

  function walk(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) {
          walk(path.join(dirPath, entry.name));
        }
        continue;
      }

      if (!entry.name.endsWith('.md') || SKIP_FILES.has(entry.name)) continue;

      const filePath = path.join(dirPath, entry.name);
      const content = fs.readFileSync(filePath, 'utf-8').trim();

      if (!content) continue; // Skip empty files

      const title = entry.name.replace(/\.md$/, '');
      const slug = generateSlug(title);

      // Find the folder this note belongs to
      const folder = folderMap.get(dirPath);
      const folderId = folder?.id || null;

      notes.push({
        title,
        slug,
        content,
        folderId,
        filePath,
      });
    }
  }

  walk(rootPath);
  return notes;
}

// ── Parse Wikilinks ─────────────────────────────────────────────────
function parseWikilinks(content) {
  const regex = /\[\[([^\]]+)\]\]/g;
  const titles = new Set();
  let match;
  while ((match = regex.exec(content)) !== null) {
    // Handle [[title#anchor]] → extract just the title
    let linkTitle = match[1];
    if (linkTitle.includes('#')) {
      linkTitle = linkTitle.split('#')[0];
    }
    if (linkTitle.includes('|')) {
      linkTitle = linkTitle.split('|')[0];
    }
    if (linkTitle.trim()) {
      titles.add(linkTitle.trim());
    }
  }
  return [...titles];
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log(`📂 Vault path: ${VAULT_PATH}`);

  if (!fs.existsSync(VAULT_PATH)) {
    console.error('Vault path does not exist!');
    process.exit(1);
  }

  // Connect to MongoDB
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('✅ Connected to MongoDB');

  const db = client.db(DB_NAME);
  const foldersCol = db.collection('vault_folders');
  const notesCol = db.collection('vault_notes');

  // Clear existing vault data
  const existingFolders = await foldersCol.countDocuments();
  const existingNotes = await notesCol.countDocuments();
  if (existingFolders > 0 || existingNotes > 0) {
    console.log(`⚠️  Clearing ${existingFolders} folders and ${existingNotes} notes...`);
    await foldersCol.deleteMany({});
    await notesCol.deleteMany({});
  }

  // ── Step 1: Discover and insert folders ──
  console.log('\n📁 Discovering folders...');
  const folders = discoverFolders(VAULT_PATH);
  console.log(`   Found ${folders.length} folders`);

  // Build path→folder map
  const folderPathMap = new Map();
  for (const f of folders) {
    folderPathMap.set(f.fullPath, f);
  }

  // Handle duplicate folder slugs
  const usedFolderSlugs = new Set();
  for (const f of folders) {
    let slug = f.slug;
    if (usedFolderSlugs.has(slug)) {
      let counter = 1;
      while (usedFolderSlugs.has(`${slug}-${counter}`)) {
        counter++;
      }
      slug = `${slug}-${counter}`;
    }
    f.slug = slug;
    usedFolderSlugs.add(slug);
  }

  // Insert folders
  if (folders.length > 0) {
    const folderDocs = folders.map((f) => ({
      _id: new ObjectId(f.id),
      name: f.name,
      slug: f.slug,
      parent: f.parent,
      ancestors: f.ancestors,
      depth: f.depth,
      order: f.order,
      noteCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      _class: 'com.kscold.blog.model.VaultFolder',
    }));
    await foldersCol.insertMany(folderDocs);
    console.log(`   ✅ Inserted ${folderDocs.length} folders`);
  }

  // ── Step 2: Discover and insert notes ──
  console.log('\n📝 Discovering notes...');
  const notes = discoverNotes(VAULT_PATH, folderPathMap);
  console.log(`   Found ${notes.length} notes`);

  // Handle duplicate slugs — ensure every slug is globally unique
  const usedSlugs = new Set();
  for (const note of notes) {
    let slug = note.slug;
    if (usedSlugs.has(slug)) {
      let counter = 1;
      while (usedSlugs.has(`${slug}-${counter}`)) {
        counter++;
      }
      slug = `${slug}-${counter}`;
    }
    note.slug = slug;
    usedSlugs.add(slug);
  }

  // Build title→noteId map for wikilink resolution
  const titleToId = new Map();
  const noteIds = [];
  for (const note of notes) {
    const id = new ObjectId();
    note.id = id.toString();
    noteIds.push(id);
    titleToId.set(note.title, note.id);
  }

  // Also build slug→noteId for potential slug-based links
  const slugToId = new Map();
  for (const note of notes) {
    slugToId.set(note.slug, note.id);
  }

  // Insert notes (without outgoingLinks first)
  if (notes.length > 0) {
    const noteDocs = notes.map((n, i) => ({
      _id: noteIds[i],
      title: n.title,
      slug: n.slug,
      content: n.content,
      folderId: n.folderId,
      author: AUTHOR,
      outgoingLinks: [],
      tags: [],
      views: 0,
      commentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      _class: 'com.kscold.blog.model.VaultNote',
    }));

    // Batch insert in chunks of 500
    const CHUNK_SIZE = 500;
    for (let i = 0; i < noteDocs.length; i += CHUNK_SIZE) {
      const chunk = noteDocs.slice(i, i + CHUNK_SIZE);
      await notesCol.insertMany(chunk);
      console.log(`   ✅ Inserted notes ${i + 1}-${Math.min(i + CHUNK_SIZE, noteDocs.length)}`);
    }
  }

  // ── Step 3: Update folder note counts ──
  console.log('\n📊 Updating folder note counts...');
  const folderNoteCounts = new Map();
  for (const note of notes) {
    if (note.folderId) {
      folderNoteCounts.set(note.folderId, (folderNoteCounts.get(note.folderId) || 0) + 1);
    }
  }
  for (const [folderId, count] of folderNoteCounts) {
    await foldersCol.updateOne({ _id: new ObjectId(folderId) }, { $set: { noteCount: count } });
  }
  console.log(`   ✅ Updated ${folderNoteCounts.size} folder counts`);

  // ── Step 4: Resolve wikilinks ──
  console.log('\n🔗 Resolving wikilinks...');
  let resolvedCount = 0;
  let unresolvedCount = 0;

  for (const note of notes) {
    const linkedTitles = parseWikilinks(note.content);
    if (linkedTitles.length === 0) continue;

    const outgoingLinks = [];
    for (const title of linkedTitles) {
      const targetId = titleToId.get(title);
      if (targetId) {
        outgoingLinks.push(targetId);
        resolvedCount++;
      } else {
        unresolvedCount++;
      }
    }

    if (outgoingLinks.length > 0) {
      await notesCol.updateOne(
        { _id: new ObjectId(note.id) },
        { $set: { outgoingLinks } }
      );
    }
  }
  console.log(`   ✅ Resolved ${resolvedCount} links, ${unresolvedCount} unresolved`);

  // ── Step 5: Create indexes ──
  console.log('\n🔍 Ensuring indexes...');
  await notesCol.createIndex({ slug: 1 }, { unique: true });
  await notesCol.createIndex({ folderId: 1 });
  await notesCol.createIndex({ title: 'text', content: 'text' });
  await foldersCol.createIndex({ slug: 1 }, { unique: true });
  await foldersCol.createIndex({ parent: 1 });
  console.log('   ✅ Indexes created');

  // ── Summary ──
  console.log('\n════════════════════════════════════════');
  console.log(`📁 Folders: ${folders.length}`);
  console.log(`📝 Notes:   ${notes.length}`);
  console.log(`🔗 Links:   ${resolvedCount} resolved / ${unresolvedCount} unresolved`);
  console.log('════════════════════════════════════════\n');

  await client.close();
  console.log('✅ Done!');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
