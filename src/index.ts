import path from 'node:path'
import { ArxMap, Settings, Vector3 } from 'arx-level-generator'
import seedrandom from 'seedrandom'
import { MathUtils } from 'three'

// const seed = Math.floor(Math.random() * 1e20).toString()
const seed = '123'

seedrandom(seed, { global: true })
console.log(`seed: ${seed}`)

const settings = new Settings({
  outputDir: path.resolve('./output'),
  levelIdx: 1,
})

// ------------------------

const map = new ArxMap()
map.meta.mapName = 'Ambience Gallery'
map.config.offset = new Vector3(2000, 0, 2000)
map.player.position.adjustToPlayerHeight()
map.player.orientation.y = MathUtils.degToRad(-90)
map.player.withScript()
map.hud.hide('all')
await map.i18n.addFromFile('i18n.json')

map.finalize()

map.saveToDisk(settings)
