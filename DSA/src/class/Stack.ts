class Stack<T> {
    private items: T[] = [];

    push(items: T): void {
        this.items.push(items)
    }
    pop(): T | undefined {
        return this.items.pop()
    }
    peek(): T | undefined {
        return this.items[this.items.length - 1]
    }
    isEmpty(): boolean {
        return this.items.length === 0
    }
    size(): number {
        return this.items.length
    }
    clear(): void {
        this.items = []
    }
}
export default Stack