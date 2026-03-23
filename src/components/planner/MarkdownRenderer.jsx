export default function MarkdownRenderer({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let key = 0;

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-1 text-warm-700 mb-4 ml-2">
          {listItems.map((item, i) => (
            <li key={i}>{formatInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  }

  function formatInline(str) {
    // Bold: **text**
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-warm-800">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headings
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={key++} className="text-base font-semibold text-warm-800 mt-5 mb-2">
          {line.slice(4)}
        </h4>
      );
    } else if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-lg font-semibold text-warm-800 mt-6 mb-2">
          {line.slice(3)}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-xl font-bold text-warm-900 mt-6 mb-3">
          {line.slice(2)}
        </h2>
      );
    }
    // List items
    else if (line.match(/^\s*[-*•]\s+/)) {
      const content = line.replace(/^\s*[-*•]\s+/, '');
      listItems.push(content);
    }
    // Numbered list items
    else if (line.match(/^\s*\d+[.)]\s+/)) {
      const content = line.replace(/^\s*\d+[.)]\s+/, '');
      listItems.push(content);
    }
    // Empty lines
    else if (line.trim() === '') {
      flushList();
    }
    // Regular paragraphs
    else {
      flushList();
      elements.push(
        <p key={key++} className="text-warm-700 leading-relaxed mb-3">
          {formatInline(line)}
        </p>
      );
    }
  }

  flushList();

  return <div className="prose-warm">{elements}</div>;
}
