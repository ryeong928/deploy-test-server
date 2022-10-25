const PORT = 4000
const HOST = '127.0.0.1'
const dgram = require('dgram')
const client = dgram.createSocket('udp4')
const server = dgram.createSocket('udp4')
const { Buffer } = require('buffer')

server.on('close', () => console.log('UDP server closed'))
server.on('error', (e) => console.log(`UPD server error: ${e}`))
server.on('listening', () => {
  const address = server.address()
  console.log(`UDP server listening on ${address.address} . ${address.port}`)
})
server.on('message', (m, r) => {
  console.log(`${r.address} . ${r.port}: ${m}`)
})
server.bind(PORT, HOST)

// client
setTimeout(() => {
  const m = Buffer.from('are you UDP server?')
  client.send(m, 4000, '127.0.0.1', (err) => client.close())
}, 2000)