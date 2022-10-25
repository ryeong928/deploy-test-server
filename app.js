const PORT = process.env.PORT || 4000
const express = require('express')
const app = express()
const { Server } = require("ws")
const cors = require('cors')
const { v4 : uuid } = require('uuid')
const deployURL = "https://deploytest928.herokuapp.com"
const Router = require('./routes')


let rooms = {}
let users = []

app.use(cors({
  origin: ["http://localhost:3000", "https://deploytest928.netlify.app"],
  credentials: true
}))
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded
app.use('/files', Router.files)

app.get("/", (req, res) => {
  return res.send("deploytest928")
})
app.get('/rooms', (req, res) => {
  return res.send(Object.keys(rooms))
})

const HTTP = app.listen(PORT, () => console.log(`server listening on ${PORT}`))
const WSS = new Server({server: HTTP})

/*
기본적으로 WebSocket은 한번에 64kb 이상 데이터를 보낼 경우 보내지지 않는 경우가 있습니다
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
/*
  wss.clients 는 리스트가 아닌 Set이므로, 개수를 셀 때 length 대신 size

*/

/*
  @@ WebRTC

  -UDP(User Datagram Protocol) 기반의 스트리밍 기술

  -WebRTC 서비스는 다음과 같은 서버를 필요로 한다
    _클라이언트들의 통신을 조정하기 위한 메타데이터 교환을 위한 시그널링 서버 (Socket.io)
    _네트워크 주소 변환기(NAT) 및 방화벽 대응을 위한 서버

  *NAT(network address translation) : public/private ip address 상호 변환 기술. 보통 회사에서는 보안을 이유로 외부에서 접속 불가능한 사설 IP를 사용한다

  -시그널링
    상대방과의 연결을 위한 사전작업. 시그널링 과정에서 세가지 정보를 교환한다
    _ssesion control information : communication session의 시작, 종료, 수정을 담당
    _network data : ip address, port에 대한 정보
    _media data : determine the codecs and media types that callers and callees have in common according to SDP

  *SDP(session description protocol) : 스트리밍 미디어의 초기화 인수를 기술하기 위한 포맷

  -ICE(interactive connectivity establishment) : 두 단말이 서로 통신할 수 있는 최적의 경로(통신 가능한 IP 주소)를 찾을 수 있도록 도와주는 프레임워크
    STUN/TURN 서버를 사용하며, 우선 STUN 서버를 사용하고, 실패하면 TURN 서버를 사용한다
  -STUN : 단말이 자신의 public ip, port 를 확인하는 과정에 대한 프로토콜
  -TURN : 단말이 패킷을 릴레이 시켜줄 서버를 확인하는 과정에 대한 프로토콜

  -STUN 서버
    두 피어 사이의 통신이 가능한 공공 IP를 알려주는 역할
    단순히 정보 제공을 위한 서버라, 트래픽 발생이 매우 낮다
  -TURN 서버
    P2P연결이 실패할 경우, 트래픽을 중계하는데 사용된다. 
    NAT 타입 또는 방화벽의 제한으로 P2P연결이 실패했을 때 대안으로 사용된다.
    피어들 사이에 통신 제한이 있으면 턴서버가 피어간의 통신 채널을 중계하는 역할을 한다.
    중계 서버라 트래픽 발생이 높아, 무료 TURN 서버를 제공하는 곳이 별로 없고, 있다 하더라도 언제 제공을 끊을지 모른다
    그래서 구글에서 STUN/TURN 서버를 직접 구축할 수 있도록 오픈소스(coturn)를 제공하니, 직접 서버를 갖는게 좋겠다  
*/