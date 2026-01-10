/**
 * 1) PRODUCT INTERFACE
 * นิยามผลลัพธ์ที่ Factory จะต้องส่งออกมา 
 * ในที่นี้คือวัตถุที่สามารถ 'format' ข้อมูลบทความได้
 */
interface Article {
    id: string;
    title: string;
    category: string;
}

interface ILayoutFormatter {
    render(articles: Article[]): string;
}

/**
 * 2) CONCRETE PRODUCTS
 * การ implement จริงในแต่ละรูปแบบ
 */

// รูปแบบ List: เน้นแสดงผลเป็นบรรทัดเรียงลงมา
class ListFormatter implements ILayoutFormatter {
    render(articles: Article[]): string {
        return articles
            .map(a => `[LIST] • ${a.title.toUpperCase()} (${a.category})`)
            .join("\n");
    }
}

// รูปแบบ Grid: เน้นแสดงผลแบบแบ่งคอลัมน์ (จำลองด้วย Pipe |)
// class GridFormatter implements ILayoutFormatter {
//     render(articles: Article[]): string {
//         return articles
//             .map(a => `| GRID BOX: ${a.title} |`)
//             .join("  ");
//     }
// }

/**
 * 3) CREATOR ABSTRACTION
 * คลาสแม่ที่ประกาศ Factory Method (createFormatter)
 */
abstract class LayoutFactory {
    // นี่คือ Factory Method
    public abstract createFormatter(): ILayoutFormatter;

    // Business Logic ที่ใช้ Product ที่สร้างขึ้น
    public generateReport(articles: Article[]): void {
        const formatter = this.createFormatter();
        console.log("--- Generating Layout Report ---");
        console.log(formatter.render(articles));
        console.log("--------------------------------\n");
    }
}

/**
 * 4) CONCRETE CREATORS
 * ผู้ที่ตัดสินใจว่าจะสร้าง Formatter ตัวไหน
 */
class ListLayoutFactory extends LayoutFactory {
    public createFormatter(): ILayoutFormatter {
        return new ListFormatter();
    }
}

// class GridLayoutFactory extends LayoutFactory {
//     public createFormatter(): ILayoutFormatter {
//         return new GridFormatter();
//     }
// }

/**
 * ---------------------------------------------------------
 * 🚀 HOW TO SCALE (การขยายระบบ)
 * ---------------------------------------------------------
 * หากต้องการเพิ่ม "Compact Layout" หรือ "Table Layout" ในอนาคต:
 * * 1. เพิ่ม Class ใหม่ที่ implement ILayoutFormatter (Concrete Product)
 * class TableFormatter implements ILayoutFormatter { ... }
 * * 2. เพิ่ม Class Factory ใหม่ที่สืบทอด LayoutFactory (Concrete Creator)
 * class TableLayoutFactory extends LayoutFactory { ... }
 * * ผลลัพธ์: โค้ดเดิมไม่ถูกแก้ไข (Open-Closed Principle) ปลอดภัยต่อระบบเดิม 100%
 */

/**
 * 5) DEMO EXECUTION
 */
const myArticles: Article[] = [
    { id: "1", title: "Factory Method", category: "Patterns" },
    { id: "2", title: "TypeScript Tips", category: "TS" },
    { id: "3", title: "Design Principles", category: "Architecture" },
    { id: "4", title: "Clean Code", category: "Best Practices" },
    { id: "5", title: "Refactoring", category: "Techniques" },
];

// ลองใช้งาน List Layout
const listFactory = new ListLayoutFactory();
listFactory.generateReport(myArticles);

// ลองใช้งาน Grid Layout
// const gridFactory = new GridLayoutFactory();
// gridFactory.generateReport(myArticles);