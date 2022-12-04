const { Interaction } = require('discord.js')
const client = require('../index')


describe('/help', () => {
    it('runs', () => {
        client.emit(Interaction)
    })
})

