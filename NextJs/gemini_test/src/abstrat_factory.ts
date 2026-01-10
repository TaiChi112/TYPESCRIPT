// abstract product
interface Button { 
    // สามารถเพิ่ม attribute หรือ method ของ button ได้
    render():void
}
// สามารถ scale เพิ่ม component ต่างๆ ได้ เช่น class Card ส่วน attribute หรือ method นั้นขึ้นอยู่ว่าเราจะเพิ่มอะไรลงไปใน component นั้นๆ

// concrete product
// class MinimalButton implements Button {
//     // สามารถเพิ่ม attribute หรือ method ของ button ใน theme นี้ได้
//     render(): void {
//         console.log("Rendering Minimal Button")
//     }
// }

// abstract factory
interface WebThemeComponent{
    createButton(): Button 
    // เพิ่ม component ที่ให้เพื่อให้ทุก theme ของ web ที่เราเลือกมี component เหมือนกัน เช่น Card
}
// concrete factory
class WebMinimalThemeComponent implements WebThemeComponent{
    createButton(): MinimalButton {
        return new MinimalButton()
    }
    // implement component ตรงนี้ถ้าเพิ่มการบังคับให้มี component อื่นๆ ใน WebThemeComponent
}
// สามารถ scale เพิ่ม WebThemeComponent ได้อีกหลายๆ theme เช่น WebDarkThemeComponent, WebLightThemeComponent ที่ไม่ใช่เปลี่ยนเเค่ color theme เเต่เปลี่ยน style ของ component ของเเต่ละ theme ด้วย

// client
class WebApp{
    constructor(private themeComponent: WebThemeComponent){}
    renderWebThemeComponet(){
        const button = this.themeComponent.createButton()
        button.render();
    }
}

// usage
const minimalThemeComponent = new WebMinimalThemeComponent()
const webApp = new WebApp(minimalThemeComponent)
webApp.renderWebThemeComponet()