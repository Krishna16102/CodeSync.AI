import api from "../api/axios";


//   GET CHAT MESSAGES

export async function getChatMessages(projectId) {
  const response = await api.get(`/projects/${projectId}/chat/messages`);
  return response.data;
}


//   STREAM CHAT MESSAGE

export async function streamChatMessage(projectId, prompt, onToken, onDone, signal) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Authentication token not found.");
  }

  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Prompt cannot be empty.");
  }

  const cleanPrompt = prompt.trim();

  const response = await fetch(
    `http://localhost:8080/api/projects/${projectId}/chat/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt: cleanPrompt }),
      // AbortController uses this to cancel the streaming request
      signal,
    }
  );

  if (!response.ok) {
    const errorMessage = await response.text();

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    if (response.status === 403) {
      throw new Error("You don't have permission to use AI in this project.");
    }

    if (response.status === 429) {
      throw new Error("AI request limit reached. Please try again later.");
    }

    throw new Error(`Chat request failed: ${response.status} ${errorMessage}`);
  }

  if (!response.body) {
    throw new Error("Streaming response body is not available.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";
  let streamCompleted = false;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        if (!event.trim()) continue;

        const lines = event.split("\n");
        let eventName = "message";
        let data = "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventName = line.substring(6).trim();
          }
          if (line.startsWith("data:")) {
            const value = line.substring(5).trim();
            if (data) data += "\n";
            data += value;
          }
        }

        if (eventName === "token" && onToken) {
          onToken(data);
        }

        if (eventName === "done") {
          let doneData;
          try {
            doneData = JSON.parse(data);
          } catch {
            doneData = data;
          }
          streamCompleted = true;
          if (onDone) onDone(doneData);
        }
      }

      if (streamCompleted) break;
    }
  } catch (error) {
    // AbortController throws AbortError when the user clicks Stop —
    // that's expected, not an application error.
    if (error?.name === "AbortError") {
      console.log("Chat generation stopped by user.");
      return;
    }
    throw error;
  } finally {
    try {
      await reader.cancel();
    } catch {
      // stream already closed
    }
  }
}