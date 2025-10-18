import Link from 'next/link'
import { GitHubContent } from '@/types/github' // Adjust the path as needed

interface RepoProps {
  name: string
}

export default async function RepoDirs({ name }: RepoProps) {
  const username = 'bora120'
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const response = await fetch(
    `https://api.github.com/repos/${username}/${name}/contents`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
      },
    }
  )
  const contents: GitHubContent[] = await response.json()
  const dirs = contents.filter((content) => content.type === 'dir')
  return (
    <div className="mt-2 ">
      <h3 className="text-xl font-bold">Directories</h3>
      <ul>
        {dirs.map((dir) => (
          <li key={dir.path}>
            <Link
              className="underline"
              href={`https://github.com/${username}/${name}/tree/master/${dir.path}`}
            >
              {dir.path}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
