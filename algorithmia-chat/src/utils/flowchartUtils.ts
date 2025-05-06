
/**
 * Gera código Mermaid (simples), alinhado à documentação oficial Mermaid:
 * https://mermaid-js.github.io/mermaid/latest/flowchart.html
 */
export function generateMermaidCode(flowchartData: string): string {
  const steps = flowchartData
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => line.replace(/^\d+\.\s*/, ''));
  
  if (steps.length < 2) {
    return 'flowchart TD\nA[Start] --> B[End]';
  }
  const nodeIds = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const safeSteps = steps.map((txt, idx) =>
    nodeIds[idx] + '[' + escapeMermaidLabel(txt) + ']');
  let mermaid = 'flowchart TD\n';
  safeSteps.forEach(node => {
    mermaid += node + '\n';
  });
  for (let i = 0; i < safeSteps.length - 1; i++) {
    const from = nodeIds[i];
    const to = nodeIds[i + 1];
    mermaid += `${from} --> ${to}\n`;
  }
  return mermaid.trim();
}

function escapeMermaidLabel(label: string) {
  return label.replace(/([\[\]\|\{\}])/g, '\\$1').replace(/"/g, '\\"');
}

export function parseFlowchartResponse(flowchartData: string) {
  const lines = flowchartData.split('\n').filter(line => line.trim());
  const nodes = lines.map((line, idx) => {
    const match = line.match(/^\d+\.\s*(.*)/);
    const label = match ? match[1].trim() : line.trim();
    let type: "input" | "default" | "output" = "default";
    if (idx === 0) type = "input";
    if (idx === lines.length - 1) type = "output";
    return {
      id: (idx + 1).toString(),
      type,
      data: { label },
      position: { x: 250, y: 120 * idx },
      style: {},
    };
  });
  const edges = [];
  for (let i = 0; i < lines.length - 1; i++) {
    edges.push({
      id: `e${i + 1}-${i + 2}`,
      source: (i + 1).toString(),
      target: (i + 2).toString(),
      type: "smoothstep",
    });
  }
  return { nodes, edges };
}

/**
 * Chama a IA Groq (modelo Llama) para gerar código Mermaid ESTILIZADO.
 * Sempre retorna somente o bloco de código mermaid completo, incluindo classDef/style.
 * Atenção: resposta APENAS código!
 */
export async function generateMermaidWithStyleFromGroq(userInstructions: string): Promise<string> {
  const key = "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";
  const apiUrl = "https://api.groq.com/openai/v1/chat/completions";
  const systemPrompt = `Você é um especialista em diagramas e Mermaid.
Crie SOMENTE o código Mermaid necessário para o fluxograma abaixo, SEM explicações extras.
ATENÇÃO: O resultado deve incluir personalização visual seguindo os recursos de classe/estilo do Mermaid (cores, formas, classes, estilos de aresta etc). 
A resposta deve ser SOMENTE o código mermaid, com diagrama, customizações de nodes/edges via classDef/style/links, do início ao fim — nada mais.

Exemplo de estrutura esperada:
flowchart TD
  A[Início]:::mainStart
  B[Conferir ingredientes]:::inner
  C{Tem café?}:::diamond
  A --> B
  B --> C
classDef mainStart fill:#febb00,stroke:#333,stroke-width:3px
classDef diamond fill:#cfc,stroke:#393,stroke-width:2px,font-style:italic
classDef inner fill:#eef,stroke:#36c,stroke-width:2px

Agora, gere o fluxograma solicitado pelo usuário abaixo e retorne SÓ o código (em português), incluindo definição de classes, estilização visual e diagrama.`;

  const payload = {
    model: "llama3-8b-8192",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userInstructions }
    ],
    temperature: 0.2,
    max_tokens: 1200,
  };
  const resp = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    throw new Error(`Erro Groq: ${resp.status} - ${resp.statusText}`);
  }
  const data = await resp.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error(`Groq retornou resposta inesperada`);
  }
  return data.choices[0].message.content.trim();
}
