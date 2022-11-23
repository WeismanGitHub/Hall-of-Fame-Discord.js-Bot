const request = require('supertest');
const app = require('../app');

describe('api tests', () => {
    describe('GET /redirect',  () => {
        it('returns 302 because it redirected', () => {
            return request(app)
            .get('/redirect')
            .expect(302)
        })
    });
})

