import {EventEmitter } from '../../main/infrastructure/EventEmitter'

describe('Event Emitter tests', ()=>{
	let eventEmitter : EventEmitter;
	let eventName = "hello";
	
	beforeEach(()=>{
		eventEmitter = new EventEmitter();
	})
	
	it('should not fail when no event registered',()=>{
		expect(()=> eventEmitter.fireEvent("randomevent"))
			.not.toThrowError();
	});
	
	it('should fire simple event', ()=>{
		let callMe = "";
		eventEmitter.addEvent(eventName, (name) => {
			callMe = name;
		});
		
		eventEmitter.fireEvent(eventName, "didier");
		
		expect(callMe).toBe("didier");
	});
	
	it('should fire several events', ()=>{
		let callMe1 = "";
		let callMe2 = "";
		eventEmitter.addEvent(eventName, (name) => {
			callMe1 = name;
		});
		eventEmitter.addEvent(eventName, (name) => {
			callMe2 = name;
		});
		
		eventEmitter.fireEvent(eventName, "didier");
		expect(callMe1).toBe("didier");
		expect(callMe2).toBe("didier");
	});
	
	it('should remove event handler', ()=>{
		let callMe1 = "";
		let listener = (name)=>{
			callMe1 = name;
		};
		
		// add / remove listener 
		// and check nothing changed.
		eventEmitter.addEvent(eventName, listener);
		eventEmitter.removeListener(eventName, listener);
		eventEmitter.fireEvent(eventName, "didier");
		expect(callMe1).toBe("");
		
		// add back listener and check
		// it is called.
		eventEmitter.addEvent(eventName, listener);
		eventEmitter.fireEvent(eventName, "didier");
		expect(callMe1).toBe("didier");
	});
	
	it('should support event with several parameters', ()=>{
		let val1, val2 = "";
		eventEmitter.addEvent(eventName, (arg1, arg2) => {
			val1 = arg1;
			val2 = arg2;
		});
		
		eventEmitter.fireEvent(eventName, "arg1", "arg2");
		
		expect(val1).toBe("arg1");
		expect(val2).toBe("arg2");
	});
})