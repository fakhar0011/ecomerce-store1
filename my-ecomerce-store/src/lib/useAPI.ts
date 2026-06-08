// 'use client';

// import { useCallback, useState } from 'react';
// import { apiClient } from '@/lib/enhanced-api-client';
// import type { APIClientError } from '@/lib/enhanced-api-client';
// import { APIResponse } from '@/lib/api-types';

// interface UseAPIOptions {
//   onSuccess?: (data: any) => void;
//   onError?: (error: APIClientError) => void;
// }

// export const useAPI = (options?: UseAPIOptions) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const call = useCallback(
//     async <T = any,>(
//       method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
//       endpoint: string,
//       body?: any
//     ): Promise<APIResponse<T> | null> => {
//       setLoading(true);
//       setError(null);

//       try {
//         let response: APIResponse<T>;

//         switch (method) {
//           case 'GET':
//             response = await apiClient.get<T>(endpoint);
//             break;
//           case 'POST':
//             response = await apiClient.post<T>(endpoint, body);
//             break;
//           case 'PUT':
//             response = await apiClient.put<T>(endpoint, body);
//             break;
//           case 'PATCH':
//             response = await apiClient.patch<T>(endpoint, body);
//             break;
//           case 'DELETE':
//             response = await apiClient.delete<T>(endpoint);
//             break;
//         }

//         setLoading(false);
//         options?.onSuccess?.(response.data);
//         return response;
//       } catch (err) {
//         const apiError: APIClientError =
//           err && typeof err === 'object' && 'message' in err
//             ? (err as APIClientError)
//             : ({ message: String(err) } as APIClientError);
//         setError(apiError.message);
//         setLoading(false);
//         options?.onError?.(apiError);
//         return null;
//       }
//     },
//     [options]
//   );

//   return { call, loading, error };
// };

// // Specific hooks for common operations
// export const useGetAPI = <T = any,>(endpoint: string, options?: UseAPIOptions) => {
//   const [data, setData] = useState<T | null>(null);
//   const { call, loading, error } = useAPI({
//     ...options,
//     onSuccess: (data) => {
//       setData(data);
//       options?.onSuccess?.(data);
//     },
//   });

//   const fetch = useCallback(async () => {
//     const response = await call<T>('GET', endpoint);
//     return response?.data || null;
//   }, [call, endpoint]);

//   return { data, fetch, loading, error };
// };

// export const usePostAPI = <T = any,>(options?: UseAPIOptions) => {
//   const { call, loading, error } = useAPI(options);

//   const post = useCallback(
//     async (endpoint: string, body: any) => {
//       return call<T>('POST', endpoint, body);
//     },
//     [call]
//   );

//   return { post, loading, error };
// };
