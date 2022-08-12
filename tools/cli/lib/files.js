import fs from 'fs'
import path from 'path'

module.exports = {
  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd())
  },

  directoryExists: filePath => {
    return fs.existsSync(filePath)
  },
}
