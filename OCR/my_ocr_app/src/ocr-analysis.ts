import * as fs from 'fs';
import * as path from 'path';

interface ComparisonResult {
    similarity: number;
    exactMatches: string[];
    partialMatches: Array<{original: string, extracted: string, similarity: number}>;
    missingText: string[];
    extraText: string[];
    corrections: Array<{original: string, corrected: string}>;
    summary: string;
}

function calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,     // insertion
                matrix[j - 1][i] + 1,     // deletion
                matrix[j - 1][i - 1] + indicator // substitution
            );
        }
    }
    
    return matrix[str2.length][str1.length];
}

function normalizeText(text: string): string {
    return text
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s\-.,!?]/g, '')
        .trim();
}

function tokenizeText(text: string): string[] {
    return text
        .split(/\s+/)
        .filter(token => token.length > 0)
        .map(token => token.replace(/[^\w]/g, ''));
}

function compareTexts(reference: string, extracted: string): ComparisonResult {
    const normalizedRef = normalizeText(reference);
    const normalizedExt = normalizeText(extracted);
    
    // Overall similarity
    const overallSimilarity = calculateStringSimilarity(normalizedRef, normalizedExt);
    
    // Tokenize for detailed analysis
    const refTokens = tokenizeText(normalizedRef);
    const extTokens = tokenizeText(normalizedExt);
    
    const exactMatches: string[] = [];
    const partialMatches: Array<{original: string, extracted: string, similarity: number}> = [];
    const missingText: string[] = [];
    const extraText: string[] = [];
    const corrections: Array<{original: string, corrected: string}> = [];
    
    // Find exact matches
    const matchedRef = new Set<number>();
    const matchedExt = new Set<number>();
    
    for (let i = 0; i < refTokens.length; i++) {
        for (let j = 0; j < extTokens.length; j++) {
            if (!matchedRef.has(i) && !matchedExt.has(j) && refTokens[i] === extTokens[j]) {
                exactMatches.push(refTokens[i]);
                matchedRef.add(i);
                matchedExt.add(j);
                break;
            }
        }
    }
    
    // Find partial matches for unmatched tokens
    for (let i = 0; i < refTokens.length; i++) {
        if (matchedRef.has(i)) continue;
        
        let bestMatch = { index: -1, similarity: 0 };
        for (let j = 0; j < extTokens.length; j++) {
            if (matchedExt.has(j)) continue;
            
            const similarity = calculateStringSimilarity(refTokens[i], extTokens[j]);
            if (similarity > bestMatch.similarity && similarity > 0.4) {
                bestMatch = { index: j, similarity };
            }
        }
        
        if (bestMatch.index !== -1) {
            partialMatches.push({
                original: refTokens[i],
                extracted: extTokens[bestMatch.index],
                similarity: bestMatch.similarity
            });
            matchedRef.add(i);
            matchedExt.add(bestMatch.index);
            
            if (bestMatch.similarity < 0.9) {
                corrections.push({
                    original: extTokens[bestMatch.index],
                    corrected: refTokens[i]
                });
            }
        }
    }
    
    // Find missing text (in reference but not extracted)
    for (let i = 0; i < refTokens.length; i++) {
        if (!matchedRef.has(i)) {
            missingText.push(refTokens[i]);
        }
    }
    
    // Find extra text (extracted but not in reference)
    for (let j = 0; j < extTokens.length; j++) {
        if (!matchedExt.has(j)) {
            extraText.push(extTokens[j]);
        }
    }
    
    // Generate summary
    const exactMatchPercent = (exactMatches.length / refTokens.length * 100).toFixed(1);
    const partialMatchPercent = (partialMatches.length / refTokens.length * 100).toFixed(1);
    const missingPercent = (missingText.length / refTokens.length * 100).toFixed(1);
    
    const summary = `
OCR ACCURACY ANALYSIS SUMMARY:
============================
Overall Text Similarity: ${(overallSimilarity * 100).toFixed(1)}%
Reference Text Length: ${refTokens.length} words
Extracted Text Length: ${extTokens.length} words

Word-Level Analysis:
- Exact Matches: ${exactMatches.length}/${refTokens.length} (${exactMatchPercent}%)
- Partial Matches: ${partialMatches.length}/${refTokens.length} (${partialMatchPercent}%)
- Missing Words: ${missingText.length}/${refTokens.length} (${missingPercent}%)
- Extra Words: ${extraText.length}

Quality Assessment:
${overallSimilarity > 0.8 ? '✅ EXCELLENT' : overallSimilarity > 0.6 ? '⚠️  GOOD' : overallSimilarity > 0.4 ? '❌ FAIR' : '❌ POOR'} - OCR accuracy
    `;
    
    return {
        similarity: overallSimilarity,
        exactMatches,
        partialMatches,
        missingText,
        extraText,
        corrections,
        summary
    };
}

async function analyzeOCRAccuracy() {
    try {
        // Read reference text
        const referencePath = path.join(__dirname, 'docs', 'text.txt');
        const referenceText = fs.readFileSync(referencePath, 'utf-8');
        
        // Find most recent OCR summary
        const summaryFiles = fs.readdirSync(__dirname)
            .filter(file => file.startsWith('ocr-summary-') && file.endsWith('.txt'))
            .sort()
            .reverse();
        
        if (summaryFiles.length === 0) {
            throw new Error('No OCR summary files found');
        }
        
        const latestSummary = path.join(__dirname, summaryFiles[0]);
        const summaryContent = fs.readFileSync(latestSummary, 'utf-8');
        
        // Extract combined text from summary
        const combinedTextMatch = summaryContent.match(/COMBINED TEXT:\s*"([^"]+)"/);
        if (!combinedTextMatch) {
            throw new Error('Could not extract combined text from OCR summary');
        }
        
        const extractedText = combinedTextMatch[1];
        
        console.log('🔍 ANALYZING OCR ACCURACY');
        console.log('========================');
        console.log(`📄 Reference file: ${referencePath}`);
        console.log(`📄 OCR summary file: ${latestSummary}`);
        console.log('');
        
        // Perform comparison
        const result = compareTexts(referenceText, extractedText);
        
        // Display results
        console.log(result.summary);
        
        console.log('\n📊 DETAILED ANALYSIS:');
        console.log('====================');
        
        if (result.exactMatches.length > 0) {
            console.log(`\n✅ EXACT MATCHES (${result.exactMatches.length}):`);
            result.exactMatches.slice(0, 10).forEach(match => console.log(`   "${match}"`));
            if (result.exactMatches.length > 10) {
                console.log(`   ... and ${result.exactMatches.length - 10} more`);
            }
        }
        
        if (result.partialMatches.length > 0) {
            console.log(`\n⚠️  PARTIAL MATCHES (${result.partialMatches.length}):`);
            result.partialMatches.slice(0, 10).forEach(match => {
                console.log(`   "${match.original}" → "${match.extracted}" (${(match.similarity * 100).toFixed(1)}%)`);
            });
            if (result.partialMatches.length > 10) {
                console.log(`   ... and ${result.partialMatches.length - 10} more`);
            }
        }
        
        if (result.missingText.length > 0) {
            console.log(`\n❌ MISSING FROM OCR (${result.missingText.length}):`);
            result.missingText.slice(0, 10).forEach(missing => console.log(`   "${missing}"`));
            if (result.missingText.length > 10) {
                console.log(`   ... and ${result.missingText.length - 10} more`);
            }
        }
        
        if (result.extraText.length > 0) {
            console.log(`\n➕ EXTRA IN OCR (${result.extraText.length}):`);
            result.extraText.slice(0, 10).forEach(extra => console.log(`   "${extra}"`));
            if (result.extraText.length > 10) {
                console.log(`   ... and ${result.extraText.length - 10} more`);
            }
        }
        
        if (result.corrections.length > 0) {
            console.log(`\n🔧 SUGGESTED CORRECTIONS (${result.corrections.length}):`);
            result.corrections.slice(0, 10).forEach(correction => {
                console.log(`   "${correction.original}" should be "${correction.corrected}"`);
            });
            if (result.corrections.length > 10) {
                console.log(`   ... and ${result.corrections.length - 10} more`);
            }
        }
        
        console.log('\n📋 REFERENCE TEXT:');
        console.log('==================');
        console.log(referenceText.substring(0, 200) + (referenceText.length > 200 ? '...' : ''));
        
        console.log('\n📋 EXTRACTED TEXT:');
        console.log('==================');
        console.log(extractedText.substring(0, 200) + (extractedText.length > 200 ? '...' : ''));
        
        // Save detailed analysis
        const analysisFile = path.join(__dirname, `ocr-analysis-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`);
        const detailedReport = `OCR ACCURACY ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}

${result.summary}

DETAILED BREAKDOWN:
==================

EXACT MATCHES (${result.exactMatches.length}):
${result.exactMatches.map(match => `- "${match}"`).join('\n')}

PARTIAL MATCHES (${result.partialMatches.length}):
${result.partialMatches.map(match => `- "${match.original}" → "${match.extracted}" (${(match.similarity * 100).toFixed(1)}%)`).join('\n')}

MISSING FROM OCR (${result.missingText.length}):
${result.missingText.map(missing => `- "${missing}"`).join('\n')}

EXTRA IN OCR (${result.extraText.length}):
${result.extraText.map(extra => `- "${extra}"`).join('\n')}

SUGGESTED CORRECTIONS (${result.corrections.length}):
${result.corrections.map(correction => `- "${correction.original}" → "${correction.corrected}"`).join('\n')}

REFERENCE TEXT:
==============
${referenceText}

EXTRACTED TEXT:
==============
${extractedText}
`;
        
        fs.writeFileSync(analysisFile, detailedReport);
        console.log(`\n💾 Detailed analysis saved to: ${analysisFile}`);
        
    } catch (error) {
        console.error('❌ Error analyzing OCR accuracy:', error);
    }
}

// Run the analysis
analyzeOCRAccuracy();
