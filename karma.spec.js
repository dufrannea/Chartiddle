var tests = [];
for (var file in __karma__.files) {
    if (__karma__.files.hasOwnProperty(file)) {
        if (/test\/components\/.*\.js$/.test(file)) {
            tests.push(file);
        }
    }
}

console.info(__karma__.files)

requirejs.config({
    baseUrl: '/base/build/main',
    deps: tests,
    callback: __karma__.start
});