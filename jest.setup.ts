import '@testing-library/jest-dom'

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock

// Mock FormData since it's not available in jsdom
class MockFormData {
  private data: Record<string, string> = {}

  append(key: string, value: string) {
    this.data[key] = value
  }

  get(key: string) {
    return this.data[key]
  }
}

global.FormData = MockFormData as any

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
