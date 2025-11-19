import type { HttpHandler } from 'msw'
import { problemHandlers } from '@/mocks/handlers/problems'
import { problemListHandlers } from '@/mocks/handlers/problem-lists'
import { contestHandlers } from '@/mocks/handlers/contest'
import { forumHandlers } from '@/mocks/handlers/forum'

export const handlers: HttpHandler[] = [
  ...problemHandlers,
  ...problemListHandlers,
  ...contestHandlers,
  ...forumHandlers,
]
