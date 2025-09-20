#!/usr/bin/env node
/**
 * Fix paths in the exported Next.js files for Electron
 * This script converts absolute paths to relative paths in the HTML files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixPaths() {
  const outDir = path.join(__dirname, 'out');
  const indexPath = path.join(outDir, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.error('index.html not found in out directory');
    return;
  }
  
  // Read the index.html file
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Replace absolute paths with relative paths
  content = content.replace(/href="\/_next\//g, 'href="./_next/');
  content = content.replace(/src="\/_next\//g, 'src="./_next/');
  
  // Write the fixed content back
  fs.writeFileSync(indexPath, content);
  
  console.log('Fixed paths in index.html for Electron');
}

fixPaths();
