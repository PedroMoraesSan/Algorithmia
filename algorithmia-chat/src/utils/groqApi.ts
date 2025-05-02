
// Real Groq API implementation
// API Key: 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

export const generateAlgorithm = async (
  prompt: string,
  model: string = "llama3-8b-8192",
  format: "descriptive" | "pseudocode" | "flowchart" = "descriptive",
  language: string = "english" // Added language parameter with default
): Promise<string> => {
  console.log(`Generating ${format} using ${model} for: ${prompt} in ${language}`);
  
  // Prepare system prompt based on format
  let systemPrompt = "";
  
  switch (format) {
    case "descriptive":
      systemPrompt = `You are an algorithm expert. Provide a detailed, step-by-step explanation of how to solve the following problem. Be clear, concise, and educational. Respond in ${language} language.`;
      break;
    case "pseudocode":
      systemPrompt = `You are an algorithm expert. Generate clean, readable pseudocode that solves the following problem. Use standard conventions and include comments to explain key steps. Respond in ${language} language.`;
      break;
    case "flowchart":
      systemPrompt = `You are an algorithm expert. Create a clear, step-by-step flowchart for solving the following problem. 

Your response should be structured as a numbered list of distinct steps, with each step representing a single node in the flowchart.

For example:
1. Start: Initialize variables
2. Check if condition X is true
3. If true, perform action A
4. If false, perform action B
5. Process the results
6. End: Return the final output

Each step should be concise (under 50 characters if possible) and represent a single action or decision. 
Use clear, simple language and avoid complex sentences. 
Start with an initialization step and end with a conclusion step.
Number each step and separate them clearly.
Respond in ${language} language.`;
      break;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API error:", errorData);
      return `Error: ${errorData.error?.message || "Failed to generate algorithm"}`;
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`;
  }
};
