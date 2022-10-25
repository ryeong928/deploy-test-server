process.on("message", (m) => {
  console.log(`message from parent process: ${m}`)
  heavyWork()
  process.send(`i'm done, parent process!`)
  process.exit()
})

function heavyWork(){
  let n = 0
  for(let i = 0; i < 5000000000 ; i++){
    n += 1
  }
}