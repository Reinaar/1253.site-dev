// Node.js script to download skill images for Last War heroes
// Save this as download-skills.js and run with: node download-skills.js

const fs = require('fs');
const path = require('path');
const https = require('https');
const { JSDOM } = require('jsdom');

// Base URL for skill images
const SKILL_BASE_URL = 'https://www.allclash.com/wp-content/uploads/2024/01/lastwar-';

// Create output directory for skill images
const skillsDir = path.join(__dirname, 'skills');
if (!fs.existsSync(skillsDir)) {
  fs.mkdirSync(skillsDir, { recursive: true });
}

// Function to download an image with error handling
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      // Check if the image exists (status code 200)
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else {
        // Image doesn't exist or other error
        file.close();
        fs.unlink(filePath, () => {}); // Delete the empty file
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(filePath, () => {}); // Delete the file if there was an error
      resolve(false); // Don't reject, just return false to indicate failure
    });
  });
}

// Function to try downloading a skill image with potential URL variations
async function tryDownloadSkill(heroName, skillNumber) {
  const heroFolder = path.join(skillsDir, heroName.toLowerCase());
  if (!fs.existsSync(heroFolder)) {
    fs.mkdirSync(heroFolder, { recursive: true });
  }
  
  const outputPath = path.join(heroFolder, `skill-${skillNumber}.jpg`);
  
  // Try different URL formats
  const urlFormats = [
    `${SKILL_BASE_URL}${heroName.toLowerCase()}-skill-${skillNumber}.jpg`,
    `${SKILL_BASE_URL}${heroName.toLowerCase().replace(/ /g, '-')}-skill-${skillNumber}.jpg`,
    // For heroes with parentheses like "Mason (UR)"
    `${SKILL_BASE_URL}${heroName.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim()}-skill-${skillNumber}.jpg`
  ];
  
  // Special case for "DVA" (all caps)
  if (heroName.toLowerCase() === 'dva') {
    urlFormats.push(`${SKILL_BASE_URL}dva-skill-${skillNumber}.jpg`);
  }
  
  // Try each URL format
  for (const url of urlFormats) {
    console.log(`Trying: ${url}`);
    const success = await downloadImage(url, outputPath);
    if (success) {
      console.log(`✓ Downloaded skill ${skillNumber} for ${heroName}`);
      return true;
    }
  }
  
  console.log(`✗ Could not find skill ${skillNumber} for ${heroName}`);
  return false;
}

// Main function to download all hero skills
async function downloadHeroSkills() {
  try {
    // First, get the list of heroes from the heroes folder
    const heroesDir = path.join(__dirname, 'heroes');
    if (!fs.existsSync(heroesDir)) {
      console.error('Heroes folder not found! Please make sure you have downloaded the hero images first.');
      return;
    }
    
    // Read all hero image files
    let heroFiles = fs.readdirSync(heroesDir);
    
    // Filter out non-image files
    heroFiles = heroFiles.filter(file => 
      file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
    );
    
    console.log(`Found ${heroFiles.length} heroes`);
    
    // For each hero, try to download skills 1-4
    let totalSkillsFound = 0;
    
    for (const heroFile of heroFiles) {
      // Extract hero name from file name (remove extension)
      const heroName = path.basename(heroFile, path.extname(heroFile));
      console.log(`\nProcessing hero: ${heroName}`);
      
      // Try to download each skill 1-4
      let heroSkillsFound = 0;
      for (let skillNum = 1; skillNum <= 4; skillNum++) {
        const success = await tryDownloadSkill(heroName, skillNum);
        if (success) heroSkillsFound++;
        
        // Small delay to prevent too many concurrent downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`Found ${heroSkillsFound} skills for ${heroName}`);
      totalSkillsFound += heroSkillsFound;
    }
    
    console.log(`\nDownload complete! Found a total of ${totalSkillsFound} skill images.`);
    console.log(`Images saved to: ${skillsDir}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
downloadHeroSkills();