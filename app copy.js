const { createServer } = require('http')
const express = require('express')
const app = express()
const http = createServer(app)
const io = require("socket.io")(http, {cors: {origin: "*", credential: true}})
const PORT = process.env.PORT || 4000
const cors = require('cors')

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



io.on("connect", socket => {
  console.log(`new socket : ${socket.id}`)
  users.push(socket)
  currentUsers()
  // 해제
  socket.on("disconnect", () => {
    console.log(`disconnect : ${socket.id}`)
    const idx = users.findIndex(u => u.id === socket.id)
    users.splice(idx, 1)
    currentUsers()
  })
  // room
  socket.on("join", (roomName) => {
    socket.room = roomName
    socket.join(roomName)
    socket.to(roomName).emit('join')
  })
  socket.on("leave", () => {
    console.log(`leave: ${socket.id}`)
    socket.leave(socket.room)
    socket.room = undefined
  })
  // webrtc
  socket.on("offer", (offer) => socket.to(socket.room).emit("offer", offer))
  socket.on("answer", (answer) => socket.to(socket.room).emit("answer", answer))
  socket.on("ice", (ice) => socket.to(socket.room).emit("ice", ice))
})
http.listen(PORT, () => console.log(`server listening on ${PORT}`))

function currentUsers(){
  console.log('users: ', users.map(u => u.id))
}