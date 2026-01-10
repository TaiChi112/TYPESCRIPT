
interface ActivityStructure {
    timestamp: Date;
    action: string;
    details: string;
}

class UserActivityLog {
    private static instance: UserActivityLog;
    private activityLog: ActivityStructure[] = [];
    private constructor() { }

    public static getInstance(): UserActivityLog {
        if (!UserActivityLog.instance) {
            UserActivityLog.instance = new UserActivityLog();
        }
        return UserActivityLog.instance;
    }
    log(activity: ActivityStructure): void {
        this.activityLog.push(activity);
        console.log(`Activity Logged: ${activity.action} at ${activity.timestamp.toISOString()}`);
    }
    getLogs(): ActivityStructure[] {
        return this.activityLog;
    }
}

const activityLogger1 = UserActivityLog.getInstance();
activityLogger1.log({
    timestamp: new Date(),
    action: "User Login",
    details: "User JohnDoe logged in."
});

interface IContentPrototype {
    clone(): IContentPrototype;
    setContentDetails(data: ActivityStructure): void;
    getContentDetails(): string;
}

class Blog implements IContentPrototype {
    private title: string;
    private body: string;
    private author: string;

    public clone(): Blog {
        const blogClone = new Blog();
        blogClone.title = this.title;
        blogClone.body = this.body;
        blogClone.author = this.author;
        return blogClone;
    }
    public setContentDetails(data: { title: string, body: string, author: string }): void {
        if (data.title) this.title = data.title;
        if (data.body) this.body = data.body;
        if (data.author) this.author = data.author;
    }
    public getContentDetails(): string {
        return `Blog Title: ${this.title}, Body: ${this.body}, Author: ${this.author}`;
    }
}

class WebPage {
    public content: IContentPrototype | null = null;
    public render(): string {
        if (!this.content) {
            return "[Error]: No content to render.";
        }
        const contentDetails = this.content.getContentDetails();
        return contentDetails;
    }
}

interface IPageBuilder {
    reset(): IPageBuilder;
    buildContent(content: IContentPrototype): IPageBuilder;
    getResult(): WebPage;
}

class BlogPageBuilder implements IPageBuilder {
    private page: WebPage = new WebPage();

    public reset(): IPageBuilder {
        this.page = new WebPage();
        return this.page;
    }
    public getResult(): WebPage {
        return this.page;
    }
}

class ClientDirector {
    private builder: IPageBuilder;
    private logger: UserActivityLog;

    constructor(builder: IPageBuilder) {
        this.builder = builder;
        this.logger = UserActivityLog.getInstance();
    }
    public constructorBlogPage(
        title: string,
        body: string,
        author: string
    ): WebPage {
        this.logger.log({
            timestamp: new Date(),
            action: " Page Construction Started",
            details: `Constructing page for blog ${title}`
        });
        const prototype = new Blog();
        prototype.setContentDetails({ title, body, author });
        const content = prototype.clone();

        const page = this.builder
            .reset()
            .buildContent(content)
            .getResult();
        
        this.logger.log({
            timestamp: new Date(),
            action: " Page Construction Completed",
            details: `Page ready for blog ${title}`
        });
        return page;
    }
}

const builder = new BlogPageBuilder();
const director = new ClientDirector(builder);

const blogPage = director.constructorBlogPage(
    "Design Patterns in TypeScript",
    "This blog discusses various design patterns implemented in TypeScript.",
    "Jane Smith"
);

console.log(blogPage.render());