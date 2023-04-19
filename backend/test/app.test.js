const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/app');
const expect = chai.expect;

chai.use(chaiHttp);

// Prueba unitaria
describe('Unit test: logger.js', () => {
  const logger = require('../src/middleware/logger');

  it('should be a middleware function', () => {
    expect(logger).to.be.a('function');
  });
});

// Prueba de integración
describe('Integration test: root route', () => {
  it('GET / should return status 200 and a JSON object', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.message).to.equal('works!');

        done();
      });
  });
});

