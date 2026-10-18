import { useEffect, useState } from "react";

import {
  getProjectFiles,
  getProjectFileContents,
} from "../../services/fileService";

import { useToast } from "../../context/ToastContext";

import "./HtmlPreview.css";

function HtmlPreview({ projectId, htmlPath, htmlContent, onClose }) {
  const { error: showError } = useToast();

  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // build preview
  useEffect(() => {
    if (!projectId || !htmlPath) {
      setError("Preview information is missing.");
      setLoading(false);
      return;
    }

    buildPreview();
  }, [projectId, htmlPath, htmlContent]);

  async function buildPreview() {
    try {
      setLoading(true);
      setError("");

      // get project file tree
      const files = await getProjectFiles(projectId);

      // get actual file contents
      const contents = await getProjectFileContents(projectId, files);

      // use current html content
      contents[htmlPath] = htmlContent || "";

      // build html
      const finalHtml = buildHtmlDocument(htmlPath, contents);

      setPreviewHtml(finalHtml);
    } catch (error) {
      console.error("Failed to build HTML preview:", error);

      setError("Unable to load preview.");
      showError("Unable to load HTML preview.");
    } finally {
      setLoading(false);
    }
  }

  // loading
  if (loading) {
    return (
      <div className="html-preview">
        <div className="html-preview-header">
          <span>Preview</span>
          <button onClick={onClose} className="html-preview-close">
            ×
          </button>
        </div>

        <div className="html-preview-loading">Loading preview...</div>
      </div>
    );
  }

  // error
  if (error) {
    return (
      <div className="html-preview">
        <div className="html-preview-header">
          <span>Preview</span>
          <button onClick={onClose} className="html-preview-close">
            ×
          </button>
        </div>

        <div className="html-preview-error">{error}</div>
      </div>
    );
  }

  // preview
  return (
    <div className="html-preview">
      <div className="html-preview-header">
        <div className="html-preview-title">
          <span>▶</span>
          <span>Preview</span>
        </div>

        <button
          onClick={onClose}
          className="html-preview-close"
          title="Close preview"
        >
          ×
        </button>
      </div>

      <div className="html-preview-body">
        <iframe
          title="HTML Preview"
          srcDoc={previewHtml}
          className="html-preview-iframe"
          sandbox="allow-scripts allow-forms allow-modals"
        />
      </div>
    </div>
  );
}

// build html document
function buildHtmlDocument(htmlPath, files) {
  let html = files[htmlPath] || "";

  // empty html
  if (!html.trim()) {
    html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
</body>
</html>
`;
  }

  // get html directory
  const htmlDirectory = getDirectory(htmlPath);

  // keep this variable because the html directory is part of the preview structure
  void htmlDirectory;

  // inline css
  const cssFiles = Object.entries(files).filter(([path]) =>
    path.toLowerCase().endsWith(".css")
  );

  let css = "";

  cssFiles.forEach(([path, content]) => {
    css += `
/* ${path} */
${content}
`;
  });

  // inline javascript
  const jsFiles = Object.entries(files).filter(([path]) => {
    const lower = path.toLowerCase();
    return (
      lower.endsWith(".js") && !lower.endsWith(".jsx") && !lower.endsWith(".tsx")
    );
  });

  let javascript = "";

  jsFiles.forEach(([path, content]) => {
    javascript += `
/* ${path} */
${content}
`;
  });

  // remove external css
  html = html.replace(
    /<link[^>]+href=["'][^"']+\.css[^"']*["'][^>]*>/gi,
    ""
  );

  // remove external js
  html = html.replace(
    /<script[^>]+src=["'][^"']+["'][^>]*><\/script>/gi,
    ""
  );

  // responsive base css
  const baseCss = `
html,
body {
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: 100%;
}

*,
*::before,
*::after {
    box-sizing: border-box;
}

img {
    max-width: 100%;
    height: auto;
}
`;

  css = baseCss + css;

  // add css
  const styleTag = `
<style>
${css}
</style>
`;

  if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${styleTag}</head>`);
  } else {
    html = styleTag + html;
  }

  // add javascript
  if (javascript.trim()) {
    const scriptTag = `
<script>
${javascript}
</script>
`;

    if (/<\/body>/i.test(html)) {
      html = html.replace(/<\/body>/i, `${scriptTag}</body>`);
    } else {
      html += scriptTag;
    }
  }

  return html;
}

// get directory
function getDirectory(path) {
  const index = path.lastIndexOf("/");
  if (index === -1) return "";
  return path.substring(0, index);
}

export default HtmlPreview;