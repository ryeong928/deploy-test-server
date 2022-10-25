/*
  @@ worker_threads : enables the use of multi-thread that execute JavaScript in parallel

  Ideally, the number of threads created should be equal to number of cpu cores.
  Workers are useful for performing CPU-intensive JavaScript operations.
  Worker threads provide a mechanism to run CPU-intensive tasks without blocking the main event loop. 
  They do not help much with I/O-intensive work.
  Unlike child_process or cluster, worker_threads can share memory.
  They do so by transferring ArrayBuffer instances or sharing SharedArrayBuffer instances.

  -기존 브라우저 특징 : 하나의 프로세스/스레드/이벤트루프/js엔진인스턴스/Node.js인스턴스
  -워커 스레드 특징 : 하나의 프로세스, 여러개의 스레드, 스레드별 하나의 이벤트루프/js엔진인스턴스/Node.js인스턴스

*/

const { Worker, isMainThread, parentPort, MessageChannel, MessagePort, workerData } = require('worker_threads')
/*
  Worker : 워커 클래스는 독립적인 자바스크립트 실행 스레드를 의미
  isMainThread : 현재 코드가 메인 스레드에서 실행되면 true, 워커 스레드에서 실행되면 false
  parentPort : 메시지 포트의 인스턴스
  MessageChannel : MessagePort를 생성하여 워커 간 데이터 송수신하는 방법
  workerData : 워커의 초기 데이터 설정
*/
if(false){
  if(isMainThread){ // 메인 스레드가 처리할 내용 : 워커 생성 및 작업 분배
    /*
      @ 워커를 생성하는 두 가지 방법
        파일명 넘기기 : new Worker(filename)
        실행하고자 하는 코드를 작성 : new Worker(code, {eval: true})
    */
    const worker = new Worker(__filename)
    /*
      @ 메인과 워커간 데이터 송수신
        worker.postMessage : 메인에서 워커로 데이터 전달
        worker.on : 워커로부터 데이터를 받음
        parentPort.postMessage : 워커에서 메인으로 데이터 전달
        parentPort.on : 메인으로부터 데이터를 받음
        parentPort.close : 워커를 종료시키기 위해 exit 이벤트 발생
    */
    worker.on('message', (v) => console.log('from worker: ', v))
    worker.on('exit', (v) => console.log(`worker's done`))
    worker.postMessage('ping')
  
  }else{  // 워커 스레드가 처리할 내용 : 작업 및 결과 전달
    parentPort.on('message', (v) => {
      console.log('from main: ', v)
      parentPort.postMessage('pong')
      parentPort.close()
    })
  }
}
// 멀티 워커 스레드
if(false){
  if(isMainThread){
    const threads = new Set()
    threads.add(new Worker(__filename, {workerData: {start: 1}}))
    threads.add(new Worker(__filename, {workerData: {start: 2}}))
    for(let worker of threads){
      worker.on('message', (v) => console.log('from worker: ', v))
      worker.on('exit', () => {
        threads.delete(worker)
        if(threads.size === 0) console.log(`every worker's done`)
      })
    }
  }else{
    const data = workerData
    parentPort.postMessage(data.start + 100)
  }
}
// 워커간 데이터 송수신
if(false){
  const {port1, port2} = new MessageChannel() 
  const worker1 = new Worker('./worker1.js')
  const worker2 = new Worker('./worker2.js')
  worker1.postMessage({worker2: port1}, [port1])
  worker2.postMessage({worker1: port2}, [port2])
  // worker1.js
  parentPort.once('message', ({worker2}) => {
    worker2.postMessage('message from worker1')
  })
}
// CPU-intensive sync function : 2부터 1000만까지의 소수를 찾기
let min = 2, max = 10000000, primes = [];
function generatePrimes(start, range) {
  let isPrime = true;
  const end = start + range;
  for (let i = start; i < end; i++) {
    for (let j = min; j < Math.sqrt(end); j++) {
      if (i !== j && i % j === 0) {
        isPrime = false;
        break;
      }
      if (isPrime) primes.push(i)
      isPrime = true;
    }
  }
  return primes.length
}
if(true){
  console.time('CPU-intensive')
  console.log(process.memoryUsage().rss)
  console.log(`primes count: `, generatePrimes(min, max))
  console.log(process.memoryUsage().rss)
  console.timeEnd('CPU-intensive')
  /*
    메인 싱글 스레드로 처리한다면 약 8초가 걸리며,
    이 기간동안 이벤트 루프는 블락 상태임
  */
}
// 실전
if(false){
  if (isMainThread) {
    const threadCount = 2
    const threads = new Set()
    const range = Math.ceil((max - min) / threadCount)
    let start = min
    console.time('CPU-intensive')
    console.log(process.memoryUsage().rss)
    // 워커의 작업을 직접 짜고 분배해야한다
    for (let i = 0; i < threadCount - 1; i++) {
      const wStart = start;
      threads.add(new Worker(__filename, { workerData: { start: wStart, range: range } }))
      start += range;
    }
    // 7개만 for돌고 마지막 워커는 특별해서 따로 지정
    threads.add(new Worker(__filename, { workerData: { start: start, range: range + ((max - min + 1) % threadCount) } }));
    for (let worker of threads) {
      worker.on('error', (err) => {throw err})
      worker.on('exit', () => {
        threads.delete(worker);
        if(threads.size ===0){
          console.log(process.memoryUsage().rss)
          console.timeEnd('CPU-intensive')
          console.log('primes count: ', primes.length);
        }
      });
      // 워커들의 작업 결과를 직접 정리해 줘야함
      worker.on('message', (msg) => {
        primes = primes.concat(msg)
      })
    }
  } else {
    generatePrimes(workerData.start, workerData.range);
    parentPort.postMessage(primes);
  }
  /*
    소요 시간이 많이 줄긴 하지만, 메인 싱글 스레드에 비해 1/threadCount 만큼 소요되지는 않는다
    코어가 6개인데, 워커가 8개면, 6개가 먼저 진행이 되고, 자리가 남으면 나머지 2개가 진행된다
    threadCount를 계속 바꿔가면서 최적의 워커의 갯수를 파악하자
  */
}