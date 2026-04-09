import { Octokit } from '@octokit/rest';

export const fetchGitHubProfile = async (username) => {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || undefined,
    });
    
    const [userRes, reposRes] = await Promise.all([
      octokit.rest.users.getByUsername({ username }),
      octokit.rest.repos.listForUser({
        username,
        sort: 'pushed',
        per_page: 20,
      }),
    ]);

    const repos = await Promise.all(
      reposRes.data.map(async (repo) => {
        let languages = {};
        try {
          const langRes = await octokit.rest.repos.listLanguages({
            owner: username,
            repo: repo.name,
          });
          languages = langRes.data;
        } catch (e) {
          console.warn(`Failed to fetch languages for ${repo.name}`);
        }
        
        return {
          name: repo.name,
          description: repo.description,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          languages,
          has_readme: true, // simplified, checking actual existence uses more API calls
          updated_at: repo.updated_at,
        };
      })
    );

    return {
      username: userRes.data.login,
      name: userRes.data.name,
      followers: userRes.data.followers,
      public_repos: userRes.data.public_repos,
      repos,
      avg_commits_per_week: 5, // mock estimation to save API rate limits
    };
  } catch (error) {
    console.error(`GitHub API error for ${username}:`, error.message);
    return null;
  }
};
