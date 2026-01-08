interface Blog{
    id: number;
    title: string;
    content: string;
}

interface ILayout{
    render(blogs: Blog[]): void;
}
class ListLayout implements ILayout{
    render(blogs: Blog[]): void {
        for(const blog of blogs){
            console.log('-----------------------');
            console.log(`ID: ${blog.id} Title: ${blog.title}\nContent: ${blog.content}`);
        }
    }
}
// class GridLayout implements ILayout{
//     render(blogs: Blog[]): void {
//         let grid = '';
//         for(const blog of blogs){
//             grid += `[ ${blog.title} ] `;
//         }
//         console.log(grid);
//     }
// }

abstract class Layout{
    abstract createLayout(): ILayout;
    renderLayout(blogs: Blog[]): void {
        const layout = this.createLayout();
        layout.render(blogs);
    }
}
class CreateListLayout extends Layout{
    createLayout(): ILayout {
        return new ListLayout();
    }
}
// class CreateGridLayout extends Layout{
//     createLayout(): ILayout {
//         return new GridLayout();
//     }
// }

const client = (layout: Layout, blogs: Blog[]) => {
    layout.renderLayout(blogs);
}

const Blogs: Blog[] = [
    { id: 1, title: "Factory Method", content: "Factory Method Description" },
    { id: 2, title: "Abstract Factory", content: "Abstract Factory Description" },
    { id: 3, title: "Builder", content: "Builder Description" },
    { id: 4, title: "Prototype", content: "Prototype Description" },
    { id: 5, title: "Singleton", content: "Singleton Description" }
]
const CreateListLayout1: Layout = new CreateListLayout();
client(CreateListLayout1, Blogs);


// const CreateGridLayout1: Layout = new CreateGridLayout();
// client(CreateGridLayout1, Blogs);

// กำหนด ข้อมูล blog เพื่อที่จะทดสอบการสร้าง layout 
// ว่าเเต่ละ layout จะ render ข้อมูล blog ตาม layout นั้นอย่างไร ซึ่งขึ้นอยู่กับการ implement ใน concreate class อย่าง ListLayout เเละ GridLayout
// create  object || instance โดยกำหนด data type เป็น Layout เเล้วใช้หลัก polymorphism เพื่อไปเรียก concreate class ที่ต้องการ โดยจะรู้ได้ตอน runtime ว่าเรา new อะไรมาใช้งาน 