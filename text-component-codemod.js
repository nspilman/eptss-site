#!/usr/bin/env node

/**
 * Codemod to migrate raw HTML text elements to the Text component from @eptss/ui
 *
 * Usage: node text-component-codemod.js <file-or-directory>
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TEXT_IMPORT = 'import { Text } from "@eptss/ui";';

// Mapping of Tailwind classes to Text component props
const SIZE_MAP = {
  'text-xs': 'xs',
  'text-sm': 'sm',
  'text-base': 'base',
  'text-lg': 'lg',
  'text-xl': 'xl',
};

const WEIGHT_MAP = {
  'font-normal': 'normal',
  'font-medium': 'medium',
  'font-semibold': 'semibold',
  'font-bold': 'bold',
};

const COLOR_MAP = {
  'text-foreground': 'primary',
  'text-primary': 'primary',
  'text-secondary': 'secondary',
  'text-tertiary': 'tertiary',
  'text-muted-foreground': 'muted',
  'text-muted': 'muted',
  'text-accent': 'accent',
  'text-destructive': 'destructive',
};

function hasTextImport(content) {
  return content.includes('@eptss/ui') || content.includes('{ Text }');
}

function addTextImport(content) {
  // Find the last import statement
  const importRegex = /^import\s+.*?;?\s*$/gm;
  const imports = [...content.matchAll(importRegex)];

  if (imports.length === 0) {
    // No imports found, add at the top after any "use client" or "use server"
    const useClientMatch = content.match(/^["']use (client|server)["'];?\s*/m);
    if (useClientMatch) {
      const insertPos = useClientMatch.index + useClientMatch[0].length;
      return content.slice(0, insertPos) + '\n' + TEXT_IMPORT + '\n' + content.slice(insertPos);
    }
    return TEXT_IMPORT + '\n\n' + content;
  }

  // Add after the last import
  const lastImport = imports[imports.length - 1];
  const insertPos = lastImport.index + lastImport[0].length;
  return content.slice(0, insertPos) + '\n' + TEXT_IMPORT + content.slice(insertPos);
}

function extractClassNameProps(classNameStr) {
  if (!classNameStr) return { textProps: {}, remainingClasses: [] };

  const classes = classNameStr.split(/\s+/).filter(c => c);
  const textProps = {};
  const remainingClasses = [];

  for (const cls of classes) {
    if (SIZE_MAP[cls]) {
      textProps.size = SIZE_MAP[cls];
    } else if (WEIGHT_MAP[cls]) {
      textProps.weight = WEIGHT_MAP[cls];
    } else if (COLOR_MAP[cls]) {
      textProps.color = COLOR_MAP[cls];
    } else {
      remainingClasses.push(cls);
    }
  }

  return { textProps, remainingClasses };
}

function buildTextProps(element, textProps, remainingClasses) {
  const props = [];

  // Add 'as' prop for non-p elements
  if (element !== 'p') {
    props.push(`as="${element}"`);
  }

  // Add extracted text props
  if (textProps.size) props.push(`size="${textProps.size}"`);
  if (textProps.color) props.push(`color="${textProps.color}"`);
  if (textProps.weight) props.push(`weight="${textProps.weight}"`);

  // Add remaining className if any
  if (remainingClasses.length > 0) {
    props.push(`className="${remainingClasses.join(' ')}"`);
  }

  return props.join(' ');
}

function transformElement(content) {
  let transformed = content;

  // Pattern 1: Simple <p> and <span> with className
  // Matches: <p className="text-sm text-secondary">content</p>
  const simplePattern = /<(p|span)(\s+className="([^"]*)")?\s*>((?:(?!<\/\1>).)*)<\/\1>/gs;

  transformed = transformed.replace(simplePattern, (match, element, classNameAttr, className, innerContent) => {
    // Skip if it contains nested JSX elements (basic check)
    if (/<[A-Z]/.test(innerContent) || /<[a-z]+[^>]*>/.test(innerContent)) {
      return match;
    }

    // Skip very long content (likely not simple text)
    if (innerContent.length > 500) {
      return match;
    }

    const { textProps, remainingClasses } = extractClassNameProps(className);

    // Only transform if we extracted some text-related props or it's a simple p/span
    if (Object.keys(textProps).length === 0 && element === 'p' && !className) {
      // Simple <p> with no classes -> <Text>
      return `<Text>${innerContent}</Text>`;
    }

    if (Object.keys(textProps).length > 0 || (element === 'span' && className)) {
      const props = buildTextProps(element, textProps, remainingClasses);
      return `<Text ${props}>${innerContent}</Text>`;
    }

    return match;
  });

  return transformed;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Skip files that already import Text or are test files
  if (hasTextImport(content) || filePath.includes('.test.') || filePath.includes('.spec.')) {
    console.log(`⏭️  Skipping ${filePath} (already has import or is test file)`);
    return;
  }

  let transformed = transformElement(content);

  // Check if any transformations were made
  if (transformed === content) {
    console.log(`⏭️  No changes needed for ${filePath}`);
    return;
  }

  // Add import if transformations were made
  if (!hasTextImport(transformed)) {
    transformed = addTextImport(transformed);
  }

  // Write back to file
  fs.writeFileSync(filePath, transformed, 'utf-8');
  console.log(`✅ Transformed ${filePath}`);
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) {
        continue;
      }
      processDirectory(fullPath);
    } else if (entry.isFile()) {
      // Only process .tsx and .jsx files
      if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
        processFile(fullPath);
      }
    }
  }
}

// Main execution
const target = process.argv[2];

if (!target) {
  console.error('Usage: node text-component-codemod.js <file-or-directory>');
  process.exit(1);
}

const targetPath = path.resolve(target);

if (!fs.existsSync(targetPath)) {
  console.error(`Error: ${targetPath} does not exist`);
  process.exit(1);
}

const stat = fs.statSync(targetPath);

console.log('🚀 Starting Text component migration codemod...\n');

if (stat.isDirectory()) {
  processDirectory(targetPath);
} else if (stat.isFile()) {
  processFile(targetPath);
}

console.log('\n✨ Codemod complete!');
console.log('\n⚠️  Please review the changes and manually fix any edge cases.');
console.log('💡 Tip: Run your build/lint to catch any issues.');
