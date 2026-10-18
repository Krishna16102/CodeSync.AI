import "./FileChangeCard.css";

function FileChangeCard({
    files = [],
    onFileClick
}) {

    if (!files || files.length === 0) {
        return null;
    }


    return (

        <div className="file-change-card">

            <div className="file-change-header">

                <span className="file-change-icon">
                    ✨
                </span>

                <span>
                    {files.length}{" "}
                    {files.length === 1
                        ? "file"
                        : "files"}{" "}
                    changed
                </span>

            </div>


            <div className="file-change-list">

                {files.map((file, index) => {

                    

                    const path =
                        typeof file === "string"
                            ? file
                            : file?.path;


                    if (!path) {
                        return null;
                    }


                    return (

                        <button
                            key={`${path}-${index}`}
                            className="file-change-item"
                            onClick={() =>
                                onFileClick &&
                                onFileClick(path)
                            }
                        >

                            <span className="file-change-file-icon">
                                📄
                            </span>

                            <span className="file-change-path">
                                {path}
                            </span>

                            <span className="file-change-arrow">
                                →
                            </span>

                        </button>

                    );

                })}

            </div>

        </div>

    );
}

export default FileChangeCard;