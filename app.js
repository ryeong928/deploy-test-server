const PORT = process.env.PORT || 4000
const express = require('express')
const app = express()
const { Server } = require("ws")
const cors = require('cors')
const { v4 : uuid } = require('uuid')
const deployURL = "https://deploytest928.herokuapp.com"
const Router = require('./routes')

app.use(cors())
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded
app.use('/files', Router.files)

let rooms = {}
let users = []

app.get("/", (req, res) => {
  return res.send("deploytest928")
})
app.get('/rooms', (req, res) => {
  return res.send(Object.keys(rooms))
})

const HTTP = app.listen(PORT, () => console.log(`server listening on ${PORT}`))
const WSS = new Server({server: HTTP})

WSS.on("connection", (ws) => {
  // 소켓 연결 처리
  ws.id = uuid()
  users.push(ws)
  console.log(`${ws.id} 접속: 총 ${users.length}명, ${WSS.clients.length}명`)
  
  ws.send(JSON.stringify({type: "connected", data: `${ws.id}`}))
  // 소켓 에러/종료 처리
  ws.on('error', (err) => console.log(`${ws.id} error: ${err}`))
  ws.on('close', () => {
    if(ws.room) leaveRoom(ws)
    const idx = users.findIndex(u => u.id === ws.id)
    users.splice(idx, 1)
    console.log(`${ws.id} 해제: 총 ${users.length}명`)
  })
  // 수신 메시지 처리
  ws.on('message', (e) => {
    const {type, data, sub} = JSON.parse(e.toString())
    console.log('socket msg: ', type, data, sub)
    // room 처리
    if(type === "join"){
      ws.room = data
      if(!rooms[data]) rooms[data] = [ws]
      else if(rooms[data].length === 1){
        rooms[data].push(ws)
        rooms[data].forEach(u => u.id !== ws.id && u.send(JSON.stringify({type: 'join'})))
      }else{
        ws.send(JSON.stringify({type: 'full'}))
        delete ws.room
      }
    }
    if(type === "leave" && ws.room) {
      toTheOther(ws, {type, data})
      return leaveRoom(ws)
    }
    // webrtc 처리
    if(type === "offer") return toTheOther(ws, {type, data})
    if(type === "answer") return toTheOther(ws, {type, data})
    if(type === "ice") return toTheOther(ws, {type, data})
    if(type === "peercontrol") return toTheOther(ws, {type, data})
  })
})

function leaveRoom(ws){
  if(!rooms[ws.room]) return
  const idx = rooms[ws.room].findIndex(id => id === ws.id)
  rooms[ws.room].splice(idx, 1)
  if(rooms[ws.room].length === 0) delete rooms[ws.room]
  delete ws.room
}
function toTheOther(ws, msg){
  rooms[ws.room].forEach(u => u.id !== ws.id && u.send(JSON.stringify(msg)))
}