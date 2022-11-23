const request = require('supertest');
const app = require('../app');

describe('app tests', () => {
    describe('GET /redirect',  () => {
        it('returns 302 because it redirected', () => {
            return request(app)
            .get('/redirect')
            .expect(302)
        })
    });
    describe('API tests', () => {
        describe('GET /api/fake/route',  () => {
            it('return 404 because route is nonexistant', () => {
                return request(app)
                .get('/api/fake/route')
                .expect(404)
            })
        });
    })
})