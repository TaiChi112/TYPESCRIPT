// generateMermaidClass.ts

import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';

class MermaidClassGenerator {
    private readonly rl: readline.Interface;
    private sourceFile?: string;
    private diagramIndex?: number;

    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    /**
     * Prompts the user for a single line of input.
     * @param prompt The message to display.
     * @returns The user's input as a string.
     */
    private promptUser(prompt: string): Promise<string> {
        return new Promise((resolve) => {
            this.rl.question(prompt, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    /**
     * Receives multiline input from the user.
     * Input ends when an empty line is entered.
     * @param promptMessage The message to display before input.
     * @param hintMessage A hint for the user on how to end input.
     * @returns An array of strings, each representing a line of input.
     */
    private async getMultilineInput(promptMessage: string, hintMessage: string): Promise<string[]> {
        console.log(`\n${promptMessage}`);
        console.log(hintMessage);

        const lines: string[] = [];
        
        while (true) {
            const input = await this.promptUser('');
            if (input === '') {
                break;
            }
            lines.push(input);
        }
        
        return lines;
    }

    /**
     * Validates and prompts for required class name input.
     * @returns The validated class name.
     */
    private async getClassName(): Promise<string> {
        let className = "";
        while (!className) {
            className = await this.promptUser("Enter Class Name (e.g., User): ");
            if (!className) {
                console.log("Class Name cannot be empty. Please try again.");
            }
        }
        return className;
    }

    /**
     * Displays a menu and gets user choice.
     * @param options Array of menu options
     * @param title Menu title
     * @returns Selected option index
     */
    private async showMenu(options: string[], title: string): Promise<number> {
        console.log(`\n--- ${title} ---`);
        options.forEach((option, index) => {
            console.log(`${index + 1}. ${option}`);
        });
        
        let choice = -1;
        while (choice < 1 || choice > options.length) {
            const input = await this.promptUser(`\nSelect option (1-${options.length}): `);
            choice = parseInt(input);
            if (isNaN(choice) || choice < 1 || choice > options.length) {
                console.log("Invalid choice. Please try again.");
            }
        }
        return choice - 1;
    }

    /**
     * Allows user to update existing items in a list.
     * @param items Current list of items
     * @param itemType Type of items (e.g., "attribute", "method")
     * @returns Updated list of items
     */
    private async updateItems(items: string[], itemType: string): Promise<string[]> {
        if (items.length === 0) {
            console.log(`\nNo ${itemType}s to update.`);
            return items;
        }

        const updatedItems = [...items];
        
        while (true) {
            this.displayCurrentItems(updatedItems, itemType);

            const options = [
                `Add new ${itemType}`,
                `Edit existing ${itemType}`,
                `Delete ${itemType}`,
                "Finish updating"
            ];

            const choice = await this.showMenu(options, `Update ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}s`);

            if (choice === 3) { // Finish
                return updatedItems;
            }

            await this.handleItemAction(choice, updatedItems, itemType);
        }
    }

    /**
     * Displays current items in the list.
     * @param items List of items to display
     * @param itemType Type of items
     */
    private displayCurrentItems(items: string[], itemType: string): void {
        console.log(`\nCurrent ${itemType}s:`);
        items.forEach((item, index) => {
            console.log(`${index + 1}. ${item}`);
        });
    }

    /**
     * Handles the selected action for item management.
     * @param choice Selected action index
     * @param items List of items to modify
     * @param itemType Type of items
     */
    private async handleItemAction(choice: number, items: string[], itemType: string): Promise<void> {
        switch (choice) {
            case 0: { // Add new
                const newItem = await this.promptUser(`Enter new ${itemType}: `);
                if (newItem) {
                    items.push(newItem);
                    console.log(`Added: ${newItem}`);
                }
                break;
            }
            case 1: { // Edit existing
                if (items.length > 0) {
                    await this.editItem(items, itemType);
                }
                break;
            }
            case 2: { // Delete
                if (items.length > 0) {
                    await this.deleteItem(items, itemType);
                }
                break;
            }
        }
    }

    /**
     * Edits an existing item in the list.
     * @param items List of items
     * @param itemType Type of items
     */
    private async editItem(items: string[], itemType: string): Promise<void> {
        const itemIndex = await this.selectItemIndex(items, `Select ${itemType} to edit`);
        const editedItem = await this.promptUser(`Edit ${itemType} (current: ${items[itemIndex]}): `);
        if (editedItem) {
            items[itemIndex] = editedItem;
            console.log(`Updated: ${editedItem}`);
        }
    }

    /**
     * Deletes an item from the list.
     * @param items List of items
     * @param itemType Type of items
     */
    private async deleteItem(items: string[], itemType: string): Promise<void> {
        const itemIndex = await this.selectItemIndex(items, `Select ${itemType} to delete`);
        const deletedItem = items.splice(itemIndex, 1)[0];
        console.log(`Deleted: ${deletedItem}`);
    }

    /**
     * Helper method to select an item index from a list.
     * @param items List of items
     * @param prompt Prompt message
     * @returns Selected index
     */
    private async selectItemIndex(items: string[], prompt: string): Promise<number> {
        console.log(`\n${prompt}:`);
        items.forEach((item, index) => {
            console.log(`${index + 1}. ${item}`);
        });

        let choice = -1;
        while (choice < 1 || choice > items.length) {
            const input = await this.promptUser(`Select item (1-${items.length}): `);
            choice = parseInt(input);
            if (isNaN(choice) || choice < 1 || choice > items.length) {
                console.log("Invalid choice. Please try again.");
            }
        }
        return choice - 1;
    }

    /**
     * Generates the mermaid class diagram code.
     * @param title Optional diagram title
     * @param className The class name
     * @param attributes Array of class attributes
     * @param methods Array of class methods
     * @returns The formatted mermaid code
     */
    private generateMermaidCode(title: string, className: string, attributes: string[], methods: string[]): string {
        let mermaidCode = "classDiagram\n";

        if (title) {
            mermaidCode += `  %% title: ${title}\n`;
        }

        mermaidCode += `  class ${className}{\n`;
        
        for (const attr of attributes) {
            mermaidCode += `    ${attr}\n`;
        }
        
        for (const method of methods) {
            mermaidCode += `    ${method}\n`;
        }
        
        mermaidCode += "  }\n";
        
        return mermaidCode;
    }

    /**
     * Saves the mermaid code to a file or prints to console.
     * @param mermaidCode The generated mermaid code
     * @param filename Optional output filename
     * @param sourceFile Optional source file path (for replacement operations)
     * @param diagramIndex Optional index of diagram to replace in source file
     */
    private async saveOrPrintCode(mermaidCode: string, filename: string, sourceFile?: string, diagramIndex?: number): Promise<void> {
        if (filename) {
            try {
                // Check if we're updating the same file we loaded from
                if (sourceFile && filename === sourceFile && diagramIndex !== undefined) {
                    await this.replaceDiagramInFile(filename, mermaidCode, diagramIndex);
                } else {
                    // Regular append operation
                    const fileExists = fsSync.existsSync(filename);
                    let contentToAppend = '';

                    if (fileExists) {
                        contentToAppend += '\n\n';
                    }

                    contentToAppend += `\`\`\`mermaid\n${mermaidCode}\`\`\`\n`;

                    await fs.appendFile(filename, contentToAppend, { encoding: 'utf8' });
                    console.log(`\nMermaid Class Diagram has been appended to '${filename}'`);
                    console.log("You can now open this Markdown file in a viewer that supports Mermaid.js (e.g., VS Code).");
                }
            } catch (e: any) {
                console.error(`Error: Could not write to file '${filename}'. ${e.message}`);
            }
        } else {
            console.log("\n--- Generated Mermaid Code ---");
            console.log("```mermaid");
            console.log(mermaidCode.trim());
            console.log("```");
            console.log("\nCopy the code above and paste it into your Markdown file.");
        }
    }

    /**
     * Replaces a specific diagram in an existing file.
     * @param filename The file to update
     * @param newMermaidCode The new mermaid code
     * @param diagramIndex Index of the diagram to replace
     */
    private async replaceDiagramInFile(filename: string, newMermaidCode: string, diagramIndex: number): Promise<void> {
        try {
            const fileContent = await fs.readFile(filename, 'utf8');
            const mermaidRegex = /```mermaid\s*([\s\S]*?)```/g;
            const matches = [...fileContent.matchAll(mermaidRegex)];
            
            if (diagramIndex >= matches.length) {
                throw new Error(`Diagram index ${diagramIndex} not found in file.`);
            }

            // Replace the specific diagram
            const match = matches[diagramIndex];
            if (!match?.[0]) {
                throw new Error(`Invalid diagram match at index ${diagramIndex}.`);
            }
            
            const oldDiagram = match[0]; // Full match including ```mermaid``` wrapper
            const newDiagram = `\`\`\`mermaid\n${newMermaidCode}\`\`\``;
            
            const updatedContent = fileContent.replace(oldDiagram, newDiagram);
            
            await fs.writeFile(filename, updatedContent, { encoding: 'utf8' });
            console.log(`\nMermaid Class Diagram has been updated in '${filename}'`);
            console.log("The original diagram has been replaced with your updated version.");
        } catch (error: any) {
            console.error(`Error updating diagram in file: ${error.message}`);
            // Fallback to append if replacement fails
            console.log("Falling back to append mode...");
            await this.saveOrPrintCode(newMermaidCode, filename);
        }
    }

    /**
     * Main method to generate mermaid class diagram.
     */
    public async generateMermaidClassDiagram(): Promise<void> {
        console.log("--- Mermaid Class Diagram Generator ---");

        try {
            const mode = await this.selectMode();
            
            if (mode === 0) {
                await this.createNewDiagram();
            } else {
                await this.updateExistingDiagram();
            }

        } finally {
            this.close();
        }
    }

    /**
     * Allows user to select between creating new or updating existing diagram.
     * @returns Selected mode index (0 for new, 1 for update)
     */
    private async selectMode(): Promise<number> {
        const modes = [
            "Create new class diagram",
            "Update existing class diagram"
        ];
        return await this.showMenu(modes, "Select Mode");
    }

    /**
     * Creates a new class diagram.
     */
    private async createNewDiagram(): Promise<void> {
        // Reset source tracking for new diagrams
        this.sourceFile = undefined;
        this.diagramIndex = undefined;
        
        // Get diagram title (optional)
        const diagramTitle = await this.promptUser("\nEnter Diagram Title (optional, press Enter to skip): ");

        // Get class name (required)
        const className = await this.getClassName();

        // Get attributes
        const attributes = await this.getMultilineInput(
            "Enter Attributes (one per line, e.g., +String name, -int age):",
            "  (Press Enter twice when done)"
        );

        // Get methods
        const methods = await this.getMultilineInput(
            "Enter Methods (one per line, e.g., +void login(), +boolean logout()):",
            "  (Press Enter twice when done)"
        );

        // Generate mermaid code
        const mermaidCode = this.generateMermaidCode(diagramTitle, className, attributes, methods);

        // Ask for output file
        const outputFilename = await this.promptUser("\nEnter output Markdown filename (e.g., my_class_diagram.md, press Enter to print to console): ");

        // Save or print the code
        await this.saveOrPrintCode(mermaidCode, outputFilename);
    }

    /**
     * Updates an existing class diagram.
     */
    private async updateExistingDiagram(): Promise<void> {
        console.log("\n--- Update Existing Class Diagram ---");
        
        // Ask user how they want to provide the existing diagram
        const inputMethod = await this.selectInputMethod();
        
        let diagramTitle = "";
        let className = "";
        let attributes: string[] = [];
        let methods: string[] = [];

        if (inputMethod === 0) {
            // Load from file
            const result = await this.loadFromFile();
            if (result) {
                diagramTitle = result.title;
                className = result.className;
                attributes = result.attributes;
                methods = result.methods;
                console.log(`\nLoaded diagram for class: ${className}`);
            } else {
                console.log("Failed to load from file. Please enter manually.");
                return await this.enterManually();
            }
        } else {
            // Enter manually
            return await this.enterManually();
        }

        // Continue with update process
        await this.performUpdates(diagramTitle, className, attributes, methods);
    }

    /**
     * Allows user to select input method for existing diagram.
     * @returns Selected input method index (0 for file, 1 for manual)
     */
    private async selectInputMethod(): Promise<number> {
        const methods = [
            "Load from existing markdown file",
            "Enter diagram details manually"
        ];
        return await this.showMenu(methods, "How do you want to provide the existing diagram?");
    }

    /**
     * Loads diagram information from a file.
     * @returns Parsed diagram information or null if failed
     */
    private async loadFromFile(): Promise<{ title: string; className: string; attributes: string[]; methods: string[] } | null> {
        const filename = await this.promptUser("Enter the path to the markdown file containing the diagram: ");
        
        if (!filename) {
            console.log("No filename provided.");
            return null;
        }

        try {
            const fileContent = await fs.readFile(filename, 'utf8');
            this.sourceFile = filename; // Store source file for potential replacement
            return this.parseMermaidFromFile(fileContent);
        } catch (error: any) {
            console.error(`Error reading file: ${error.message}`);
            return null;
        }
    }

    /**
     * Parses mermaid class diagram from file content.
     * @param content File content
     * @returns Parsed diagram information or null if parsing failed
     */
    private async parseMermaidFromFile(content: string): Promise<{ title: string; className: string; attributes: string[]; methods: string[] } | null> {
        try {
            // Find mermaid code blocks
            const mermaidRegex = /```mermaid\s*([\s\S]*?)```/g;
            const matches = [...content.matchAll(mermaidRegex)];
            
            if (matches.length === 0) {
                console.log("No mermaid code blocks found in the file.");
                return null;
            }

            let selectedDiagram = matches[0]?.[1];
            
            if (!selectedDiagram) {
                console.log("Invalid diagram format found.");
                return null;
            }
            
            // If multiple diagrams, let user choose
            if (matches.length > 1) {
                console.log(`\nFound ${matches.length} mermaid diagrams in the file.`);
                const choice = await this.selectDiagramFromMultiple(matches);
                this.diagramIndex = choice; // Store which diagram was selected
                selectedDiagram = matches[choice]?.[1];
                
                if (!selectedDiagram) {
                    console.log("Invalid diagram selection.");
                    return null;
                }
            } else {
                this.diagramIndex = 0; // First and only diagram
            }

            return this.parseDiagramContent(selectedDiagram);
        } catch (error: any) {
            console.error(`Error parsing file: ${error.message}`);
            return null;
        }
    }

    /**
     * Allows user to select from multiple diagrams found in file.
     * @param matches Array of regex matches containing diagram content
     * @returns Index of selected diagram
     */
    private async selectDiagramFromMultiple(matches: RegExpMatchArray[]): Promise<number> {
        console.log("\nAvailable diagrams:");
        matches.forEach((match, index) => {
            const content = match[1];
            if (content) {
                const preview = content.substring(0, 100).replace(/\n/g, ' ').trim();
                console.log(`${index + 1}. ${preview}...`);
            } else {
                console.log(`${index + 1}. [Invalid diagram content]`);
            }
        });

        let choice = -1;
        while (choice < 1 || choice > matches.length) {
            const input = await this.promptUser(`Select diagram (1-${matches.length}): `);
            choice = parseInt(input);
            if (isNaN(choice) || choice < 1 || choice > matches.length) {
                console.log("Invalid choice. Please try again.");
            }
        }
        return choice - 1;
    }

    /**
     * Parses the actual diagram content to extract class information.
     * @param diagramContent The mermaid diagram content
     * @returns Parsed class information
     */
    private parseDiagramContent(diagramContent: string): { title: string; className: string; attributes: string[]; methods: string[] } {
        const lines = diagramContent.split('\n').map(line => line.trim());
        
        let title = "";
        let className = "";
        const attributes: string[] = [];
        const methods: string[] = [];
        let insideClass = false;

        for (const line of lines) {
            if (line.startsWith('%% title:')) {
                title = line.replace('%% title:', '').trim();
            } else if (line.startsWith('class ') && line.includes('{')) {
                className = line.replace('class ', '').replace('{', '').trim();
                insideClass = true;
            } else if (line === '}') {
                insideClass = false;
            } else if (insideClass && line) {
                // Simple heuristic: if it contains parentheses, it's likely a method
                if (line.includes('(') && line.includes(')')) {
                    methods.push(line);
                } else {
                    attributes.push(line);
                }
            }
        }

        return { title, className, attributes, methods };
    }

    /**
     * Asks user how to handle saving when the output file is the same as the source.
     * @param filename The output filename
     * @returns User's choice for save operation
     */
    private async getSaveOption(filename: string): Promise<'replace' | 'append' | 'cancel'> {
        if (this.sourceFile && filename === this.sourceFile) {
            console.log(`\n⚠️  You're saving to the same file you loaded from: ${filename}`);
            const options = [
                "Replace the original diagram",
                "Append as a new diagram",
                "Cancel and choose different filename"
            ];
            
            const choice = await this.showMenu(options, "How would you like to save?");
            
            switch (choice) {
                case 0: return 'replace';
                case 1: return 'append';
                case 2: return 'cancel';
                default: return 'cancel';
            }
        }
        return 'append'; // Default behavior for new files
    }

    /**
     * Handles manual entry of diagram details.
     */
    private async enterManually(): Promise<void> {
        // Get current class information
        const diagramTitle = await this.promptUser("Enter current Diagram Title (optional): ");
        const className = await this.getClassName();
        
        // Get current attributes
        console.log("\nEnter current attributes (if any):");
        const attributes = await this.getMultilineInput(
            "Current Attributes:",
            "  (Press Enter twice when done, or skip if none)"
        );

        // Get current methods
        console.log("\nEnter current methods (if any):");
        const methods = await this.getMultilineInput(
            "Current Methods:",
            "  (Press Enter twice when done, or skip if none)"
        );

        await this.performUpdates(diagramTitle, className, attributes, methods);
    }

    /**
     * Handles the save operation for updated diagrams.
     * @param mermaidCode The generated mermaid code
     */
    private async handleSaveOperation(mermaidCode: string): Promise<void> {
        while (true) {
            const outputFilename = await this.promptUser("\nEnter output Markdown filename (e.g., updated_diagram.md, press Enter to print to console): ");
            
            if (!outputFilename) {
                // Print to console
                await this.saveOrPrintCode(mermaidCode, "");
                return;
            }
            
            const saveOption = await this.getSaveOption(outputFilename);
            
            if (saveOption === 'cancel') {
                console.log("Please enter a different filename:");
                continue; // Ask for filename again
            }
            
            if (saveOption === 'replace' && this.sourceFile && this.diagramIndex !== undefined) {
                await this.saveOrPrintCode(mermaidCode, outputFilename, this.sourceFile, this.diagramIndex);
            } else {
                await this.saveOrPrintCode(mermaidCode, outputFilename);
            }
            return;
        }
    }

    /**
     * Performs the actual update operations on the diagram.
     * @param diagramTitle Current diagram title
     * @param className Current class name
     * @param attributes Current attributes
     * @param methods Current methods
     */
    private async performUpdates(diagramTitle: string, className: string, attributes: string[], methods: string[]): Promise<void> {
        let currentTitle = diagramTitle;
        let currentClassName = className;
        let currentAttributes = [...attributes];
        let currentMethods = [...methods];

        // Update options
        while (true) {
            const updateOptions = [
                "Update class name",
                "Update attributes",
                "Update methods",
                "Preview diagram",
                "Save and finish"
            ];

            const choice = await this.showMenu(updateOptions, "What would you like to update?");

            if (choice === 4) { // Save and finish
                const mermaidCode = this.generateMermaidCode(currentTitle, currentClassName, currentAttributes, currentMethods);
                await this.handleSaveOperation(mermaidCode);
                return;
            }

            const updated = await this.handleUpdateChoice(choice, currentTitle, currentClassName, currentAttributes, currentMethods);
            currentTitle = updated.title;
            currentClassName = updated.className;
            currentAttributes = updated.attributes;
            currentMethods = updated.methods;
        }
    }

    /**
     * Handles individual update choices.
     * @param choice The selected update option
     * @param currentTitle Current diagram title
     * @param currentClassName Current class name
     * @param currentAttributes Current attributes
     * @param currentMethods Current methods
     * @returns Updated values
     */
    private async handleUpdateChoice(
        choice: number, 
        currentTitle: string, 
        currentClassName: string, 
        currentAttributes: string[], 
        currentMethods: string[]
    ): Promise<{ title: string; className: string; attributes: string[]; methods: string[] }> {
        switch (choice) {
            case 0: { // Update class name
                const newClassName = await this.promptUser(`Update class name (current: ${currentClassName}): `);
                if (newClassName) {
                    currentClassName = newClassName;
                    console.log(`Class name updated to: ${currentClassName}`);
                }
                break;
            }
            case 1: { // Update attributes
                currentAttributes = await this.updateItems(currentAttributes, "attribute");
                break;
            }
            case 2: { // Update methods
                currentMethods = await this.updateItems(currentMethods, "method");
                break;
            }
            case 3: { // Preview diagram
                const previewCode = this.generateMermaidCode(currentTitle, currentClassName, currentAttributes, currentMethods);
                console.log("\n--- Preview ---");
                console.log("```mermaid");
                console.log(previewCode.trim());
                console.log("```");
                break;
            }
        }
        
        return {
            title: currentTitle,
            className: currentClassName,
            attributes: currentAttributes,
            methods: currentMethods
        };
    }

    /**
     * Closes the readline interface.
     */
    public close(): void {
        this.rl.close();
    }
}

// Create and run the generator
async function runGenerator(): Promise<void> {
    const generator = new MermaidClassGenerator();
    await generator.generateMermaidClassDiagram();
}

// Run the generator if this file is executed directly
if (require.main === module) {
    runGenerator().catch(console.error);
}

// Export the class for testing or other purposes
export { MermaidClassGenerator };
export default runGenerator;