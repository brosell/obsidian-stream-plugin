// lifted form Obsidian Copilot plugin
import { requestUrl } from "obsidian";

export async function safeFetch(url: string, options: RequestInit): Promise<Response> {
  // Necessary to remove 'content-length' in order to make headers compatible with requestUrl()
  delete (options.headers as Record<string, string>)["content-length"];

  if (typeof options.body === "string") {
    const newBody = JSON.parse(options.body ?? {});
    // frequency_penalty: default 0, but perplexity.ai requires 1 by default.
    // so, delete this argument for now
    delete newBody["frequency_penalty"];
    options.body = JSON.stringify(newBody);
  }

  const method = options.method?.toLowerCase() || "post";
  const methodsWithBody = ["post", "put", "patch"];
  const response = await requestUrl({
    url,
    contentType: "application/json",
    headers: options.headers as Record<string, string>,
    method: method,
    ...(methodsWithBody.includes(method) && { body: options.body?.toString() }),
  });

  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    statusText: response.status.toString(),
    headers: new Headers(response.headers),
    url: url,
    type: "basic",
    redirected: false,
    bytes: () => Promise.resolve(new Uint8Array(0)),
    body: createReadableStreamFromString(response.text),
    bodyUsed: true,
    json: () => response.json,
    text: async () => response.text,
    clone: () => {
      throw new Error("not implemented");
    },
    arrayBuffer: () => {
      throw new Error("not implemented");
    },
    blob: () => {
      throw new Error("not implemented");
    },
    formData: () => {
      throw new Error("not implemented");
    },
  };
}

function createReadableStreamFromString(input: string) {
  return new ReadableStream({
    start(controller) {
      // Convert the input string to a Uint8Array
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(input);

      // Push the data to the stream
      controller.enqueue(uint8Array);

      // Close the stream
      controller.close();
    },
  });
}