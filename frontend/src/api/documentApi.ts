export async function extractTextFromFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/extract-text", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    let message = "Failed to extract text.";
    try {
      const data = await response.json();
      if (data?.error) {
        message = data.error;
      }
    } catch {
      // ignore JSON parse errors and use default message
    }
    throw new Error(message);
  }

  const data = await response.json();
  return data.text || "";
}

