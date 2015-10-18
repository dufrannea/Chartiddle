/// <reference path="../typings/tsd.d.ts"/>

declare var require : Require;

require = <any>{
	baseUrl : ".",
	paths : {
		requireLib : 'bower_components/require',
		react : 'bower_components/react',
		flux : 'bower_components/Flux',
		bootstrap : "bower_components/bootstrap.min",
		dropzone: 'bower_components/dropzone-amd-module.min',
		papaparse: 'bower_components/papaparse',
		"jquery-ui": "bower_components/jquery-ui.min",
		"jquery-hive" : "bower_components/jquery-hive.pollen",
		"jquery" : "bower_components/jquery.min",
		"es6-promise" :"bower_components/promise",
		"text" : "bower_components/text"
	},
	shim : {
		bootstrap : ['jquery']
	}
}