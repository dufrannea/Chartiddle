/// <reference path="../../typings/jasmine/jasmine.d.ts" />

import {Addition} from '../../main/app/toto';

describe('a simple test', ()=>{
	it("should be ok", ()=>{
		expect(new Addition().add(1,1)).toBe(2);
	})
})