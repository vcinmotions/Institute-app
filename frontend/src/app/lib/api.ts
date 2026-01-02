import axios from 'axios'

export interface SignInResponse {
  message: string
  token?: string
}

export interface SignUpResponse {
  message: string
}

export interface AuthParams {
  email: string
  password: string
}

export async function SignIn({email, password}: AuthParams): Promise<SignInResponse> {
  try {
    const response = await axios.post('/api/login', { email, password }, {
      withCredentials: true,
    })
    return response.data
  } catch (error: any) {        
    if (error.response) {
      throw new Error(error.response.data?.error || 'Login failed')
    }
    throw new Error(error.message || 'Network error')
  }
}

export async function SignUp({email, password}: AuthParams): Promise<SignUpResponse> {
  try {
    const response = await axios.post('/api/register', { email, password }, {
      withCredentials: true,
    })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.error || 'Register failed')
    }
    throw new Error(error.message || 'Network error')
  }
}
