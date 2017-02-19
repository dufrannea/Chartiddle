var __slice = [].slice;

export class EventEmitter {

  private events: {
    [eventKey: string]: Function[];
  };

  constructor() {
    this.events = {};
  }

  fireEvent(event, ...args) {
    if (this.events[event] === undefined) {
      return false;
    }
    this.events[event].forEach(listener=>{
      listener.apply(null, args);
    });
    return true;
  };
  
  addEvent(event: string, listener: Function) {
    this.fireEvent('newListener', event, listener);
    if (this.events[event] === undefined) {
      this.events[event] = []
    }
    this.events[event].push(listener);
    return this;
  };

  on = this.addEvent;

  once(event, listener, ...args) {
    let fn = () => {
      this.removeListener(event, fn);
      return listener.apply(null, args);
    };
    this.on(event, fn);
    return this;
  };

  removeListener(event, listener) {
    if (!this.events[event]) {
      return this;
    }
    this.events[event] = this
                          .events[event]
                          .filter(x=> x !== listener);
    return this;
  };
  removeAllListeners(event) {
    delete this.events[event];
    return this;
  };
}