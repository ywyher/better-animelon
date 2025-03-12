/**
 * Parse subtitle files of different formats (SRT, VTT, ASS) into a standardized JSON format
 * @param content The subtitle file content as string
 * @param format The subtitle format: 'srt', 'vtt', or 'ass'
 * @returns Array of subtitle entries with id, from, to, and content fields
 */
export function parseSubtitlesToJson(content: string, format: 'srt' | 'vtt' | 'ass' = 'srt') {
  // Clean up line endings for consistent processing
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  switch (format) {
    case 'srt':
      return parseSRT(normalizedContent);
    case 'vtt':
      return parseVTT(normalizedContent);
    case 'ass':
      return parseASS(normalizedContent);
    default:
      throw new Error(`Unsupported subtitle format: ${format}`);
  }
}

/**
 * Parse SRT format subtitles
 */
function parseSRT(content: string) {
  const lines = content.split('\n');
  const result = [];
  
  let currentEntry: { id?: number; from?: string; to?: string; content?: string } = {};
  let isReadingContent = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // If empty line, reset and save the current entry
    if (line === '') {
      if (Object.keys(currentEntry).length > 0 && currentEntry.content) {
        result.push(currentEntry);
        currentEntry = {};
        isReadingContent = false;
      }
      continue;
    }
    
    // If we're reading content, append to the current content
    if (isReadingContent) {
      const cleanLine = removeFormattingTags(line);
      if (cleanLine) {
        currentEntry.content = (currentEntry.content || '') + 
          (currentEntry.content ? ' ' : '') + cleanLine;
      }
      continue;
    }
    
    // If it's a number and we don't have an ID yet, it's the subtitle number
    if (/^\d+$/.test(line) && !currentEntry.id) {
      currentEntry.id = parseInt(line);
      continue;
    }
    
    // Check if it's a timestamp line
    const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (timestampMatch) {
      currentEntry.from = timestampMatch[1];
      currentEntry.to = timestampMatch[2];
      isReadingContent = true;
      continue;
    }
  }
  
  // Add the last entry if there is one
  if (Object.keys(currentEntry).length > 0 && currentEntry.content) {
    result.push(currentEntry);
  }
  
  return result;
}

/**
 * Parse WebVTT format subtitles
 */
function parseVTT(content: string) {
  const lines = content.split('\n');
  const result = [];
  
  // Skip WebVTT header
  let i = 0;
  while (i < lines.length && !lines[i].includes('-->')) {
    i++;
  }
  
  let currentEntry: { id?: number; from?: string; to?: string; content?: string } = {};
  let currentId = 1;
  let isReadingContent = false;
  
  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // If empty line, reset and save the current entry
    if (line === '') {
      if (Object.keys(currentEntry).length > 0 && currentEntry.content) {
        result.push(currentEntry);
        currentEntry = {};
        isReadingContent = false;
      }
      continue;
    }
    
    // If we're reading content, append to the current content
    if (isReadingContent) {
      const cleanLine = removeFormattingTags(line);
      if (cleanLine) {
        currentEntry.content = (currentEntry.content || '') + 
          (currentEntry.content ? ' ' : '') + cleanLine;
      }
      continue;
    }
    
    // Check if it's a timestamp line
    const timestampMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/);
    if (timestampMatch) {
      // In VTT, the times use dots instead of commas for milliseconds
      currentEntry.from = timestampMatch[1].replace('.', ',');
      currentEntry.to = timestampMatch[2].replace('.', ',');
      currentEntry.id = currentId++;
      isReadingContent = true;
      continue;
    }
    
    // In WebVTT, if it's not a timestamp and not content, it might be a cue identifier
    if (!isReadingContent && !currentEntry.id) {
      if (/^\d+$/.test(line)) {
        currentEntry.id = parseInt(line);
      } else {
        // If it's a string identifier, use it as is but still assign a numeric ID
        currentEntry.id = currentId++;
      }
    }
  }
  
  // Add the last entry if there is one
  if (Object.keys(currentEntry).length > 0 && currentEntry.content) {
    result.push(currentEntry);
  }
  
  return result;
}

/**
 * Parse ASS/SSA format subtitles
 */
function parseASS(content: string) {
  const lines = content.split('\n');
  const result = [];
  
  let currentId = 1;
  let isInEvents = false;
  let formatLine = null;
  let formatFields = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for the [Events] section
    if (line === '[Events]') {
      isInEvents = true;
      continue;
    }
    
    if (!isInEvents) {
      continue;
    }
    
    // Parse the Format line to understand field positions
    if (line.startsWith('Format:')) {
      formatLine = line.substring('Format:'.length).trim();
      formatFields = formatLine.split(',').map(field => field.trim());
      continue;
    }
    
    // Process dialogue lines for subtitles
    if (line.startsWith('Dialogue:') && formatFields.length > 0) {
      const dialogueValues = splitAssLine(line.substring('Dialogue:'.length).trim());
      
      // Create a mapping of fields to their values
      const fieldMap = {};
      for (let j = 0; j < Math.min(formatFields.length, dialogueValues.length); j++) {
        fieldMap[formatFields[j]] = dialogueValues[j];
      }
      
      // Extract start and end times
      if (fieldMap['Start'] && fieldMap['End']) {
        const entry = {
          id: currentId++,
          from: convertAssTimeToSrt(fieldMap['Start']),
          to: convertAssTimeToSrt(fieldMap['End']),
          content: removeAssFormatting(fieldMap['Text'] || '')
        };
        
        result.push(entry);
      }
    }
  }
  
  return result;
}

/**
 * Split ASS line respecting commas within braces
 */
function splitAssLine(line: string) {
  const result = [];
  let current = '';
  let inBraces = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '{') inBraces = true;
    if (char === '}') inBraces = false;
    
    if (char === ',' && !inBraces) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current) {
    result.push(current);
  }
  
  return result;
}

/**
 * Convert ASS time format (H:MM:SS.CC) to SRT format (HH:MM:SS,MMM)
 */
function convertAssTimeToSrt(assTime: string) {
  // ASS format is usually h:mm:ss.cc (where cc is centiseconds)
  const match = assTime.trim().match(/(\d+):(\d{2}):(\d{2})\.(\d{2})/);
  if (!match) return assTime;
  
  const hours = match[1].padStart(2, '0');
  const minutes = match[2];
  const seconds = match[3];
  const centiseconds = match[4];
  
  // Convert centiseconds to milliseconds (multiply by 10)
  const milliseconds = parseInt(centiseconds) * 10;
  
  return `${hours}:${minutes}:${seconds},${milliseconds.toString().padStart(3, '0')}`;
}

/**
 * Remove ASS formatting tags from text
 */
function removeAssFormatting(text: string) {
  // Remove style overrides like {\\an8} or {\\b1}
  let cleaned = text.replace(/\{\\[^}]*\}/g, '');
  
  // Remove any remaining braces
  cleaned = cleaned.replace(/[{}]/g, '');
  
  // Replace ASS line breaks with spaces
  cleaned = cleaned.replace(/\\N/g, ' ').replace(/\\n/g, ' ');
  
  return cleaned.trim();
}

/**
 * Remove formatting tags like {\an8} from subtitle text
 */
function removeFormattingTags(text: string) {
  // Remove position tags like {\an8}
  let cleaned = text.replace(/\{\\an\d\}/g, '');
  
  // Remove other common formatting tags
  cleaned = cleaned.replace(/\{[^}]*\}/g, '');
  
  return cleaned.trim();
}

/**
 * Wrapper function to fetch and parse subtitles
 */
export async function fetchSubAsJson(url: string, format: 'srt' | 'vtt' | 'ass' = 'srt') {
  const subtitleText = await fetch(url).then(res => res.text());
  return parseSubtitlesToJson(subtitleText, format);
}