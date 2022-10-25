/*
  @@ child_process : provides the ability to spawn new processes which has their own memory.

  노드의 이벤트 루프는 싱글 스레드이기에, 프로세스 내부에서 하나의 스레드만 이용한다

  By default, pipes for stdin, stdout, and stderr are established between the parent Node.js process and the spawned subprocess. 

  ChildProcess 클래스는 EventEmitter 클래스를 상속한다
  
*/

const {spawn, fork, exec} = require('child_process')

if(false){
  const child = spawn("ls")
  child.stdout.on('data', (data) => console.log(`stdout: ${data}`))
  child.stderr.on('err', (err) => console.log(`stderr: ${err}`))
  child.on('close', (code) => console.log(`cp exited with code: ${code}`))
}
if(true){
  const cp = fork('./child_process/sub.js')
  cp.on("message", (m) => console.log(`message from child process: ${m}`))
  cp.send("do your job, sub process!")
}
/*

  -child process 생성 메서드
    .spawn(command, [args], [options]) : 비동기적으로 새로운 process를 생성하여 명령어를 실행
      options: {
        cwd : current working directory of the child process. default: 부모의 현재 작업 디렉토리
        env : environment key-value pairs. default: process.env
        stdio : child's stdio configuration
        uid : set the user identity of the process
        gid : set the group identity of the process
        ...
      }
    .fork()
    .exec() : shell을 실행해서 명령어를 실행
    .execFile()

  -child process event
    message : when process.send() is called by child
    close : when stdio streams close
    disconnect : after child.disconnect() is called by parent
    exit : when process ends
    error

  -child process 생성 : const cp = child_process.spawn(command, args, [options])
    
      default options = { 
        cwd: undefined,    : 생성된 프로세스가 실행되는 디렉토리를 지정
        env: process.env,  : 새 프로세스가 접근할 수 있는 환경 변수를 지정
        setsid: false      : 서브 프로세스를 새로운 세션으로 생성할지 여부
      }

  -child process 스트림 종류
    
    cp.stdin  : 자식 프로세스의 stdin을 나타내는 writable stream
    cp.stdout : 자식 프로세스의 stdout을 나타내는 readable stream
    cp.stderr : 자식 프로세스의 stderr을 나타내는 readable stream

  -child process command 실행 : child_process(command, [options], (err, stdout, stderr){})
    
    default options = {
      encoding: 'utf8',
      timeout: 0,
      maxBuffer: 200 * 1024,
      killSignal: 'SIGTERM',
      cwd: null,
      env: null
    }
*/