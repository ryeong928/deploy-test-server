const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs')
const path = require('path')
const util = require('util')
// data
const target = {
  mp4: 'files/missing-you.mp4',
  avi: 'files/2ch.avi',
  front: 'public/front.avi',
  back: 'public/back.avi',
}
const folder = 'public'
const targetPath = path.resolve(__dirname, `./${target.avi}`)

console.log('★ fluent ffmpeg start ★')

// metadata
if(false){
  ffmpeg.ffprobe(target.avi, (err, metadata) => {
    if(err) return console.log('metadata err: ', err)
    return console.log(util.inspect(metadata, false, null))
  })
}
// copy stream
if(false){
  const rs = fs.createReadStream(targetPath)
  ffmpeg(rs)
  .output('public/front.mp4')
  .outputOptions([
    '-vcodec', 'copy',
    '-map', '0:v:0',
    '-map', '0:a:0',
  ])
  .output('public/back.mp4')
  .outputOptions([
    '-vcodec', 'copy',
    '-map', '0:v:1',
    '-map', '0:a:0'
  ])
  .run()
}
// copy subtitle stream with yuv extension
if(false){
  ffmpeg(target.avi)
  .outputOptions([
    '-c', 'copy',
    '-map', '0:s'
  ])
  .on('end', () => {
    fs.rename(path.join(__dirname, 'public/sub.yuv'), path.join(__dirname, 'public/subtitle.dat'), (err, data) => {})
  })
  .save('public/sub.yuv')
}
// extract and edit subtitle stream
if(false){
  let start = process.memoryUsage().rss
  const rs = fs.createReadStream('public/subtitle.dat', {highWaterMark: 72})
  let count = 0
  const data = {
    g_x: [],
    g_y: [],
    g_z: [],
    speed: [],
    lon: [],
    lat: [],
    time: []
  }

  rs.on('data', (c) => {
    for(let i = 6, j = 7; i >= 0 ;i--, j--){
      // 이전/이후 time을 비교해서 값이 달라질 때마다 data에 등록
      if(i === 6){
        const temp = c.subarray(40 + (4 * j), 44 + (4 * j)).readInt32LE()
        if(data.time[data.time.length - 1] !== temp) data.time.push(temp)
        else break
      }
      const temp = c.subarray(40 + (4 * j), 40 + (4 * (j + 1))).readFloatLE()
      if(i === 5) data.lat.push(parseInt(temp / 100) + ((temp - (parseInt(temp / 100) * 100)) / 60))
      if(i === 4) data.lon.push(parseInt(temp / 100) + ((temp - (parseInt(temp / 100) * 100)) / 60))
      if(i === 3) data.speed.push(temp)
      if(i === 2) data.g_z.push(temp)
      if(i === 1) data.g_y.push(temp)
      if(i === 0) data.g_x.push(temp)
      if(i === 3) j--
    }
    count++
  })

  rs.on('close', () => {
    console.log(`total read count: ${count}`)
    console.log(`extracted data length: ${data.time.length}`)
    console.log(`memory usage diff: ${((process.memoryUsage().rss - start) / (1024 * 1024)).toFixed(2)} MB`)
  })
}

// screenshot
if(false){
  ffmpeg(target.avi)
  .screenshots({count: 1, folder, filename: '%b.png', size: '320x240'})
}
// extract audio stream in mp3 format
if(false){
  ffmpeg(target.avi)
  .noVideo()
  .format('mp3')
  .save("public/video-stream-removed.mp3")
}
// multiple outputs
if(false){
  ffmpeg(target.avi)
  .output('sshot1.png').noAudio().seek('0:00')
  .output('sshot2.png').noAudio().seek('0:10')
  .on('error', (e) => console.log('err: ', e))
  .on('end', (e) => console.log('end: ', e))
  .run()
}