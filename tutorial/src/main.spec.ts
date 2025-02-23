import {add} from "./main";

describe('add function', () => {
  it('should return the sum of two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('should handle negative numbers', () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it('should handle zero', () => {
    expect(add(0, 0)).toBe(0);
  });
});
// import LLFEComponent from './main';

// describe('LLFEComponent', () => {
//   let component: LLFEComponent;

//   beforeEach(() => {
//     component = new LLFEComponent();
//   });

//   it('should call onInit when initialized', () => {
//     const onInitSpy = jest.spyOn(component, 'onInit');
//     component.onInit();
//     expect(onInitSpy).toHaveBeenCalled();
//   });

//   it('should call onDestroy when destroyed', () => {
//     const onDestroySpy = jest.spyOn(component, 'onDestroy');
//     component.onDestroy();
//     expect(onDestroySpy).toHaveBeenCalled();
//   });
// });
