import requests
import json
import os

def fetch_github_profile_data(github_url: str) -> dict:
    """
    Fetches basic unauthenticated GitHub stats:
    Total stars, languages used across recent repos.
    """
    if not github_url or "github.com/" not in github_url:
        return {}
        
    username = github_url.strip("/").split("/")[-1]
    
    try:
        api_url = f"https://api.github.com/users/{username}/repos?per_page=15&sort=updated"
        headers = {"Accept": "application/vnd.github.v3+json"}
        token = os.environ.get("GITHUB_TOKEN")
        if token:
            headers["Authorization"] = f"token {token}"
            
        resp = requests.get(api_url, headers=headers, timeout=10)
        
        if resp.status_code != 200:
            return {"error": f"GitHub API failed with {resp.status_code}"}
            
        repos = resp.json()
        
        total_stars = 0
        languages = set()
        topics = set()
        
        for repo in repos:
            total_stars += repo.get("stargazers_count", 0)
            lang = repo.get("language")
            if lang:
                languages.add(lang)
            if "topics" in repo:
                for topic in repo["topics"]:
                    topics.add(topic)
                    
        return {
            "username": username,
            "recent_repos_count": len(repos),
            "total_stars_in_recent": total_stars,
            "inferred_languages": list(languages),
            "topics": list(topics)
        }

    except Exception as e:
        print(f"Error fetching GitHub data: {e}")
        return {"error": "Exception occurred"}
