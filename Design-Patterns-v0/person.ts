interface IPerson{
    eat(): void;
    sleep(): void;
    work(): void;
}

class Student implements IPerson {
    eat(): void {
        console.log("Student is eating");
    }
    sleep(): void {
        console.log("Student is sleeping");
    }
    work(): void {
        console.log("Student is studying");
    }
}
class Teacher implements IPerson {
    eat(): void {
        console.log("Teacher is eating");
    }
    sleep(): void {
        console.log("Teacher is sleeping");
    }
    work(): void {
        console.log("Teacher is teaching");
    }
}
abstract class Person{
    abstract createPerson(): IPerson;

    interact(): void {
        const person = this.createPerson();
        person.eat();
        person.sleep();
        person.work();
    }
}

class StudentPerson extends Person {
    createPerson(): IPerson {
        return new Student();
    }
}

class TeacherPerson extends Person {
    createPerson(): IPerson {
        return new Teacher();
    }
}

function client(person: Person): void {
    person.interact();
}

const studentPerson: Person = new StudentPerson();
client(studentPerson);

const teacherPerson: Person = new TeacherPerson();
client(teacherPerson);