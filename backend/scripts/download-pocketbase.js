#!/usr/bin/env node

/**
 * Download PocketBase binary for the current platform
 */

const https = require('https')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const POCKETBASE_VERSION = '0.29.0'

function getPlatform() {
  const platform = process.platform
  const arch = process.arch
  
  if (platform === 'darwin') {
    return arch === 'arm64' ? 'darwin_arm64' : 'darwin_amd64'
  } else if (platform === 'win32') {
    return arch === 'x64' ? 'windows_amd64' : 'windows_386'
  } else if (platform === 'linux') {
    return arch === 'arm64' ? 'linux_arm64' : 'linux_amd64'
  }
  
  throw new Error(`Unsupported platform: ${platform}-${arch}`)
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject)
      }
      
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download: ${response.statusCode}`))
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        resolve()
      })
      
      file.on('error', (err) => {
        fs.unlink(dest, () => {}) // Delete the file on error
        reject(err)
      })
    }).on('error', reject)
  })
}

async function downloadPocketBase() {
  try {
    // Check if already exists
    const binaryPath = path.join(__dirname, '..', 'pocketbase')
    if (fs.existsSync(binaryPath)) {
      console.log('✅ PocketBase binary already exists')
      return
    }
    
    const platformSuffix = getPlatform()
    const filename = `pocketbase_${POCKETBASE_VERSION}_${platformSuffix}.zip`
    const downloadUrl = `https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/${filename}`
    const zipPath = path.join(__dirname, '..', filename)
    
    console.log(`📥 Downloading PocketBase v${POCKETBASE_VERSION} for ${platformSuffix}...`)
    console.log(`🔗 URL: ${downloadUrl}`)
    
    await downloadFile(downloadUrl, zipPath)
    console.log('✅ Download completed')
    
    // Extract the zip file
    console.log('📦 Extracting...')
    
    return new Promise((resolve, reject) => {
      exec(`cd "${path.dirname(zipPath)}" && unzip -o "${filename}"`, (error, stdout, stderr) => {
        // Clean up zip file
        fs.unlink(zipPath, () => {})
        
        if (error) {
          return reject(new Error(`Extraction failed: ${error.message}`))
        }
        
        // Make binary executable
        const binaryPath = path.join(__dirname, '..', 'pocketbase')
        if (fs.existsSync(binaryPath)) {
          fs.chmodSync(binaryPath, '755')
          console.log('✅ PocketBase binary ready')
          console.log(`📍 Location: ${binaryPath}`)
          resolve()
        } else {
          reject(new Error('Binary not found after extraction'))
        }
      })
    })
    
  } catch (error) {
    console.error('❌ Failed to download PocketBase:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  downloadPocketBase()
}

module.exports = downloadPocketBase
