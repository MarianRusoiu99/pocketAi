import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8091'

function serverUrl(url: string): string {
  if (!url) url = ''
  
  if (url.startsWith('http') || url.startsWith('ftp')) return url
  
  if (url.startsWith('/')) url = url.substring(1)
  url = `${API_BASE}/api/${url}`
  
  return url
}

export class ApiResponse<T> {
  readonly result: T
  readonly success: boolean
  readonly error: string

  constructor(success: boolean, result?: T, error?: string) {
    this.success = success
    this.result = result!
    this.error = error || ''
  }
}

type RequestOptions = {
  errorMessage?: string
  queryParams?: Record<string, any>
  data?: any
}

type HttpVerb = 'get' | 'post' | 'put' | 'delete'

async function axiosCall(
  verb: HttpVerb,
  url: string,
  options?: Partial<RequestOptions>
) {
  const headers: Record<string, string> = {}
  
  // Add auth token if available
  const token = localStorage.getItem('pocketbase_auth_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Build query params
  if (options?.queryParams && Object.keys(options.queryParams).length > 0) {
    const query = new URLSearchParams(
      Object.fromEntries(
        Object.entries(options.queryParams)
          .filter(([_, v]) => typeof v !== 'undefined')
          .map(([k, v]) => [k, v.toString()])
      )
    ).toString()
    url = `${url}?${query}`
  }

  url = serverUrl(url)

  switch (verb) {
    case 'get':
      return await axios.get(url, { headers })
    case 'post':
      return await axios.post(url, options?.data, { headers })
    case 'put':
      return await axios.put(url, options?.data, { headers })
    case 'delete':
      return await axios.delete(url, { headers })
  }
}

async function wrapRequest<T>(
  verb: HttpVerb,
  url: string,
  options?: Partial<RequestOptions>
): Promise<ApiResponse<T>> {
  try {
    const { data, status } = await axiosCall(verb, url, options)
    
    if (status >= 200 && status < 300) {
      return new ApiResponse<T>(true, data as T)
    } else {
      return new ApiResponse<T>(false, undefined, data?.message || 'Request failed')
    }
  } catch (err: any) {
    return new ApiResponse<T>(
      false,
      undefined,
      err?.response?.data?.message || options?.errorMessage || err.toString()
    )
  }
}

function axiosGet<T>(url: string, options?: Partial<RequestOptions>) {
  return wrapRequest<T>('get', url, options)
}

function axiosPost<T>(url: string, options?: Partial<RequestOptions>) {
  return wrapRequest<T>('post', url, options)
}

function axiosPut<T>(url: string, options?: Partial<RequestOptions>) {
  return wrapRequest<T>('put', url, options)
}

function axiosDelete<T>(url: string, options?: Partial<RequestOptions>) {
  return wrapRequest<T>('delete', url, options)
}

export class ApiClient {
  static get = axiosGet
  static post = axiosPost
  static put = axiosPut
  static delete = axiosDelete
  static serverUrl = serverUrl
}
