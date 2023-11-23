import * as fs from 'fs';

type JSONObject = { [key: string]: any };

// Function to save JSON to readable markdown
function saveJSONToMarkdown(json: JSONObject, filepath: string): void {
  const markdown = convertJSONToMarkdown(json);
  fs.writeFileSync(filepath, markdown);
}

// Function to read JSON from readable markdown
function readJSONFromMarkdown(filepath: string): JSONObject {
  const markdown = fs.readFileSync(filepath, 'utf-8');
  return convertMarkdownToJSON(markdown);
}

// Helper function to convert JSON to markdown
function convertJSONToMarkdown(json: JSONObject): string {
  let markdown = '';

  for (const key in json) {
    if (json.hasOwnProperty(key)) {
      const value = json[key];
      markdown += `## ${key}\n\n`;
      markdown += convertValueToMarkdown(value);
      markdown += '\n\n';
    }
  }

  return markdown;
}

// Helper function to convert a value to markdown
function convertValueToMarkdown(value: any): string {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return convertJSONToMarkdown(value);
  } else if (Array.isArray(value)) {
    return convertArrayToMarkdown(value);
  } else {
    return `${value}`;
  }
}

// Helper function to convert an array to markdown
function convertArrayToMarkdown(array: any[]): string {
  let markdown = '';

  for (let i = 0; i < array.length; i++) {
    markdown += `- ${convertValueToMarkdown(array[i])}\n`;
  }

  return markdown;
}

// Helper function to convert markdown to JSON
function convertMarkdownToJSON(markdown: string): JSONObject {
  const lines = markdown.split('\n');
  const json: JSONObject = {};
  let currentKey = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('##')) {
      currentKey = line.substring(2).trim();
    } else if (currentKey !== '' && line.startsWith('-')) {
      if (!json[currentKey]) {
        json[currentKey] = [];
      }

      const value = line.substring(1).trim();
      json[currentKey].push(value);
    }
  }

  return json;
}