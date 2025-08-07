#!/usr/bin/env python
import asyncio
import argparse
import json
import httpx

# Default server URL - make sure to include the trailing slash
SERVER_URL = "http://127.0.0.1:4200/genai-sdlc/"

async def call_server(method, params):
    """Make a JSON-RPC call to the server."""
    async with httpx.AsyncClient() as client:
        payload = {
            "jsonrpc": "2.0",
            "method": method,
            "params": params,
            "id": 1
        }
        
        try:
            response = await client.post(SERVER_URL, json=payload)
            response.raise_for_status()
            result = response.json()
            
            if "error" in result:
                print(f"Server error: {result['error']}")
                return None
                
            return result.get("result", {})
        except Exception as e:
            print(f"Error calling server: {e}")
            return None

async def ping_server():
    """Ping the server to check if it's running."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(SERVER_URL)
            print(f"HTTP Status: {response.status_code}")
            if response.status_code == 200:
                print("Server is running!")
            else:
                print(f"Server returned an error: {response.text}")
    except Exception as e:
        print(f"Error connecting to server: {e}")

async def main():
    """Main entry point for the client."""
    parser = argparse.ArgumentParser(description="Simple SDLC Client")
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Ping command
    subparsers.add_parser("ping", help="Ping the server")
    
    # Run SDLC flow command
    run_parser = subparsers.add_parser("run", help="Run the SDLC flow")
    run_parser.add_argument("--app", required=True, help="Application name")
    run_parser.add_argument("--s3", required=True, help="S3 bucket link")
    run_parser.add_argument("--epics", type=int, default=5, help="Number of epics")
    run_parser.add_argument("--stories", type=int, default=15, help="Number of user stories")
    run_parser.add_argument("--language", default="Python", help="Programming language")
    run_parser.add_argument("--framework", default="Django", help="Framework")
    run_parser.add_argument("--tests", type=int, default=10, help="Number of test scenarios")
    run_parser.add_argument("--github-repo", default="", help="GitHub repo name")
    
    # Test plan generation command
    test_parser = subparsers.add_parser("test", help="Generate test plans")
    test_parser.add_argument("--s3", required=True, help="S3 bucket link")
    
    # Katalon test scripts generation command
    katalon_parser = subparsers.add_parser("katalon", help="Generate Katalon scripts")
    katalon_parser.add_argument("--website", required=True, help="Website URL")
    katalon_parser.add_argument("--output", required=True, help="Output repository")
    
    args = parser.parse_args()
    
    if args.command == "ping":
        await ping_server()
    
    elif args.command == "run":
        params = {
            "app": args.app,
            "s3_bucket_link": args.s3,
            "epic_count": args.epics,
            "user_story_count": args.stories,
            "programming_language": args.language,
            "framework": args.framework,
            "test_scenario_count": args.tests,
            "github_repo_name": args.github_repo
        }
        result = await call_server("run_sdlc_flow", params)
        if result:
            print(json.dumps(result, indent=2))
    
    elif args.command == "test":
        params = {"s3_bucket_link": args.s3}
        result = await call_server("generate_test_plan", params)
        if result:
            print(json.dumps(result, indent=2))
    
    elif args.command == "katalon":
        params = {
            "website_url": args.website,
            "output_repo_path": args.output
        }
        result = await call_server("generate_katalon_script", params)
        if result:
            print(json.dumps(result, indent=2))
    
    else:
        print("Please specify a command. Use --help for more information.")

if __name__ == "__main__":
    asyncio.run(main())