const request = require('supertest');
const app = require('../app');
require('dotenv').config();

describe('Tests', () => {
    const testAccessToken = process.env.TEST_ACCESS_TOKEN

    describe('API tests', () => {
        describe('GET /api/v1/fake/route',  () => {
            it('return 404 because route is nonexistant', () => {
                return request(app)
                .get('/api/fake/route')
                .expect(404)
            })
        });

        describe('GET /api/guilds', () => {
            it('return 200 because valid request', () => {
                return request(app)
                .get('/api/v1/guilds')
                .set('Cookie', [`accessToken=${testAccessToken}`])
                .expect(200)
                .then(res => {
                    res._body.forEach(guild => {
                        expect(guild).toHaveProperty('iconURL')
                        expect(guild).toHaveProperty('name')
                        expect(guild).toHaveProperty('id')
                    })
                })
            })
        });
    })
})