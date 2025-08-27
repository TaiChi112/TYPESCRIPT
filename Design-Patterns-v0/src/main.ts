interface ITransport{
    deliver(): void;
}
class Truck implements ITransport {
    deliver(): void {
        console.log("Delivering by truck");
    }
}
class Ship implements ITransport {
    deliver(): void {
        console.log("Delivering by ship");
    }
}
abstract class Transport{
    abstract createTransport(): ITransport
    deliver(): void {
        const transport = this.createTransport();
        transport.deliver();
    }
}
class TruckTransport extends Transport {
    createTransport(): ITransport {
        return new Truck();
    }
}
class ShipTransport extends Transport {
    createTransport(): ITransport {
        return new Ship();
    }
}

function client(transport: Transport): void {
    transport.deliver();
}

const truckTransport: Transport = new TruckTransport();
client(truckTransport);

const shipTransport: Transport = new ShipTransport();
client(shipTransport);

// ========

interface Pizza {
    prepare(): void;
    bake(): void;
    cut(): void;
    box(): void;
}
class BaconPizza implements Pizza {
    prepare(): void {
        console.log("Preparing Bacon Pizza");
    }
    bake(): void {
        console.log("Baking Bacon Pizza");
    }
    cut(): void {
        console.log("Cutting Bacon Pizza");
    }
    box(): void {
        console.log("Boxing Bacon Pizza");
    }
}
class TunaPizza implements Pizza {
    prepare(): void {
        console.log("Preparing Tuna Pizza");
    }
    bake(): void {
        console.log("Baking Tuna Pizza");
    }
    cut(): void {
        console.log("Cutting Tuna Pizza");
    }
    box(): void {
        console.log("Boxing Tuna Pizza");
    }
}
class GrilledPortNeckPizza implements Pizza {
    prepare(): void {
        console.log("Preparing Grilled Port Neck Pizza");
    }
    bake(): void {
        console.log("Baking Grilled Port Neck Pizza");
    }
    cut(): void {
        console.log("Cutting Grilled Port Neck Pizza");
    }
    box(): void {
        console.log("Boxing Grilled Port Neck Pizza");
    }
}

abstract class PizzaFactory {
    abstract createPizza(): Pizza;

    cook(): void {
        const pizza = this.createPizza();
        pizza.prepare();
        pizza.bake();
        pizza.cut();
        pizza.box();
    }
}

class Bacon extends PizzaFactory {
    createPizza(): Pizza {
        return new BaconPizza();
    }
}

class Tuna extends PizzaFactory {
    createPizza(): Pizza {
        return new TunaPizza();
    }
}

class GrilledPortNeck extends PizzaFactory {
    createPizza(): Pizza {
        return new GrilledPortNeckPizza();
    }
}
const baconFactory: PizzaFactory = new Bacon();
baconFactory.cook();

const tunaFactory: PizzaFactory = new Tuna();
tunaFactory.cook();

const grilledPortNeckFactory: PizzaFactory = new GrilledPortNeck();
grilledPortNeckFactory.cook();
 
