module.exports = process.env.APPER_COVERAGE
    ? require('./lib-cov/apper')
    : require('./lib/apper');