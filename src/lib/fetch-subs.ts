import { Sub, Token } from "@/app/types";
import * as kuromoji from "kuromoji";

// Create a promise-based tokenizer builder
function createTokenizer(dicPath = "/dict") {
  return new Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>>((resolve, reject) => {
    kuromoji.builder({ dicPath })
      .build((err, tokenizer) => {
        if (err) reject(err);
        else resolve(tokenizer);
      });
  });
}

export async function fetchSub(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

export async function parseSubToJson({ url, format }: { url: string, format: 'srt' | 'vtt' | 'ass' }) {
  const content = await fetchSub(url);
  
  switch (format) {
    case 'srt':
      return parseSrt(content);
    default:
      throw new Error(`Unsupported subtitle format: ${format}`);
  }
}

// Function to clean subtitle content
function cleanContent(content: string) {
  // Remove {\\an8}
  let cleanedContent = content.replace(/\{\\an\d+\}/g, '');
  
  return cleanedContent;
}

async function parseSrt(content: string) {
  
  const tokenizer = await createTokenizer();
  
  const lines = content.split('\n');
  const result = [];
  
  let currentEntry: Partial<Sub> = {}
  let isReadingContent = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '') {
      if (Object.keys(currentEntry).length > 0) {
        if(currentEntry.content) {
          currentEntry.tokens = tokenizer.tokenize(currentEntry.content)
            .filter(token => token.surface_form !== ' ' && token.surface_form !== '　');
        }
        result.push(currentEntry);
        currentEntry = {};
        isReadingContent = false;
      }
      continue;
    }
    
    if (isReadingContent) {
      const initalContent = (currentEntry.content || '') + 
        (currentEntry.content ? ' ' : '') + line;

      currentEntry.content = cleanContent(initalContent)
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
  
  return result as Sub[];
}