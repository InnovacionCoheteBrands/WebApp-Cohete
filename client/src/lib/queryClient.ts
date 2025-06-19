import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Clonar la respuesta para poder leerla múltiples veces si es necesario
      const resClone = res.clone();
      const contentType = res.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await res.json();
          if (errorData.message) {
            throw new Error(`${res.status}: ${errorData.message}`);
          }
        } catch {
          // Si falla el JSON, usar el clon para obtener texto
          const text = await resClone.text();
          throw new Error(`${res.status}: ${text || res.statusText}`);
        }
      } else {
        const text = await res.text();
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: any
): Promise<Response> {
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  console.log(`Requesting URL:`, url);
  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  return response;
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

    try {
      await throwIfResNotOk(res);
      const data = await res.json();
      console.log('Successful response data:', url, data);
      return data;
    } catch (error) {
      console.error('Error in query execution:', url, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey, signal }) => {
        const url = queryKey[0] as string;
        console.log(`Fetching: ${url}`);
        try {
          const response = await fetch(url, {
            signal,
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log(`Successful response data:`, url, data);
          return data;
        } catch (error) {
          console.log(`Error in query execution:`, url, error);
          throw error;
        }
      },
      retry: (failureCount, error: any) => {
        console.log(`Query failed (attempt ${failureCount}):`, error?.message || error);
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});