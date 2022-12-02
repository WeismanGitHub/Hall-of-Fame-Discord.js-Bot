const request = require('supertest');
const app = require('../app');

describe('Tests', () => {
    describe('API tests', () => {
        describe('GET /api/fake/route',  () => {
            it('return 404 because route is nonexistant', () => {
                return request(app)
                .get('/api/fake/route')
                .expect(404)
            })
        });

        describe('GET /api/guilds', () => {
            it('return 200 because valid request', () => {
                return request(app)
                .get('/api/guilds')
                .expect(200)
                .then(res => {
                    res._body.forEach(guild => {
                        expect(guild).toHaveProperty('icon')
                        expect(guild).toHaveProperty('name')
                    })
                })
            })
        });
    })
})