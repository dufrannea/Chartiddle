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
    callback: __karma__.start
});