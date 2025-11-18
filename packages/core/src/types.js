export class InMemoryBufferStore {
    constructor() {
        this.buffer = [];
    }
    async load() {
        return [...this.buffer];
    }
    async save(entries) {
        this.buffer = [...entries];
    }
    async clear() {
        this.buffer = [];
    }
}
//# sourceMappingURL=types.js.map