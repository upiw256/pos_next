export class NextResponse {
  static json(body: any, init?: any) {
    return new Response(JSON.stringify(body), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }
    });
  }
  static redirect(url: string | URL, init?: number | ResponseInit) {
    return new Response(null, {
      status: typeof init === 'number' ? init : init?.status || 307,
      headers: { Location: url.toString() }
    });
  }
  static next() {
    return new Response();
  }
}
