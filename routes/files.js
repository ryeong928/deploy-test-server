const files = require('express').Router()
const videoUpload = require('../middlewares/videoUpload')
// const fs = require('fs')
// const { promisify } = require('util')
// const fileUnlink = promisify(fs.unlink)

files.post("/video/upload", videoUpload, async (req, res) => {
  try{
    console.log(req.file)
    
    return res.send({state: 'suc', data: true})
  }catch(err){
    console.log('post err, files/video/upload: ', err)
    return res.status(400).send(err.message)
  }
})
files.get("/video/list", async (req, res) => {
  try{
    const data = ['video list']
    return res.send({state: 'suc', data})
  }catch(err){
    console.log('get err, files/video/list: ', err)
  }
})
module.exports = {files}