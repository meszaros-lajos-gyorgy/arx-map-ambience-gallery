import { Texture, Vector3 } from 'arx-level-generator'
import { createPlaneMesh } from 'arx-level-generator/prefabs/mesh'
import { makeBumpy, scaleUV, transformEdge } from 'arx-level-generator/tools/mesh'
import { Vector2 } from 'three'

export const createGround = (width: number, depth: number) => {
  const floorMesh = createPlaneMesh({
    size: new Vector2(width + 200, depth + 200),
    tileSize: 30,
    texture: Texture.l5CavesGravelGround05,
  })
  floorMesh.translateX(width / 2 - 200)

  transformEdge(new Vector3(0, -5, 0), floorMesh)
  makeBumpy(12, 50, true, floorMesh.geometry)

  scaleUV(new Vector2(0.25, 0.25), floorMesh.geometry)

  return floorMesh
}
