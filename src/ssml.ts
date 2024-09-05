/**
 * SSML (Speech Synthesis Markup Language) is a subset of XML specifically
 * designed for controlling synthesis. You can see examples of how the SSML
 * should be parsed in `ssml.test.ts`.
 *
 * DO NOT USE CHATGPT, COPILOT, OR ANY AI CODING ASSISTANTS.
 * Conventional auto-complete and Intellisense are allowed.
 *
 * DO NOT USE ANY PRE-EXISTING XML PARSERS FOR THIS TASK.
 * You may use online references to understand the SSML specification, but DO NOT read
 * online references for implementing an XML/SSML parser.
 */

/** Parses SSML to a SSMLNode, throwing on invalid SSML */

export function parseSSML(ssml: string): SSMLNode {
  let i = 0;

  function parseNode(): SSMLNode {
    if (ssml[i] === '<') {
      i++;
      if (ssml[i] === '/') {
        // Closing tag, return null to indicate the end of children parsing
        while (ssml[i] !== '>') i++;
        i++;
        return null;
      }
      
      const tagName = parseTagName();
      const attributes = parseAttributes();
      const children: SSMLNode[] = [];

      while (ssml[i] !== '<' || (ssml[i] === '<' && ssml[i + 1] === '/')) {
        const child = parseNode();
        if (child) {
          children.push(child);
        }
      }

      // Skip closing tag
      while (ssml[i] !== '>') i++;
      i++;

      return {
        name: tagName,
        attributes,
        children,
      };
    } else {
      return parseText();
    }
  }

  function parseTagName(): string {
    let tagName = '';
    while (ssml[i] !== ' ' && ssml[i] !== '>') {
      tagName += ssml[i++];
    }
    return tagName;
  }

  function parseAttributes(): SSMLAttribute[] {
    const attributes: SSMLAttribute[] = [];
    while (ssml[i] !== '>' && ssml[i] !== '/') {
      while (ssml[i] === ' ') i++;
      const name = parseAttributeName();
      let value = '';
      if (ssml[i] === '=') {
        i++; // skip '='
        const quote = ssml[i++];
        while (ssml[i] !== quote) {
          value += ssml[i++];
        }
        i++; // skip closing quote
      }
      attributes.push({ name, value });
    }
    if (ssml[i] === '/') {
      i++; // skip '/'
      i++; // skip '>'
    }
    return attributes;
  }

  function parseAttributeName(): string {
    let name = '';
    while (ssml[i] !== '=' && ssml[i] !== ' ' && ssml[i] !== '>') {
      name += ssml[i++];
    }
    return name;
  }

  function parseText(): SSMLText {
    let text = '';
    while (ssml[i] !== '<') {
      text += ssml[i++];
    }
    return unescapeXMLChars(text);
  }

  return parseNode();
}
 
/** Recursively converts SSML node to string and unescapes XML chars */
export function ssmlNodeToText(node: SSMLNode): string {
  if (typeof node === 'string') {
    return escapeXMLChars(node);
  }

  const tag = node as SSMLTag;
  const attributes = tag.attributes.map(attr => `${attr.name}="${escapeXMLChars(attr.value)}"`).join(' ');
  const children = tag.children.map(ssmlNodeToText).join('');

  return `<${tag.name}${attributes ? ' ' + attributes : ''}>${children}</${tag.name}>`;
}

function escapeXMLChars(text: string): string {
  return text.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&apos;');
}

// Already done for you
const unescapeXMLChars = (text: string) =>
  text.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&')

type SSMLNode = SSMLTag | SSMLText
type SSMLTag = {
  name: string
  attributes: SSMLAttribute[]
  children: SSMLNode[]
}
type SSMLText = string
type SSMLAttribute = { name: string; value: string }
