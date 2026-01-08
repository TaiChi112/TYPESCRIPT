interface IButton{
    render(): void;
}
interface ICard{
    render(): void;
}
// สามารถ scale component ได้ง่าย เช่น ICard, INav, IFooter หมายเหตุ: component คือส่วนประกอบต่างๆ ที่อยู่ใน web page
// component^
class MinimalButton implements IButton{
    render(): void {
        console.log('Now You web style is Rendering Minimal Button');
    }
}
class MinimalCard implements ICard{
    render(): void {
        console.log('Now You web style is Rendering Minimal Card');
    }
}

class ModernButton implements IButton{
    render(): void {
        console.log('Now You web style is Rendering Modern Button');
    }
}
class ModernCard implements ICard{
    render(): void {
        console.log('Now You web style is Rendering Modern Card');
    }
}
// ทำการ implement component style เพิ่มได้ เช่น [CardMinimal,CardModern], [NavMinimal,NavModern], [FooterMinimal,FooterModern]
// ตาม component interface ที่ผมตั้งใจ scale ไว้ข้างต้น

interface WebStyle{
    createButton(): IButton;
    createCard(): ICard;
    //อยากสร้าง component อะไรเพิ่มก็กำหนด method สำหรับการสร้าง component นั้น เช่น createCard(), createNav(), createFooter()
    // จะเห็นไม่ต้องบอกว่าต้องเป็น component style ไหน เพราะแต่ละ class ที่ implement interface นี้จะบอกเอง
}

// จะเห็นว่าไม่ว่าเราจะสร้าง web style ได้ component เเต่ละ style ก็จะต้องตามไปด้วยตามที่เรากำหนดใน interface WebStyle
// เช่น ถ้าเราสร้าง WebMinimalStyle class เราก็ต้องสร้าง component style ที่เป็น Minimal ด้วย เช่น MinimalButton, MinimalCard
// ถ้าเราสร้าง WebModernStyle class เราก็ต้องสร้าง component style ที่เป็น Modern ด้วย เช่น ModernButton, ModernCard
class WebMinimalStyle implements WebStyle{
    createButton(): IButton {
        return new MinimalButton();
    }
    createCard(): ICard {
        return new MinimalCard();
    }
}
class WebModernStyle implements WebStyle{
    createButton(): IButton {
        return new ModernButton();
    }
    createCard(): ICard {
        return new ModernCard();
    }
}
// ทำการสร้าง class style อื่นๆ เช่น WebModernStyle, WebClassicStyle, WebFutureStyle

// Client code
const renderComponent = (theme: WebStyle) => {
    const ButtonComponent = theme.createButton();
    const CardComponent = theme.createCard();
    ButtonComponent.render();
    CardComponent.render();
}


// Usage
const minimalTheme: WebStyle = new WebMinimalStyle();
renderComponent(minimalTheme);
const modernTheme: WebStyle = new WebModernStyle();
renderComponent(modernTheme);

// ยกตัวอย่างที่ตั้งใจเอาไป apply คือ ผมมี personal website ที่มี content คือ article, blog, docs, project, cv, resume
// สมมติ user เข้ามาอ่าน blog ของผม เขาอาจจะอยากเปลี่ยน web theme style ตามความรู้สึกของ user ที่อ่านก็ได้ ตามที่ผมเตรียมไว้ให้ เช่น Minimal style กับ Modern style หรือใน อนาคตที่ต้องการ scale เป็น style future เเต่ยังไม่รู้หน้าตาเป็นไง ต้องไปศึกษา future style ก่อน
// ที่เปลี่ยน theme style คือ ผมจะมี button toggle theme style ให้ user กดเปลี่ยน theme style เองได้ 
