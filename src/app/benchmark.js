const fs = require('fs').promises;
const path = require('path');

// Mock the kuromoji tokenizer for testing purposes
// In a real implementation, you'd use the actual kuromoji library
const mockTokenizer = {
  tokenize(text) {
    // Simple mock that creates tokens for each character
    // Simulates the processing time of tokenization
    return text.split('').map(char => ({
      surface_form: char,
      pos: 'mock',
      // Add delay to simulate tokenization processing time
      _delay: Array(100).fill(0).map(x => Math.random())
    })).filter(token => token.surface_form !== ' ' && token.surface_form !== '　');
  }
};

// Mock tokenizer creation (simulates the actual kuromoji loading)
async function createTokenizer() {
  // Simulate dictionary loading time
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockTokenizer;
}

// First approach: Bulk tokenization
function parseSrtBulk(content) {
  const lines = content.split('\n');
  const result = [];
  
  let currentEntry = {};
  let isReadingContent = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      if (Object.keys(currentEntry).length > 0) {
        result.push(currentEntry);
        currentEntry = {};
        isReadingContent = false;
      }
      continue;
    }
    
    if (isReadingContent) {
      currentEntry.content = (currentEntry.content || '') + 
        (currentEntry.content ? ' ' : '') + line;
      continue;
    }
    
    if (/^\d+$/.test(line) && !currentEntry.id) {
      currentEntry.id = parseInt(line);
      continue;
    }
    
    const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
    if (timestampMatch) {
      currentEntry.from = timestampMatch[1];
      currentEntry.to = timestampMatch[2];
      isReadingContent = true;
      continue;
    }
  }
  
  if (Object.keys(currentEntry).length > 0) {
    result.push(currentEntry);
  }
  
  return result;
}

// Tokenize subs after parsing (first approach)
async function tokenizeSubs(subs) {
  try {
    const tokenizer = await createTokenizer();
    
    // Map through each subtitle and add tokenized content
    return subs.map(sub => ({
      ...sub,
      tokens: tokenizer.tokenize(sub.content || '')
    }));
  } catch (error) {
    console.error("Tokenization failed:", error);
    // Return original subs if tokenization fails
    return subs;
  }
}

// First approach - parse then tokenize
async function approachOne(content) {
  const parsedSubs = parseSrtBulk(content);
  return await tokenizeSubs(parsedSubs);
}

// Function to clean subtitle content
function cleanContent(content) {
  // Remove {\\an8}
  let cleanedContent = content.replace(/\{\\an\d+\}/g, '');
  return cleanedContent;
}

// Second approach - inline tokenization
async function approachTwo(content) {
  const tokenizer = await createTokenizer();
  
  const lines = content.split('\n');
  const result = [];
  
  let currentEntry = {};
  let isReadingContent = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      if (Object.keys(currentEntry).length > 0) {
        if(currentEntry.content) {
          currentEntry.tokens = tokenizer.tokenize(currentEntry.content);
        }
        result.push(currentEntry);
        currentEntry = {};
        isReadingContent = false;
      }
      continue;
    }
    
    if (isReadingContent) {
      const initialContent = (currentEntry.content || '') + 
        (currentEntry.content ? ' ' : '') + line;

      currentEntry.content = cleanContent(initialContent);
      continue;
    }
    
    if (/^\d+$/.test(line) && !currentEntry.id) {
      currentEntry.id = parseInt(line);
      continue;
    }
    
    const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
    if (timestampMatch) {
      currentEntry.from = timestampMatch[1];
      currentEntry.to = timestampMatch[2];
      isReadingContent = true;
      continue;
    }
  }
  
  if (Object.keys(currentEntry).length > 0) {
    result.push(currentEntry);
  }
  
  return result;
}

// Helper function to create a sample SRT file of varying sizes
function generateSampleSRT(entryCount) {
  let srtContent = '';
  
  for (let i = 1; i <= entryCount; i++) {
    srtContent += `${i}\n`;
    srtContent += `00:0${Math.floor(i/60)}:${i % 60},000 --> 00:0${Math.floor(i/60)}:${(i % 60) + 3},000\n`;
    srtContent += `This is subtitle text for entry ${i}. Some sample text here.\n\n`;
  }
  
  return srtContent;
}

// Benchmark function
async function runBenchmark() {
  console.log("Starting benchmark...");
  
  // Define test sizes
  const testSizes = [10, 100, 500, 1000];
  
  for (const size of testSizes) {
    console.log(`\nTesting with ${size} subtitle entries:`);
    
    // Generate test data
    const sampleSRT = generateSampleSRT(size);
    
    // Benchmark approach one
    const startOne = Date.now();
    const resultOne = await approachOne(sampleSRT);
    const endOne = Date.now();
    const timeOne = endOne - startOne;
    
    console.log(`Approach 1 (Bulk Tokenization): ${timeOne}ms`);
    
    // Benchmark approach two
    const startTwo = Date.now();
    const resultTwo = await approachTwo(sampleSRT);
    const endTwo = Date.now();
    const timeTwo = endTwo - startTwo;
    
    console.log(`Approach 2 (Inline Tokenization): ${timeTwo}ms`);
    
    // Calculate improvement percentage
    const improvement = ((timeOne - timeTwo) / timeOne) * 100;
    console.log(`Difference: ${improvement.toFixed(2)}% ${improvement > 0 ? 'faster' : 'slower'} with inline tokenization`);
  }
}

// Run multiple iterations for more accurate results
async function runMultipleIterations(iterations = 3) {
  console.log(`Running ${iterations} iterations for more accurate results...\n`);
  
  const results = {};
  
  // Define test sizes
  const testSizes = [10, 100, 500, 1000];
  
  for (let i = 0; i < iterations; i++) {
    console.log(`\n--- Iteration ${i + 1} ---`);
    
    for (const size of testSizes) {
      if (!results[size]) {
        results[size] = [[], []]; // [approach1Times, approach2Times]
      }
      
      console.log(`Testing with ${size} subtitle entries:`);
      
      // Generate test data
      const sampleSRT = generateSampleSRT(size);
      
      // Benchmark approach one
      const startOne = Date.now();
      await approachOne(sampleSRT);
      const endOne = Date.now();
      const timeOne = endOne - startOne;
      results[size][0].push(timeOne);
      
      console.log(`Approach 1: ${timeOne}ms`);
      
      // Benchmark approach two
      const startTwo = Date.now();
      await approachTwo(sampleSRT);
      const endTwo = Date.now();
      const timeTwo = endTwo - startTwo;
      results[size][1].push(timeTwo);
      
      console.log(`Approach 2: ${timeTwo}ms`);
    }
  }
  
  // Calculate and print averages
  console.log("\n--- Final Results (Averages) ---");
  
  for (const size of testSizes) {
    const avgOne = results[size][0].reduce((a, b) => a + b, 0) / iterations;
    const avgTwo = results[size][1].reduce((a, b) => a + b, 0) / iterations;
    const improvement = ((avgOne - avgTwo) / avgOne) * 100;
    
    console.log(`\nSize: ${size} subtitle entries`);
    console.log(`Approach 1 (Bulk): ${avgOne.toFixed(2)}ms`);
    console.log(`Approach 2 (Inline): ${avgTwo.toFixed(2)}ms`);
    console.log(`Average improvement: ${improvement.toFixed(2)}% ${improvement > 0 ? 'faster' : 'slower'} with inline tokenization`);
  }
}

// Run the benchmark
(async () => {
  try {
    console.log("Running single benchmark test...");
    await runBenchmark();
    
    console.log("\nRunning multiple iterations for more accurate results...");
    await runMultipleIterations(3); // Run 3 iterations
  } catch (error) {
    console.error("Benchmark failed:", error);
  }
})();