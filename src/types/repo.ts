// types/repo.ts (good practice to define types in a separate file)
export interface Repository {
  id: number
  name: string
  description: string | null // Github descriptions can be null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  visibility: 'public' | 'private'
  owner: {
    login: string
    id: number
    avatar_url: string
  }
}
