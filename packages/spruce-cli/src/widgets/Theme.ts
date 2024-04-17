import random from 'lodash/random'
const mint = '#24FE91'
const yellow = '#fdfd2d'
const orange = '#ff8100'
const blue = '#63caf3'

const colors = [mint, yellow, orange, blue]

const Theme = {
    primaryColor: colors[random(0, colors.length - 1)],
    backgroundColor: '#000000',
}

export default Theme
