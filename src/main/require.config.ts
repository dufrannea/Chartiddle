/// <reference path="../typings/tsd.d.ts"/>

declare var require : Require;

require = <any>{
	baseUrl : ".",
	paths : {
		react : 'bower_components/react',
		flux : 'bower_components/Flux',
		bootstrap : "bower_components/bootstrap.min",
		jquery : "bower_components/jquery.min"
	},
	shim : {
		bootstrap : ['jquery']
	}
}