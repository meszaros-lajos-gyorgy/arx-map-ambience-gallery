import { Entity, Texture, Vector3, Zone } from 'arx-level-generator'
import { ControlZone } from 'arx-level-generator/scripting/properties'
import { createZone } from 'arx-level-generator/tools'
import { scaleUV, toArxCoordinateSystem, translateUV } from 'arx-level-generator/tools/mesh'
import { randomBetween } from 'arx-level-generator/utils/random'
import { ExtrudeGeometry, MathUtils, Mesh, MeshBasicMaterial, Shape, Vector2 } from 'three'
import { ambiences } from '@/constants.js'

// TODO: turn this into 3 functions that create the zones, the entities and the markers
export const createStoneBlocks = (rowSize: number, depth: number, achievementManager: Entity) => {
  const size = new Vector3(80, 100, 80)

  const extrudeSettings = {
    steps: size.y / 100,
    depth: size.y,
    bevelEnabled: true,
    bevelThickness: 10,
    bevelSize: 10,
    bevelOffset: 0,
    bevelSegments: 1,
  }

  const shape = new Shape()
  shape.lineTo(size.x - extrudeSettings.bevelSize * 2, 0)
  shape.lineTo(size.x - extrudeSettings.bevelSize * 2, size.z - extrudeSettings.bevelSize * 2)
  shape.lineTo(0, size.z - extrudeSettings.bevelSize * 2)

  let stoneBlockGeometry = new ExtrudeGeometry(shape, extrudeSettings)
  stoneBlockGeometry = toArxCoordinateSystem(stoneBlockGeometry)
  scaleUV(
    new Vector2(1 / (size.x + extrudeSettings.bevelSize * 2), 1 / (size.z + extrudeSettings.bevelSize * 2)),
    stoneBlockGeometry,
  )
  translateUV(new Vector2(0.1, 0), stoneBlockGeometry)

  const material = new MeshBasicMaterial({
    map: Texture.l4YlsideStoneGround01,
  })

  const zones: Zone[] = []
  const entities: Entity[] = []
  const meshes: Mesh[] = []

  for (let i = 0; i < ambiences.length; i += rowSize) {
    const slice = ambiences.slice(i, i + rowSize)
    for (let j = 0; j < slice.length; j++) {
      const pos = new Vector3((i / rowSize) * 300 + 100, 40, j * 300 - depth / 2 + 200)
      const heightOffset = randomBetween(-5, 15)

      const ambience = ambiences[i + j]
      const zone = createZone({
        position: pos.clone().add(new Vector3(size.x / 2, heightOffset, extrudeSettings.bevelSize * 2 + size.z / 2)),
        size,
        name: ambience.name,
        ambience,
      })
      zones.push(zone)

      const marker = Entity.marker.withScript()
      marker.position = pos.clone().add(new Vector3(50, -30, 50))
      marker.script?.properties.push(new ControlZone(zone))
      marker.script?.on('controlledzone_enter', () => {
        return `
        herosay "${zone.name}"
        if (§already_listened == 0) {
          set §already_listened 1
          sendevent listened ${achievementManager.ref} nop
        }
        `
      })
      marker.script?.on('init', () => {
        return 'set §already_listened 0'
      })
      entities.push(marker)

      const stoneBlock = new Mesh(stoneBlockGeometry.clone(), material)
      stoneBlock.translateX(pos.x - extrudeSettings.bevelSize + 20)
      stoneBlock.translateY(pos.y - extrudeSettings.depth + heightOffset)
      stoneBlock.translateZ(pos.z - extrudeSettings.bevelSize + 50)
      stoneBlock.rotateX(MathUtils.degToRad(-90 + randomBetween(-5, 5)))
      stoneBlock.rotateY(MathUtils.degToRad(randomBetween(-5, 5)))
      meshes.push(stoneBlock)
    }
  }

  return {
    zones,
    entities,
    meshes,
  }
}
