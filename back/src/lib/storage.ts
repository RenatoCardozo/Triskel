import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { pipeline } from 'node:stream/promises'
import { env } from '../env'

/** Interface de armazenamento: trocar por S3 = implementar esta interface e escolher em `storage`. */
export interface Storage {
  put(key: string, data: Buffer): Promise<void>
  /** Grava um stream sem carregar tudo na memória; devolve os bytes gravados. */
  putStream(key: string, data: NodeJS.ReadableStream): Promise<number>
  head(key: string, n: number): Promise<Buffer>
  get(key: string): Promise<Buffer>
  stream(key: string): fs.ReadStream
  path?(key: string): string
  remove(key: string): Promise<void>
}
export class LocalStorage implements Storage {
  constructor(private dir: string) { fs.mkdirSync(dir, { recursive: true }) }
  private p(key: string) {
    if (!/^[a-f0-9]{32,64}(\.[a-z0-9]{2,5})?$/.test(key)) throw new Error('chave de armazenamento inválida')
    return path.join(this.dir, key)
  }
  async put(key: string, data: Buffer) { await fs.promises.writeFile(this.p(key), data, { mode: 0o640 }) }
  async putStream(key: string, data: NodeJS.ReadableStream) {
    const p = this.p(key)
    let n = 0
    data.on('data', (c: Buffer) => { n += c.length })
    try { await pipeline(data, fs.createWriteStream(p, { mode: 0o640 })) } catch (e) { await fs.promises.rm(p, { force: true }); throw e }
    return n
  }
  async head(key: string, n: number) {
    const fh = await fs.promises.open(this.p(key), 'r')
    try { const b = Buffer.alloc(n); const { bytesRead } = await fh.read(b, 0, n, 0); return b.subarray(0, bytesRead) } finally { await fh.close() }
  }
  async get(key: string) { return fs.promises.readFile(this.p(key)) }
  stream(key: string) { return fs.createReadStream(this.p(key)) }
  path(key: string) { return this.p(key) }
  async remove(key: string) { await fs.promises.rm(this.p(key), { force: true }) }
}
/** Nome do arquivo no disco é aleatório; o nome original nunca vira caminho. */
export const newStorageKey = (ext = '') => crypto.randomBytes(24).toString('hex') + ext
export const storage: Storage = new LocalStorage(path.resolve(env.STORAGE_DIR))
