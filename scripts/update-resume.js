#!/usr/bin/env node

/**
 * Simple script to update resume file ID in the codebase
 * Usage: node scripts/update-resume.js "YOUR_FILE_ID"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updateResumeFileId(newFileId) {
  const resumeLibPath = path.join(__dirname, '..', 'src', 'lib', 'resume.ts');
  
  try {
    // Read the current file
    let content = fs.readFileSync(resumeLibPath, 'utf8');
    
    // Update the file ID in the RESUME_CONFIG
    const updatedContent = content.replace(
      /directUrl: "https:\/\/drive\.google\.com\/uc\?export=download&id=[^"]+"/,
      `directUrl: "https://drive.google.com/uc?export=download&id=${newFileId}"`
    );
    
    // Write the updated content back
    fs.writeFileSync(resumeLibPath, updatedContent);
    
    console.log('✅ Resume file ID updated successfully!');
    console.log(`📄 New File ID: ${newFileId}`);
    console.log(`🔗 Direct URL: https://drive.google.com/uc?export=download&id=${newFileId}`);
    console.log(`📅 Updated: ${new Date().toISOString().split('T')[0]}`);
  } catch (error) {
    console.error('❌ Error updating resume file ID:', error.message);
  }
}

// Get file ID from command line arguments
const newFileId = process.argv[2];

if (!newFileId) {
  console.log('Usage: node scripts/update-resume.js "YOUR_FILE_ID"');
  console.log('Example: node scripts/update-resume.js "16pajWO-QZlmp8CHkFH_c9ce-FbM27hQN"');
  process.exit(1);
}

updateResumeFileId(newFileId);