/*
  @@ Buffer : 고정된 길이의 바이트의 연속을 표현하는 객체. 일정한 크기가 될때까지 데이터를 모아 한 번에 처리

  버퍼링 : 일정한 크기가 될때까지 데이터를 모으는 작업
  Node는 버퍼를 기본적으로 사용하지 않지만, 글로벌 클래스 Buffer를 제공한다
  버퍼 클래스를 사용하여, V8 heap 영역이 아닌 다른 메모리 영역에 배열과 같은 형태의 데이터를 저장할 수 있게 해준다


*/
/*
  버퍼 쓰기 : const bytes = buf.write(string, [offset], [length], [encoding])
    string : 버퍼에 쓸 문자열 데이터
    offset : 문자열을 쓰기 시작 할 버퍼의 이덱스
    length : 버퍼에 쓸 데이터의 바이트 크기
    encoding : utf8이 기본값
*/
/*
  버퍼 생성 : const buf = new Buffer.alloc(size, [fill], [encoding])
  버퍼 합치기 : Buffer.concat(bufArr)
*/
const buf0 = new Buffer.alloc(10) // zero-filled 10 바이트 버퍼 생성
const buf1 = new Buffer.alloc(6, 't') // 전부 t로 채워진 6 바이트 버퍼 생성
const buf2 = new Buffer.alloc(6, 'texi') // textte
const buf3 = Buffer.concat([buf1, buf2])
const buf4 = Buffer.from([1,2,3])
console.log(buf4.toString())
/*
  JSON 으로 변환 : const json = buf.toJSON()

  버퍼 읽기 : const text = buf.toString([encoding], [start], [end])
  
  버퍼 비교하기 : const result = buf1.compare(buf2)

  버퍼 복사하기 : buf1.copy(buf2, [buf1Start], [buf1End])

  버퍼 자르기 : const buf2 = buf1.slice([start], [end])

  버퍼 크기(bytes) : const len = buf.length
*/