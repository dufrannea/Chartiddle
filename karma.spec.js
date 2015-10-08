var tests = [];
for (var file in __karma__.files) {
    if (__karma__.files.hasOwnProperty(file)) {
        if (/tests\/.*Spec\.js$/.test(file)) {
            var filePath = file.replace(/^\/base\/build\/tests\//g, '../tests/');
            filePath = filePath.replace(/\.js$/g, '');
            tests.push(filePath);
        }
    }
}

requirejs.config({
    baseUrl: '/base/build/main',
    deps: tests,
    callback: __karma__.start,
    paths : {
		react : 'bower_components/react',
		flux : 'bower_components/Flux',
		bootstrap : "bower_components/bootstrap.min",
		jquery : "bower_components/jquery.min",
		dropzone: 'bower_components/dropzone-amd-module.min',
		papaparse: 'bower_components/papaparse'
	}
});