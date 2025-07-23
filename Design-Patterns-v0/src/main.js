var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Car = /** @class */ (function () {
    function Car() {
    }
    Car.prototype.send = function (message) {
        console.log("Sending message from Car: ".concat(message));
    };
    return Car;
}());
var Boat = /** @class */ (function () {
    function Boat() {
    }
    Boat.prototype.send = function (message) {
        console.log("Sending message from Boat: ".concat(message));
    };
    return Boat;
}());
var TransportFactory = /** @class */ (function () {
    function TransportFactory() {
    }
    TransportFactory.prototype.sendMessage = function (message) {
        var transport = this.createTransport();
        transport.send(message);
    };
    return TransportFactory;
}());
var CarFactory = /** @class */ (function (_super) {
    __extends(CarFactory, _super);
    function CarFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CarFactory.prototype.createTransport = function () {
        return new Car();
    };
    return CarFactory;
}(TransportFactory));
var BoatFactory = /** @class */ (function (_super) {
    __extends(BoatFactory, _super);
    function BoatFactory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BoatFactory.prototype.createTransport = function () {
        return new Boat();
    };
    return BoatFactory;
}(TransportFactory));
var carFactory = new CarFactory();
carFactory.sendMessage("Hello from Car Factory!");
var boatFactory = new BoatFactory();
boatFactory.sendMessage("Hello from Boat Factory!");
var BaconPizza = /** @class */ (function () {
    function BaconPizza() {
    }
    BaconPizza.prototype.prepare = function () {
        console.log("Preparing Bacon Pizza");
    };
    BaconPizza.prototype.bake = function () {
        console.log("Baking Bacon Pizza");
    };
    BaconPizza.prototype.cut = function () {
        console.log("Cutting Bacon Pizza");
    };
    BaconPizza.prototype.box = function () {
        console.log("Boxing Bacon Pizza");
    };
    return BaconPizza;
}());
var TunaPizza = /** @class */ (function () {
    function TunaPizza() {
    }
    TunaPizza.prototype.prepare = function () {
        console.log("Preparing Tuna Pizza");
    };
    TunaPizza.prototype.bake = function () {
        console.log("Baking Tuna Pizza");
    };
    TunaPizza.prototype.cut = function () {
        console.log("Cutting Tuna Pizza");
    };
    TunaPizza.prototype.box = function () {
        console.log("Boxing Tuna Pizza");
    };
    return TunaPizza;
}());
var GrilledPortNeckPizza = /** @class */ (function () {
    function GrilledPortNeckPizza() {
    }
    GrilledPortNeckPizza.prototype.prepare = function () {
        console.log("Preparing Grilled Port Neck Pizza");
    };
    GrilledPortNeckPizza.prototype.bake = function () {
        console.log("Baking Grilled Port Neck Pizza");
    };
    GrilledPortNeckPizza.prototype.cut = function () {
        console.log("Cutting Grilled Port Neck Pizza");
    };
    GrilledPortNeckPizza.prototype.box = function () {
        console.log("Boxing Grilled Port Neck Pizza");
    };
    return GrilledPortNeckPizza;
}());
var PizzaFactory = /** @class */ (function () {
    function PizzaFactory() {
    }
    PizzaFactory.prototype.cook = function () {
        var pizza = this.createPizza();
        pizza.prepare();
        pizza.bake();
        pizza.cut();
        pizza.box();
    };
    return PizzaFactory;
}());
var Bacon = /** @class */ (function (_super) {
    __extends(Bacon, _super);
    function Bacon() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Bacon.prototype.createPizza = function () {
        return new BaconPizza();
    };
    return Bacon;
}(PizzaFactory));
var Tuna = /** @class */ (function (_super) {
    __extends(Tuna, _super);
    function Tuna() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Tuna.prototype.createPizza = function () {
        return new TunaPizza();
    };
    return Tuna;
}(PizzaFactory));
var GrilledPortNeck = /** @class */ (function (_super) {
    __extends(GrilledPortNeck, _super);
    function GrilledPortNeck() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GrilledPortNeck.prototype.createPizza = function () {
        return new GrilledPortNeckPizza();
    };
    return GrilledPortNeck;
}(PizzaFactory));
var baconFactory = new Bacon();
baconFactory.cook();
var tunaFactory = new Tuna();
tunaFactory.cook();
var grilledPortNeckFactory = new GrilledPortNeck();
grilledPortNeckFactory.cook();
// const factories: PizzaFactory[] = [
//     new Bacon(),
//     new Tuna(),
//     new GrilledPortNeck()
// ];
// factories.forEach(factory => factory.cook());
// console.log("All pizzas cooked successfully!");
