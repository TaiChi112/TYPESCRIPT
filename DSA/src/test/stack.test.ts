import Stack from "../class/Stack";

describe("Stack", () => {
    it("should create an empty stack", () => {
        const stack = new Stack();
        expect(stack.isEmpty()).toBe(true);
        expect(stack.size()).toBe(0);
    });
})