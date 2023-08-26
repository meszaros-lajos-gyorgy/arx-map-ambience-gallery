declare global {
  namespace NodeJS {
    interface ProcessEnv {
      outputDir?: string
      levelIdx?: string
      seed?: string
      variant?: string
      calculateLighting?: string
      mode?: string
      originalLevelFiles?: string
    }
  }
}

export {}
