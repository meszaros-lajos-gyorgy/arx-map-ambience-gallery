declare global {
  namespace NodeJS {
    interface ProcessEnv {
      outputDir?: string
      levelIdx?: string
    }
  }
}

export {}
