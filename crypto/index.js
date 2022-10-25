const crypto = require('crypto')
const bcrypt = require('bcrypt')
const password = 'password'

/*
  @@ 단방향 암호화
  암호화만 가능하고, 복호화 할 수 없는 암호화 방식으로서, 암호화된 문자열로만 비교하는 방법
  대부분의 사이트는 비밀번호를 복호화할 필요가 없다
    
  단방향 알고리즘 : hash function, md5, sha256, sha512
    해쉬 함수 : 같은 입력값에 같은 출력값이 나오는걸 보장하지만, 출력값으로 입력값을 유추할 수 없는 것을 의미한다
    해쉬 알고리즘 : 주어진 문자열을 고정된 길이의 다른 문자열로 변경하는 것을 말한다
    해쉬 함수를 통과하기 전의 원본 데이터를 message라 부르고, 통과된 이후의 데이터를 digest라 부른다

  const hash = crypto.createHash(hashAlgorithm, [options]) : hash object(instance)를 생성한다. 사용 가능한 알고리즘으로 sha256, sha512 가 있다
  hash.update(message, [encoding]) : 암호화할 문자열을 입력하여 hash content를 update한다
  const digest = hash.digest([encoding]) : 반환받을 인코딩 타입을 입력하고, 암호화된 문자열을 반환한다. 타입으로 base64, hex 이 주로 사용되며, 기본 반환 타입은 Buffer

  위와 같은 암호화는 동일한 문자열에 대해 동일한 문자열을 반환하므로, 보안상 문제가 될 수 있다
  입력값-출력값을 저장해 놓은 것을 레인보우 테이블이라고 한다
  이를 해결하기 위해 salt와 key stretching을 사용한다 : hash(salt + message) => digest
  salt : 기존 문자열에 덧붙이는 임의의 문자열
  salting : 기존 문자열에 salt를 덧붙여 digest를 생성하는 것
  key stretching : salt와 message를 해쉬 함수에 넣는 과정을 반복하여 digest를 생성하는 방법. 서버 부하가 생긴다. 동일한 횟수 만큼 해시화 해야한다. 방법으로는 pbkdf, scrypt, bcrypt가 있다

  randomBytes(bytes, (err, buf) => {}) : 해당 바이트 길이의 임의의 문자열 buf, 즉 salt를 생성한다. salt와 digest를 DB에 저장하고, 로그인 비밀번호를 동일한 salt와 해쉬하여 digest 일치 여부를 확인한다. 이때 솔트의 길이는 32 바이트 이상이어야 salt와 digest를 추측하기 어렵다
  pbkdf2(password, salt, iterations, bytes, hashAlgorithm, (err, hashedKey) => {})
*/
// hash 단방향 암호화
if(false){
  const createHashedPassword = (password) => {
    const algorithm = 'sha256'
    const encoding = 'base64'
    const hashedPassword = crypto.createHash(algorithm).update(password).digest(encoding)
    console.log('hashedPassword: ', hashedPassword)
  }
  createHashedPassword('passwordcrypto')
}
// hash, salt, key stretching 단방향 암호화
if(false){
  const createSalt = () => new Promise((res, rej) => {
    crypto.randomBytes(32, (err, buf) => {
      if(err) rej(err)
      else res(buf.toString('base64'))
    })
  })
  const createHashedPassword = (message, salt = null) => new Promise(async(res, rej) => {
    const iterations = 10
    const keylen = 32
    const algorithm = 'sha256'
    const encoding = 'base64'

    if(!salt){
      const salt = await createSalt()
      crypto.pbkdf2(message, salt, iterations, keylen, algorithm, (err, key) => {
        if(err) rej(err)
        else res({password: key.toString(encoding), salt})
      })
    }else{
      crypto.pbkdf2(message, salt, iterations, keylen, algorithm, (err, key) => {
        if(err) rej(err)
        else res({password: key.toString(encoding)})
      })
    }
  })
  async function hashing(message){
    const { password: originHashedPassword, salt } = await createHashedPassword(message)
    const { password: trialHashedPassword } = await createHashedPassword(message, salt)
    if(originHashedPassword === trialHashedPassword) console.log("로그인 성공: ", originHashedPassword)
    else console.log("로그인 실패")
  }
  hashing("passwordcrypto")
}
/*
  @@ 양방향 암호화
  양방향 암호화는 암호화된 문자열을 기존 문자열로 복호화 할 수 있는 암호화 기법
  암호화/복호화에 사용하는 키의 동일성에 따라 대칭형/비대칭형 암호화로 나누어진다

    _대칭키 알고리즘
      암호화와 복호화에 동일한 키를 사용
      블록암호, 스트링암호
      des, seed, aes, aria

    _비대칭키 알고리즘
      암호화와 복호화에 서로 다른 키를 사용
      공개키로 암호화하고, 비밀키로 복호화
      rsa. ecdsa

  generateKeyPair(type, options, (err, publicKey, privateKey) => {}) : 주어진 type에 따른 새로운 비대칭키를 생성한다
  publicEncrypt(key, buffer) : 주어진 key를 가지고 buffer의 내용을 암호화하여 새로운 buffer에 담아 반환한다
  createPrivateKey(key) : privateKey를 가진 새로운 key object를 반환한다
  privateDecrypt(privateKey, buffer) : 주어진 key를 가지고 buffer의 내용을 복호화하여 새로운 buffer에 담아 반환한다
*/
// 대칭형 양방향 암호화
if(false){
  const key = "crypto"
  const password = "passwordcrypto"

  const cipher = (password, key) => {
    const encrypt = crypto.createCipheriv('des', key)
    const encryptResult = encrypt.update(password, 'utf8', 'base64') + encrypt.final('base64')
    return encryptResult
  }
  const decipher = (password, key) => {
    const decode = crypto.createDecipheriv('des', key)
    const decodeResult = decode.update(password, 'base64', 'utf8') + decode.final('utf8')
    return decodeResult
  }
  const encrypt = cipher(password, key)
  const decode = decipher(encrypt, key)
  console.log('대칭형 양방향 암호화: ', password, decode)
}
// 비대칭형 양방향 암호화
if(false){
  const type = 'rsa'
  const options = {
    modulusLength: 2048, // 256 bytes
    publicKeyEncoding: {type: 'spki', format: 'pem'},
    privateKeyEncoding: {type: 'pkcs8', format: 'pem', cipher: 'aes-256-cbc', passphrase: 'top secret'}
  }
  const cb = (err, publicKey, privateKey) => {
    // 공개키로 암호화
    const password = 'passwordcrypto'
    const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(password))
    // 비밀키로 복호화
    const key = crypto.createPrivateKey({key: privateKey, format: 'pem', passphrase: 'top secret'})
    const decrypted = crypto.privateDecrypt(key, Buffer.from(encrypted, "base64")).toString('utf-8')
    console.log('비대칭형 양방향 암호화: ', password, decrypted)
  }
  crypto.generateKeyPair(type, options, cb) // 주어진 type에 따른 새로운 비대칭키를 생성한다
}
/*
  ISO-27001 보안 규정을 준수해야하는 상황이면 pbkdf2
  일반적으로 규정을 준수해야할 상황이 아니면 구현이 쉽고 비교적 강력한 bcrypt. Blowfish 알고리즘을 사용하며, crypto에 비하면 해싱에 많은 비용이 든다
  고비용 보안 시스템 구현에는 scrypt
*/
// Bcrypt
if(true){
  const salt = 10 // 값이 높을수록 암호화 연산이 증가
  async function bcryptHash(){
    // 회원가입
    const hashed = await bcrypt.hash(password, salt)
    // 로그인
    const match = await bcrypt.compare(password, hashed)
    if(match) console.log("로그인 성공")
    else console.log("로그인 실패")
  }
  bcryptHash()
}