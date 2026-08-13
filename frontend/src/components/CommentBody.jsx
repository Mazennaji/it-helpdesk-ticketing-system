function renderInline(text, keyPrefix) {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return tokens.map((tok, i) => {
    if (tok.startsWith("**") && tok.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-b-${i}`} className="font-semibold text-white">
          {tok.slice(2, -2)}
        </strong>
      );
    }
    if (tok.startsWith("`") && tok.endsWith("`")) {
      return (
        <code
          key={`${keyPrefix}-c-${i}`}
          className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[0.85em] font-mono text-blue-200"
        >
          {tok.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${keyPrefix}-t-${i}`}>{tok}</span>;
  });
}

export default function CommentBody({ text, className = "" }) {
  if (!text) return null;

  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let list = null;
  const flush = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();
    const ordered = line.match(/^(\d+)[.)]\s+(.*)$/);
    const bullet = line.match(/^[-*•]\s+(.*)$/);

    if (ordered) {
      if (!list || list.type !== "ol") {
        flush();
        list = { type: "ol", items: [], key: `ol-${i}` };
      }
      list.items.push(ordered[2]);
    } else if (bullet) {
      if (!list || list.type !== "ul") {
        flush();
        list = { type: "ul", items: [], key: `ul-${i}` };
      }
      list.items.push(bullet[1]);
    } else if (line === "") {
      flush();
    } else {
      flush();
      blocks.push({ type: "p", text: line, key: `p-${i}` });
    }
  });
  flush();

  return (
    <div className={`text-sm text-slate-400 leading-relaxed space-y-2 ${className}`}>
      {blocks.map((b) => {
        if (b.type === "p") {
          return <p key={b.key}>{renderInline(b.text, b.key)}</p>;
        }
        if (b.type === "ol") {
          return (
            <ol key={b.key} className="list-decimal pl-5 space-y-1 marker:text-slate-500 marker:font-medium">
              {b.items.map((it, idx) => (
                <li key={idx} className="pl-1">{renderInline(it, `${b.key}-${idx}`)}</li>
              ))}
            </ol>
          );
        }
        return (
          <ul key={b.key} className="list-disc pl-5 space-y-1 marker:text-slate-500">
            {b.items.map((it, idx) => (
              <li key={idx} className="pl-1">{renderInline(it, `${b.key}-${idx}`)}</li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}