const PORT = process.env.PORT || 4000
const express = require('express')
const app = express()
const { Server } = require("ws")
const cors = require('cors')
const { v4 : uuid } = require('uuid')
const deployURL = "https://deploytest928.herokuapp.com"

let rooms = {}
let users = []

app.use(cors({
  origin: ["http://localhost:3000", "https://deploytest928.netlify.app"],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get("/", (req, res) => {
  return res.send("deploytest928")
})
app.get('/rooms', (req, res) => {
  return res.send(Object.keys(rooms))
})

const HTTP = app.listen(PORT, () => console.log(`server listening on ${PORT}`))
const WSS = new Server({server: HTTP})

/*
기본적으로 WebSocket은 한번에 64kb 이상 데이터를 보낼 경우 보내지지 않는 경우가 있습니다\
const WSS = new Server({
  httpServer: HTTP,
  maxReceivedFrameSize: number,
  maxReceivedMessageSize: 10 * 1024 * 1024,
  autoAcceptConnections: false,
})
*/

WSS.on("connection", (ws) => {
  ws.id = uuid()
  users.push(ws)
  console.log(`${ws.id} 접속: 총 ${users.length}명, ${WSS.clients.length}명`)
  ws.send(JSON.stringify({type: "connected", data: `${ws.id}`}))
  ws.on('error', (err) => console.log(`${ws.id} error: ${err}`))
  ws.on('close', () => {
    if(ws.room) leaveRoom(ws)
    const idx = users.findIndex(u => u.id === ws.id)
    users.splice(idx, 1)
    console.log(`${ws.id} 해제: 총 ${users.length}명`)
  })
  // 메시지 처리
  ws.on('message', (e) => {
    const {type, data} = JSON.parse(e.toString())
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
    if(type === "leave" && ws.room) leaveRoom(ws)
    if(type === "offer") return toTheOther(ws, {type: "offer", data})
    if(type === "answer") return toTheOther(ws, {type: "answer", data})
    if(type === "ice") return toTheOther(ws, {type: "ice", data})
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
/*
  wss.clients 는 리스트가 아닌 Set이므로, 개수를 셀 때 length 대신 size

*/