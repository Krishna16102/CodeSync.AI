import "./ChatMessage.css";

function ChatMessage({ role, content }) {

    const isUser = role === "user";

    return (

        <div className={`chat-message ${isUser ? "user-message" : "ai-message"}`}>

            <div className="message-avatar">

                {isUser ? "👤" : "AI"}

            </div>

            <div className="message-content">

                <div className="message-role">

                    {isUser ? "You" : "CodeSync"}

                </div>

                <div className="message-text">

                    {content}

                </div>

            </div>

        </div>

    );

}

export default ChatMessage;