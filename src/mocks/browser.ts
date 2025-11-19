import { setupWorker } from 'msw/browser'
import { handlers } from '@/mocks/handlers'

export const worker = setupWorker(...handlers)

export async function startMockWorker() {
  await worker.start({
    onUnhandledRequest: 'bypass',
  })
  worker.events?.setMaxListeners?.(0)
}
