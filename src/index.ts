import {
  Ambience,
  ArxMap,
  Color,
  DONT_QUADIFY,
  Entity,
  Rotation,
  SHADING_FLAT,
  SHADING_SMOOTH,
  Settings,
  Texture,
  Vector3,
} from 'arx-level-generator'
import { Interactivity } from 'arx-level-generator/scripting/properties'
import { createLight, createZone } from 'arx-level-generator/tools'
import { loadOBJ } from 'arx-level-generator/tools/mesh'
import { applyTransformations } from 'arx-level-generator/utils'
import { times } from 'arx-level-generator/utils/faux-ramda'
import { pickRandom, randomBetween } from 'arx-level-generator/utils/random'
import { MathUtils } from 'three'
import { ambiences } from '@/constants.js'
import { createNECorner, createNWCorner, createSECorner, createSWCorner } from '@/corners.js'
import { createGround } from '@/ground.js'
import { createMainMarker } from '@/mainMarker.js'
import { createMoon } from '@/moon.js'
import { createStoneBlocks } from '@/stoneBlock.js'
import { createEastWestWall, createNorthSouthWall } from '@/walls.js'

const settings = new Settings()

// ------------------------

const map = new ArxMap()
map.config.offset = new Vector3(2000, 0, 2000)
map.player.position.adjustToPlayerHeight()
map.player.orientation.y = MathUtils.degToRad(-90)
map.player.withScript()
map.hud.hide('all')
await map.i18n.addFromFile('i18n.json', settings)

// ------------------------

const rowSize = 5

const width = Math.ceil(ambiences.length / rowSize) * 300 + 400
const depth = rowSize * 300 + 200

const mainMarker = createMainMarker()

const blocks = createStoneBlocks(rowSize, depth, mainMarker)

const moon = createMoon({
  position: new Vector3(width + 500, -1000, -1000),
  size: 50,
})

const nwCorner = await createNWCorner()
const swCorner = await createSWCorner()
const neCorner = await createNECorner()
const seCorner = await createSECorner()

const lights = [
  moon.lights,
  nwCorner.lights,
  swCorner.lights,
  neCorner.lights,
  seCorner.lights,
  [
    new Vector3(width * (0.1 + 0.4 * 0), -300, -1000),
    new Vector3(width * (0.1 + 0.4 * 0), -300, 0),
    new Vector3(width * (0.1 + 0.4 * 0), -300, 1000),

    new Vector3(width * (0.1 + 0.4 * 1), -300, -1000),
    new Vector3(width * (0.1 + 0.4 * 1), -300, 0),
    new Vector3(width * (0.1 + 0.4 * 1), -300, 1000),

    new Vector3(width * (0.1 + 0.4 * 2), -300, -1000),
    new Vector3(width * (0.1 + 0.4 * 2), -300, 0),
    new Vector3(width * (0.1 + 0.4 * 2), -300, 1000),
  ].map((position) => {
    const xOffset = randomBetween(-100, 100)
    const yOffset = randomBetween(-50, 50)
    const zOffset = randomBetween(-100, 100)
    return createLight({
      position: position.clone().add(new Vector3(xOffset, yOffset, zOffset)),
      color: Color.white.darken(40),
      fallStart: 1,
      radius: 1000,
      intensity: 0.45,
    })
  }),
]

const randomGraveyardJunk = times(
  () => {
    const item = pickRandom([Entity.skull, Entity.boneBassin, Entity.bone]).withScript()
    item.position.add(new Vector3(randomBetween(-200, 2800), 5 + randomBetween(-5, 5), randomBetween(-800, 800)))
    item.orientation = new Rotation(
      MathUtils.degToRad(randomBetween(-45, 45)),
      MathUtils.degToRad(randomBetween(0, 360)),
      MathUtils.degToRad(randomBetween(-45, 45)),
    )

    if (item.entityName === 'bone_bassin') {
      item.position.y += 15
    }

    item.script?.properties.push(Interactivity.off)
    return item
  },
  Math.round(randomBetween(30, 80)),
)

const zones = [
  blocks.zones,
  createZone({
    position: new Vector3(width / 2 - 200, 20, 0),
    size: new Vector3(width, 10, depth),
    name: Ambience.none.name,
    ambience: Ambience.none,
    backgroundColor: Color.fromCSS('#444'),
    drawDistance: 10000,
  }),
]

const entities = [mainMarker, blocks.entities, randomGraveyardJunk]

const meshes = [blocks.meshes]

const smoothMeshes = [
  moon.meshes,
  createGround(width, depth),
  createEastWestWall(new Vector3(-160, 0, 850), 14),
  createEastWestWall(new Vector3(-160, 0, -850), 14),
  createNorthSouthWall(new Vector3(-200, 0, 850), 8),
  createNorthSouthWall(new Vector3(2900, 0, 850), 8),
  nwCorner.meshes,
  swCorner.meshes,
  neCorner.meshes,
  seCorner.meshes,
]

map.zones.push(...zones.flat())
map.entities.push(...entities.flat())
map.lights.push(...lights.flat())
meshes.flat().forEach((mesh) => {
  applyTransformations(mesh)
  mesh.translateX(map.config.offset.x)
  mesh.translateY(map.config.offset.y)
  mesh.translateZ(map.config.offset.z)
  applyTransformations(mesh)
  map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_FLAT })
})
smoothMeshes.flat().forEach((mesh) => {
  applyTransformations(mesh)
  mesh.translateX(map.config.offset.x)
  mesh.translateY(map.config.offset.y)
  mesh.translateZ(map.config.offset.z)
  applyTransformations(mesh)
  map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
})

// -----------------------------

const tree = await loadOBJ('models/tree/tree', {
  position: new Vector3(4770, -10, 1450),
  scale: new Vector3(0.8, 0.7, 0.8),
  orientation: new Rotation(0, MathUtils.degToRad(70), 0),
  fallbackTexture: Texture.l2TrollWoodPillar08,
})

const importedModels = [...tree]

importedModels.forEach((mesh) => {
  map.polygons.addThreeJsMesh(mesh, { tryToQuadify: DONT_QUADIFY, shading: SHADING_SMOOTH })
})

// ------------------------

map.finalize()
await map.saveToDisk(settings)

console.log('done')
