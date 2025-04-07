import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Intentar analizar como JSON primero
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        if (errorData.message) {
          throw new Error(`${res.status}: ${errorData.message}`);
        }
      }
      
      // Si no es JSON o no tiene message, usar el texto
      const text = await res.text();
      throw new Error(`${res.status}: ${text || res.statusText}`);
    } catch (jsonError) {
      if (jsonError instanceof Error) {
        throw jsonError;
      }
      
      // Fallback si hay un error procesando la respuesta
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Convert queryKey to a URL string
    let url: string;
    
    if (typeof queryKey[0] === 'string' && queryKey[0].startsWith('/api/')) {
      // First element is already the base URL
      if (queryKey.length > 1) {
        // If we have additional segments, append them properly
        const baseUrl = queryKey[0] as string;
        const additionalSegments = queryKey.slice(1)
          .filter(segment => segment !== undefined && segment !== null)
          .map(segment => encodeURIComponent(String(segment)));
        
        // Join with proper separators
        url = additionalSegments.length > 0 
          ? `${baseUrl}/${additionalSegments.join('/')}` 
          : baseUrl;
      } else {
        // Just use the base URL
        url = queryKey[0] as string;
      }
    } else if (Array.isArray(queryKey)) {
      // Convert array path segments to URL string
      url = queryKey
        .filter(segment => segment !== undefined && segment !== null)
        .map(segment => encodeURIComponent(String(segment)))
        .join('/');
      
      // Ensure we have a leading slash
      if (!url.startsWith('/')) {
        url = '/' + url;
      }
    } else {
      // Just use first element as string
      url = String(queryKey[0]);
    }
    
    console.log('Requesting URL:', url);
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minuto de tiempo de vida - para que los datos se refresquen periódicamente
      retry: 1, // Intentar una vez más en caso de fallos
    },
    mutations: {
      retry: false,
    },
  },
});
