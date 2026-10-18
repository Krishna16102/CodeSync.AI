import "./GenerationProgress.css";

function GenerationProgress({
    visible,
    completed = false
}) {

    if (!visible) {
        return null;
    }

    return (
        <div className="generation-progress">

            <div className="generation-progress-title">
                <span className="generation-spark">✦</span>

                <span>
                    {completed
                        ? "Generation complete"
                        : "Wait, let me think..."}
                </span>
            </div>


            <div className="generation-step">

                <span className="generation-step-icon">
                    ✓
                </span>

                <span>
                    Understanding your request
                </span>

            </div>


            <div className="generation-step">

                <span className="generation-step-icon">
                    ✓
                </span>

                <span>
                    Planning the changes
                </span>

            </div>


            <div className="generation-step active">

                <span className="generation-spinner" />

                <span>
                    {completed
                        ? "Project generated"
                        : "Generating code..."}
                </span>

            </div>

        </div>
    );
}

export default GenerationProgress;