const { createReadStream, createWriteStream, writeFileSync } = require('fs')
const zlib = require('zlib')

// writeStream
if(false){
  const ws = createWriteStream('./streams/test.txt')
  ws.write('안녕하세요? 저는 스트림을 배우고 있어요\n')
  ws.write('그러니 잘 부탁 드립니다\n')
  ws.write('감사합니다 ^^')
  ws.on('end', () => {console.log('파일 쓰기 완료')})
}
// readStream
if(false){
  const rs = createReadStream('./streams/test.txt', {highWaterMark: 10})
  const data = []
  rs.on('data', chunk => data.push(chunk))
  rs.on('end', () => console.log(`파일 읽기 완료: `, Buffer.concat(data).toString()))
}
// big file : buffer
if(false){
  const data = []
  console.log('작업전 메모리 사용량: ', process.memoryUsage().rss)
  for(let i=0; i<300000; i++){
    data.push('안녕하세요 버퍼입니다\n')
  }
  writeFileSync('./streams/big.txt', data.join(''))
  console.log('작업후 메모리 사용량: ', process.memoryUsage().rss)
}
// big file : pipe
if(true){
  console.log('작업전 메모리 사용량: ', process.memoryUsage().rss)
  const rs = createReadStream('./streams/big.txt', {highWaterMark: 15000})
  const ws = createWriteStream('./streams/newBig.txt')
  rs.pipe(ws)
  rs.on('end', () => console.log('작업후 메모리 사용량: ', process.memoryUsage().rss))
  ws.on('finish', () => console.log('파일 전부 작성'))
}
// zlib
if(false){
  const rs = createReadStream('./streams/big.txt')
  const ws = createWriteStream('./streams/newBig.txt')
  const zs = zlib.createGzip()
  rs.pipe(zs).pipe(ws)
  rs.on('end', () => console.log('파일 스트림 압축 완료'))
}

/*
  @ stream

  데이터를 일정한 크기로 나눠서 여러 번에 순차적으로 전달
  EventEmitter의 인스턴스이기에 이벤트 핸들러를 작성할 수 있고, 관련 이벤트를 방출할 수 있다
  스트리밍 : 일정한 크기의 데이터를 지속적으로 전달하는 작업

  @ stream type

  -readable   : fs.createReadStream
  -writable   : fs.createWriteStream, process.stdout
  -duplex     : readable and writable like TCP socket
  -transform  : 기본적으로 duplex stream인데, 데이터를 읽거나 기록할 때 수정/변환될 수 있는 데이터. like gzip을 이용해 데이터를 압축하는 zlib.createGzip

  pipe 메서드를 이용하면, 스트림끼리 연결하여 더 간단하게 스트림 데이터를 사용할 수 있다
  readableSrc.pipe(writableDest) : 읽기 가능한 스트림의 출력과 쓰기 가능한 스트림의 입력을 파이프로 연결
  readableSrc.pipe(transformStream).pipe(writableDest) 처럼 체이닝 가능

  이벤트를 사용하는 방법과, pipe 메서드를 사용하는 방법은 혼용하지 말아야 하며,
  커스텀한 방법으로 스트림을 사용하려면 이벤트를 사용해야한다

  @ stream event and function

  readable stream 
  -events
    readable : 스트림에 데이터가 남아있는 경우 자동으로 발생하는 이벤트
    data : 스트림이 소비자에게 데이터 청크를 전송할 때 발생
    end : 스트림에 더이상 소비할 데이터가 없을 때 발생
    error, close, 
  -functions : pipe, unpipe, read, unshift, resume, pause, isPaused, setEncoding

  writable stream
  -events
    drain : 쓰기 가능한 스트림이 더 많은 데이터를 수신할 수 있다는 신호
    finish : 모든 데이터 쓰기 작업 완료. 모든 데이터가 시스템으로 플러시 될 때 발생
    error, close, pipe, unpipe
  -functions : write, end, cork, uncork, setDefaultEncoding

  readable.on("data", (chunk) => {
    writable.write(chunk)
  })
  readable.on("end", () => {
    writable.end()
  })

  읽기 가능한 스트림의 두 가지 주요 모드 : pause, flowing


  @ stream deep dive

  file.write를 할 때 highWaterMark(내부 버퍼에 저장할 최대 바이트)에 지정한 값보다 큰 버퍼를 쓰려고 할 땐, 
  write()가 false를 리턴한다.
  스트림이 빠져나가는 동안 write()를 호출하면 청크가 버퍼링되고 false가 반환되고, 
  현재 버퍼링된 모든 청크가 빠져나가면 drain 이벤트가 발생한다.
  만약 스트림이 다 빠져나가지 않았는데 write()가 계속 발생되면 메모리가 다시 반환되지 않을 수 있다.
  그래서 메모리 누수가 발생했던 것이다.
  메모리 누수를 막기위해서는 다음과 같이 write()가 false일 때 스트림에 모든 데이터가 빠져나간 뒤(drain 이벤트 발동),
  test 함수가 다시 동작할 수 있도록 만들어야 한다

*/
 
