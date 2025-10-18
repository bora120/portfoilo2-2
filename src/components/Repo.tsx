import Link from 'next/link'
import { FaStar, FaCodeBranch, FaEye } from 'react-icons/fa'
interface RepoProps {
  name: string
}
export default async function Repo({ name }: RepoProps) {
  const username = 'bora120'
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const response = await fetch(
    `https://api.github.com/repos/${username}/${name}`
  )
  const repo = await response.json()
  // console.log(repo)
  return (
    <div>
      <h3 className="text-xl font-bold">
        <Link href={`https://github.com/${username}/${name}`}>{repo.name}</Link>
      </h3>
      <p>{repo.description}</p>
      <div className="flex justify-between items-center mb-4">
        <span className="flex items-center gap-1">
          <FaStar /> {repo.stargazers_count ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <FaCodeBranch /> {repo.forks_count ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <FaEye /> {repo.watchers_count ?? 0}
        </span>
      </div>
    </div>
  )
}
