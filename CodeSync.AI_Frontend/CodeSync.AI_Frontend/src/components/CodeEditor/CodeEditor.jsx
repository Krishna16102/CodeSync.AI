import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

import { getFileContent } from "../../services/fileService";

import "./CodeEditor.css";

function CodeEditor({
    projectId,
    selectedFile,
    onClose
}) {

    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        if (!projectId || !selectedFile) {
            return;
        }

        loadFile();

    }, [projectId, selectedFile]);

    async function loadFile() {

        try {

            setLoading(true);

            const data = await getFileContent(
                projectId,
                selectedFile
            );

            setContent(data.content || "");

        } catch (error) {

            console.error(
                "Failed to load file:",
                error
            );

        } finally {

            setLoading(false);

        }
    }

    function getLanguage(fileName) {

        const extension =
            fileName.split(".").pop();

        const languages = {
            js: "javascript",
            jsx: "javascript",
            ts: "typescript",
            tsx: "typescript",
            java: "java",
            py: "python",
            html: "html",
            css: "css",
            json: "json",
            sql: "sql",
            xml: "xml",
            md: "markdown"
        };

        return languages[extension] || "plaintext";
    }

    if (!selectedFile) {
        return null;
    }

    return (
        <div className="code-editor">

            <div className="code-editor-header">

                <span className="code-editor-file">
                    📄 {selectedFile}
                </span>

                <button
                    className="code-editor-close"
                    onClick={onClose}
                >
                    ×
                </button>

            </div>

            <div className="code-editor-body">

                {loading ? (

                    <div className="editor-loading">
                        Loading...
                    </div>

                ) : (

                    <Editor
                        height="100%"
                        language={getLanguage(selectedFile)}
                        value={content}
                        onChange={(value) =>
                            setContent(value || "")
                        }
                        theme="vs-dark"
                        options={{
                            minimap: {
                                enabled: false
                            },
                            fontSize: 14,
                            wordWrap: "on",
                            automaticLayout: true,
                            padding: {
                                top: 12
                            }
                        }}
                    />

                )}

            </div>

        </div>
    );
}

export default CodeEditor;