const cluster = require('cluster')
const os = require('os')
const process = require('process')
const express = require('express')
const PORT = 4000
/*
  @@ cluster : 싱글 프로세스로 동작하는 Node.js에 여러 프로세스를 생성하여 CPU 코어를 모두 사용할 수 있게 해주는 모듈

  Cluster module enables the creation of child processs (Worker instance) that run simultaneously and share the same server port.
  Each spawned child has its own event loop, memory, and V8 instance.
  It is built on top of the child_process module.
  the workers use IPC to communicate with the parent Node.js process.

  incoming connections are distributed among child processes in one of two ways.
  -the master process listens for connections on a port and distributes them across the workers in a round-robin fashion.
  -the master process creates a listen socket and sends it to interested workers that will then be able to accept incoming connections direectly.

  Clustering shines when it comes to CPU-intensive tasks. 
  Because of the additional resource allocations, spawning a large number of child processes is not always recommended.

  Node.js는 V8엔진의 제한을 반영하여, 기본적으로 하나의 프로세스가 32bit에서는 512MB, 64bit에서는 1.5GB 메모리를 사용하도록 제한되어 있다
  여러개의 워커들을 병렬로 동작시켜 효율을 극대화하는것이 바람직하다
  포트를 공유하는 Node 프로세스를 여러개 둘 수 있으므로, 병렬로 실행된 서버의 수만큼 요청이 분산되게 할 수 있다
  단, 메모리를 공유하지는 못하는데, 이는 레디스 등의 서버를 도입하여 해결할 수 있다


  @@ master process : worker process 를 생성하고, 해당 포트에서 대기하면서, 요청이 들어오면 worker process에 분배한다

  @@ worker/child process

*/
if(false){
  if(cluster.isMaster){
    console.log(`master process ${process.pid}`)
    // 워커 생성
    const worker = cluster.fork()
    // 워커 생성시 발생하는 이벤트 리스너
    cluster.on('online', (w) => {
      console.log(`worker process ${w.process.pid}`)
      // 워커에게 보내는 메시지
      w.send('do your job, worker!')
      // 워커가 보내는 메시지 리스너
      w.on('message', (m) => console.log(`message from worker ${w.process.pid}: ${m}`))
    })
    // 워커가 죽으면 발생하는 이벤트 리스너
    cluster.on('exit', (w, code, signal) => {
      // 워커 재생성
      // cluster.fork()
      console.log(`worker ${w.process.pid} exited`)
    })
  }else if(cluster.isWorker){
    // 마스터가 보내는 메시지 리스너
    process.on('message', (m) => console.log(`message from master: ${m}`))
    // 마스터에게 보내는 메시지
    process.send(`i'll do my job, master!`)
    // 워커 종료
    setTimeout(() => process.exit(0), 1000)
  }
}
// 단일 서버 생성
if(false){
  const app = express()
  app.get("/", (req, res) => res.send(`i'm worker ${process.pid}`))
  app.get("/:n", (req, res) => {
    let n = parseInt(req.params.n) > 10000000 ? 10000000 : parseInt(req.params.n)
    let count = 0
    for(let i=0 ; i<=n; i++){
      count += i
    }
    res.send(`count: ${count}`)
  })
  app.listen(PORT, () => console.log(`${process.pid} worker server listening on port ${PORT}`))
  /*
    npm i -g loadtest
    loadtest http://localhost:4000/10000000 -n 2000 -c 200
    Total time: 19.5s
    Requests per second: 102
    Mean latency : 1856ms
  */
}
// 멀티 서버 생성
if(false){
  if(cluster.isMaster){
    console.log(`master process ${process.pid}`)
    // 일반적으로 워커는 CPU 갯수만큼 생성하여, 멀티 코어의 기능을 활용한다
    os.cpus().forEach(cpu => cluster.fork())
    
  }else if(cluster.isWorker){
    const app = express()
    console.log(`worker process ${process.pid}`)
    
    app.get("/", (req, res) => res.send(`i'm worker ${process.pid}`))
    app.get("/:n", (req, res) => {
      let n = parseInt(req.params.n) > 10000000 ? 10000000 : parseInt(req.params.n)
      let count = 0
      for(let i=0 ; i<=n; i++){
        count += i
      }
      res.send(`count: ${count}`)
    })
    app.listen(PORT, () => console.log(`${process.pid} worker server listening on port ${PORT}`))
    /*
      loadtest http://localhost:4000/10000000 -n 2000 -c 200
      Total time: 3.9s
      Requests per second: 507
      Mean latency : 372ms
    */
  }
}
/*
  클러스터를 직접 관리하는 대신, Node 모니터링 라이브러리 PM2를 사용
  pm2 start app.js -i 0
  pm2 stop app.js
*/
