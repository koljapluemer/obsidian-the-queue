import { TFile } from 'obsidian';
import { vi } from 'vitest'


export const mockTFile = {
    path: "mock-folder/mock-file.md",
    name: "mock-file.md",
    basename: "mock-file",
    extension: "md",
    stat: {
        ctime: 1672531200000, // Mock creation time (e.g., 2023-01-01T00:00:00.000Z)
        mtime: 1672534800000, // Mock modification time
        size: 1234, // Mock file size in bytes
    },
    vault: {
        adapter: {
            write: vi.fn(() => Promise.resolve()),
            read: vi.fn(() => Promise.resolve("mock file content")),
            delete: vi.fn(() => Promise.resolve()),
            rename: vi.fn(() => Promise.resolve()),
        },
        getName: vi.fn(() => "MockVault"),
    },
    unsafeCachedData: null,
} as unknown as TFile;
