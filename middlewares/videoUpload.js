const multer = require('multer')
const path = require('path')
// const {v4:uuid} = require('uuid')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'files/video'), // 파일 저장 위치 설정
  filename: (req, file, cb) => cb(null, `${Date.now()}.${file.originalname}`), // 파일 저장 이름 설정 
})
const videoUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    if(ext === ".mp4") cb(null, true)
    else cb(res.send({status: 'err', data: 'only mp4 is allowed'}), false)
  },
  limit: { fileSize: 50 * 1024 * 2014 } // 최대 50mb
})
module.exports = videoUpload.single('video')