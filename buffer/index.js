/*
@@ Buffer
- 고정된 길이의 연속적인 raw 바이너리 데이터를 저장할 수 있는 특수한 유형의 객체
- 버퍼 크기가 설정된 후에는 크기를 변경할 수 없다
- Javascript Uint8Array and TypedArray instance
- All TypedArray methods are available on Buffer, but subtle incompatibilities between Buffer API and TypedArray API exist : slice, toString, indexOf
- Passing a Buffer to a TypedArray constructor will copy the Buffers contents, interpreted as an array of integers, and not as a byte sequence of the target type
- Passing the Buffers underlying ArrayBuffer will create a TypedArray that shares its memory with the Buffer.


  버퍼링 : 일정한 크기가 될때까지 데이터를 모으는 작업
  Node는 버퍼를 기본적으로 사용하지 않지만, 글로벌 클래스 Buffer를 제공한다
  버퍼 클래스를 사용하여, V8 heap 영역이 아닌 다른 메모리 영역에 배열과 같은 형태의 데이터를 저장할 수 있게 해준다



@@ Encoding, Decoding
- Encoding : converting a string into a Buffer using utf8, ...
- Decoding : converting a Buffer into a string using base64, hex, ascii, binary, ...

# 버퍼 읽기 : const text = buf.toString([encoding], [start], [end])
# 버퍼 쓰기 : const bytes = buf.write(string, [offset], [length], [encoding])
# 버퍼 합치기 : Buffer.concat(bufArr)
# JSON 으로 변환 : const json = buf.toJSON()
# 버퍼 비교하기 : const result = buf1.compare(buf2)
# 버퍼 복사하기 : buf1.copy(buf2, [buf1Start], [buf1End])
# 버퍼 자르기 : const buf2 = buf1.slice([start], [end])
# 버퍼 크기(bytes) : const len = buf.length

# buf.buffer : the underlying ArrayBuffer object based on which this Buffer object is created

*/



/*
@@ 버퍼 생성
- Buffer.from/alloc/allocUnsafe()
- 생성자 방법은 deprecated
- 인수로 문자열을 넘기면, 기본적으로 utf8로 인코딩
*/
if(false){
  const buffers = {
    buf01: Buffer.from('hellow'), // utf8
    buf02: Buffer.from([0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x77]), // 0xNN : 16진수의 표현
    buf03: Buffer.from(Buffer.from('hellow')),
    buf04: Buffer.from('02165987320261059', 'hex'),
    buf05: Buffer.alloc(8),
    buf06: Buffer.alloc(8, 1),
    buf07: Buffer.alloc(8, 10),
    buf07: Buffer.alloc(8, 'l'),
  }

  buffers.buf03[1] = 0x6c

  for(let key in buffers){
    console.log(buffers[key])
  }
}

/*
@@ 버퍼 쓰기
- Buffer.write()
- 기본값은 utf8
- 버퍼를 사용하는데 들었던 바이트를 리턴한다

*/
if(false){
  const buf = Buffer.alloc(8)
  const buffers = {
    buf01: () => buf.write('hellow'),
    buf02: () => buf.write('hellowhellow'),
  }

  console.log(buf)
  const result = buffers.buf01()
  console.log(result, buf)
}

/*
@@ 버퍼 순회
- 버퍼는 이터러블
*/
if(true){
  const buffer = Buffer.from('hellow')

  console.log(buffer)
  for(const b of buffer){
    console.log(b, b.toString(16))
  }
  for(const [index, b] of buffer.entries()){
    console.log(index, b, b.toString(16))
  }
}
// https://yceffort.kr/2021/10/understanding-of-nodejs-buffer