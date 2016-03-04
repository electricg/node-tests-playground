# Node.js test playground

* Testing framework: [mocha](https://mochajs.org/)
* Assertion library: [should.js](https://github.com/tj/should.js)
* Mocking library: [Sinon.JS](http://sinonjs.org/)
* HTTP mocking library: [Nock](https://github.com/pgte/nock)
* Library to make HTTP calls: [request](https://www.npmjs.com/package/request)
* Dependency injection: [rewire](https://github.com/jhnns/rewire/)
* Code coverage tool: [Instabul](https://github.com/gotwarlost/istanbul)
* Static code analysis tool: [JSHint](https://github.com/jshint/jshint/)
* Mocking for Mongoose: [Mockgoose](https://github.com/mccormicka/Mockgoose)


* Calling mockgoose a lot of time killed the machine
* Using mongoose so to properly mock it with mockgoose
* Test forces you to write more modular or reusable code
* It's not always write tests first, but it helps if you have already in mind all the possible outcomes, for example when testing an API endpoint, having the spec saying it will return 200, 201, 400, 401, 207, 500, it makes you write the tests that return those headers first
* Inspiration from http://www.clock.co.uk/blog/tools-for-unit-testing-and-quality-assurance-in-node-js