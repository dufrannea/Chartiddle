/// <reference path="../../typings/tsd.d.ts"/>

type State<S,A> = (s : S) => Promise<{ s : S; a : A}>;

let bind=  function<A,B,S>(ma : State<S,A>, f : (a : A) => State<S,B>) : State<S,B>{
	return (sp : S)=> {
		return ma(sp)
			.then((newval)=>{
				let { s = null, a = null} = newval;
				return f(a)(s);
			});
	}
}


let returnm = function<S,A>(a : A) : State<S,A>{
	return (s:S)=>{
		return new Promise((success)=>{
			success({
				s : s,
				a : a
			});
		});
	}
}

export var dbMonad = {
	b : bind,
	r: returnm
}

let openDb = (name : string) => () => {
	return new Promise((success)=>{
		let request = indexedDB.open(name);
		request.onsuccess = ()=>{
			success(request.result);			
		}
	});
}

let getState = () => function<S>(s : S) : Promise<{s:S,a:S}>{
	return new Promise((success)=>{
		return {
			s:s,
			a:s
		}	
	})
}

dbMonad.b(
	getState(),
	(db)=>dbMonad.r(db))

let a = dbMonad.r(1);