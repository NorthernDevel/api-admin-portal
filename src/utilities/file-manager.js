const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types
const path = require('path')
const { dirname } = require('path')
// ROOT PATH
const rootDirectory = dirname(require.main.filename)
const fs = require('fs-extra')

// Upload Image
const uploadImage = async (files, siteId, directory, id) => {
  if (files.image != null) {
    const { headers, body } = req
    const pathName = `public/images/${siteId}/${directory}`

    const objectId = new ObjectId()
    const imageName = objectId.toString()

    const fileExtention = files.image.originalFilename.split('.')[1]
    const newImageName = `${imageName}.${fileExtention}`
    const newpath = path.resolve(rootDirectory, pathName, newImageName)
    if (await fs.exists(newpath)) {
      await fs.remove(newpath)
    }
    await fs.moveSync(files.image.filepath, newpath)

    // NOTE: Update product image
    return id
  }
}

const createPrefixDirectory = (prefixDirectory) => {
  const pathName = `${rootDirectory}/public/images/${prefixDirectory}`
  if (!fs.existsSync(pathName)) {
    // NOTE: Main Dir
    fs.mkdirSync(pathName)
    // NOTE: Sub Dir
    fs.mkdirSync(`${pathName}/app-logo`)
    fs.mkdirSync(`${pathName}/app-icons`)
    fs.mkdirSync(`${pathName}/banners`)
    fs.mkdirSync(`${pathName}/icons`)
    fs.mkdirSync(`${pathName}/promotions`)
  }
}

module.exports = {
  uploadImage,
  createPrefixDirectory,
}
