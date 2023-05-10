import { Client } from "@cloudflare/pg";
import html from "./index.html";

export interface Env {
  DB: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/favicon.ico")
      return new Response(null, { status: 404 });

    if (url.pathname === "/") {
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const params = url.searchParams;

    var client = new Client(env.DB);
    await client.connect();
    const result = await client.query({
      text: "SELECT * from customers",
      // values: [params.get("filter")],
    });
    console.log(JSON.stringify(result.rows));
    const resp = Response.json(result.rows);
    // Clean up the client, ensuring we don't kill the worker before that is completed.
    ctx.waitUntil(client.end());
    return resp;
  },
};
