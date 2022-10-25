/*
  @@ events

  Much of the Node.js core API is built around an idiomatic asynchronous event-driven architecture
  in which certain kinds of objects called emitters emit named events 
  that cause function objects called listeners to be called.
  (각각의 프로그래밍 언어가 가지고 있는 특성에 따라, 같은 feature를 다양하게 표현하는 것을 프로그래밍 이디엄이라 부른다)

  All objects that emit events are instances of the EventEmitter class.
  when the EventEmitter object emits an event, all of the functions attached to that specific event are called synchronously.
  any values returned by the called listeners are ignored and discarded.
  (리스너를 화살표 함수로 작성한게 아니라면, 리스너 함수 내에서 this는 리스너를 등록한 EventEmitter를 가리킴)

  The EventEmitter calls all listeners synchronously in the order in which they were registered.
  Listener functions can switch to an asynchronous mode of operation using the setImmediate() or process.nextTick() methods.

  When an error occurs within an EventEmitter instance, the typical action is for an error event to be emitted.
  If an EventEmitter does not have at least one listener registered for the error event, and an error event is emitted,
  the error is thrown, a stack trace is printed, and the Node.js process exits.

  Listeners are managed using an internal array.


  @@ EventEmitter.method

  on('event', listener) : 해당 이벤트 리스너를 리스너 배열 뒤에 등록 === addListener
  off('event', listener) : 해당 이벤트 리스터를 리스너 배열에서 제거 === removeListener
  once('event', listener) : 일회성 이벤트 리스너를 리스너 배열 뒤에 등록. 해당 이벤트가 방출되면, 이벤트 리스너는 리스너 배열에서 제거된 뒤 실행된다
  emit('event', [arg]) : 이벤트 방출. 해당 이벤트와 관련된 리스너가 없다면 false, 있으면 true 반환
  removeAllListeners('event') : 해당 이벤트에 연결된 모든 리스터를 제거
  prependListener('event', listener) : 이벤트 리스너를 리스너 배열 앞에 등록
  prependOnceListener('event', listener) : 일회성 이벤트 리스너를 리스너 배열 앞에 등록
  eventNames() : 등록된 이벤트들을 반환
  listeners('event') : 해당 이벤트로 등록된 리스너들을 반환
  listenerCount('event') : 해당 이벤트에 몇개의 이벤트 리스너가 연결되었는지 반환

*/

const EventEmitter = require('events')

if(true){
  const customEvent = new EventEmitter()
  const listener = () => console.log('커스텀 이벤트 리스너 실행!')
  customEvent.on('customEvent', listener)
  customEvent.once('customEvent', () => console.log('일회성 이벤트 리스너 실행!'))
  
  const count = customEvent.listenerCount('customEvent')
  console.log('customEvent 리스너 개수: ', count)

  customEvent.emit('customEvent')
  customEvent.emit('customEvent')
  customEvent.emit('customEvent')
  customEvent.off('customEvent', listener)
  customEvent.emit('customEvent')
  customEvent.removeAllListeners('customEvent')
}