import { MermaidClassGenerator } from '../src/services/mermaid';

/**
 * Demo script showing the MermaidClassGenerator features
 */
async function demonstrateFeatures() {
    console.log('='.repeat(60));
    console.log('🚀 MERMAID CLASS DIAGRAM GENERATOR DEMO');
    console.log('='.repeat(60));

    // Create an instance
    const generator = new MermaidClassGenerator();

    console.log('\n📋 DEMO OVERVIEW:');
    console.log('This tool provides the following capabilities:');
    console.log('✅ Create new class diagrams interactively');
    console.log('✅ Load existing diagrams from markdown files');
    console.log('✅ Update class names, attributes, and methods');
    console.log('✅ Preview diagrams before saving');
    console.log('✅ Handle multiple diagrams in one file');
    console.log('✅ Export to markdown format');

    console.log('\n📁 EXAMPLE FILES CREATED:');
    console.log('• demo/example_diagram.md - Sample markdown with 2 diagrams');
    console.log('• demo/DEMO_GUIDE.md - Complete usage guide');

    console.log('\n🎯 TO RUN THE INTERACTIVE DEMO:');
    console.log('Execute: bun run src/services/mermaid.ts');
    console.log('');
    console.log('Then try:');
    console.log('1. Create a new diagram');
    console.log('2. Update existing diagram → Load from file → ./demo/example_diagram.md');

    console.log('\n📋 SAMPLE WORKFLOW:');
    console.log('1. Select "Update existing class diagram"');
    console.log('2. Choose "Load from existing markdown file"');
    console.log('3. Enter path: ./demo/example_diagram.md');
    console.log('4. Select which diagram to update');  
    console.log('5. Make your changes (add/edit/delete attributes/methods)');
    console.log('6. Preview the result');
    console.log('7. Save to a new file');

    console.log('\n🔧 TECHNICAL FEATURES:');
    console.log('• Smart parsing of mermaid code blocks');
    console.log('• Distinction between attributes and methods');
    console.log('• Validation and error handling');
    console.log('• Clean TypeScript class-based architecture');

    console.log('\n' + '='.repeat(60));
    console.log('Demo complete! Check the demo/ folder for examples.');
    console.log('='.repeat(60));

    // Clean up
    generator.close();
}

// Run the demo
if (require.main === module) {
    demonstrateFeatures().catch(console.error);
}

export { demonstrateFeatures };
