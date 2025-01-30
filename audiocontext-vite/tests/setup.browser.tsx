/// <reference types="vitest/importMeta" />
/// <reference types="@vitest/browser/providers/playwright" />

import "../app/style.css"
import { renderHook } from "@testing-library/react"
import { vi, beforeEach, afterEach } from "vitest"

// We extend the global test context with our custom functions that we pass into the context in beforeEach
declare module "vitest" {
  interface TestContext {
    renderHook: typeof renderHook
  }
}
// We pass in our custom functions to the test context
beforeEach((ctx) => {
  ctx.renderHook = renderHook
})

// We clear all mocks after each test (optional, feel free to remove it)
afterEach(() => {
  vi.clearAllMocks()
})
