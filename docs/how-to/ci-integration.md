# CI Integration

Run `spine check` on every pull request to block architecture violations from reaching your main branch. This guide provides copy-paste templates for GitHub Actions and GitLab CI.

## What `spine check` Does in CI

- Loads all rules from `.spine/rules/*.yml`
- Evaluates each rule's `appliesTo` globs against changed files
- Uses the LLM to evaluate rule constraints against source code
- Exits with non-zero status if any `severity: error` rule is violated
- Outputs a structured report listing each violation with file path and rule reference

## Prerequisites for CI

1. Your repository has been initialized (`spine init`) and synced (`spine sync`)
2. `.spine/config.json` and `.spine/rules/` are committed to the repository
3. You have an LLM API key stored as a CI secret

## GitHub Actions

Copy the template file from the ArchSpine repository:

```bash
curl -o .github/workflows/spine-sync.yml \
  https://raw.githubusercontent.com/archspine-ai/archspine/main/.github/workflows/spine-sync.yml.example
```

Or create `.github/workflows/spine-sync.yml`:

````yaml
name: ArchSpine Sync & Check

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  spine-check:
    name: ArchSpine Sync & Check
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install ArchSpine
        run: npm install -g archspine

      - name: Run spine sync
        env:
          OPENAI_API_KEY: ${{ secrets.LLM_API_KEY }}
        run: spine sync --no-docs

      - name: Run spine check
        id: check
        continue-on-error: true
        run: spine check 2>&1 | tee spine-check-output.txt

      - name: Post PR comment on failure
        if: steps.check.outcome == 'failure'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('node:fs');
            const output = fs.readFileSync('spine-check-output.txt', 'utf8');

            const body = [
              '## ArchSpine Architecture Check',
              '',
              'Architecture violations detected. Please resolve before merging:',
              '',
              '```',
              output.slice(0, 60000),
              '```',
              '',
              '> Run `spine check` locally for full control-plane details.',
            ].join('\n');

            const { data: comments } = await github.rest.issues.listComments({
              ...context.repo,
              issue_number: context.issue.number,
            });

            const existingComment = comments.find(
              c => c.user.type === 'Bot' && c.body.startsWith('## ArchSpine Architecture Check')
            );
            if (existingComment) {
              await github.rest.issues.updateComment({
                ...context.repo,
                comment_id: existingComment.id,
                body,
              });
            } else {
              await github.rest.issues.createComment({
                ...context.repo,
                issue_number: context.issue.number,
                body,
              });
            }

      - name: Fail workflow on violations
        if: steps.check.outcome == 'failure'
        run: |
          cat spine-check-output.txt
          exit 1
````

### GitHub Actions: Add the Secret

In your repository: **Settings > Secrets and variables > Actions > New repository secret**

| Name          | Value                     |
| ------------- | ------------------------- |
| `LLM_API_KEY` | Your LLM provider API key |

### GitHub Actions: What Triggers It

The workflow runs on:

- PR opened
- PR synchronized (new commits pushed)
- PR reopened

To restrict which branches trigger it, add a `branches` filter:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches:
      - main
      - develop
```

## GitLab CI

Copy the template:

```bash
curl -o .gitlab-ci.yml \
  https://raw.githubusercontent.com/archspine-ai/archspine/main/.gitlab-ci.spine.yml.example
```

Or create `.gitlab-ci.yml` (or merge into your existing config):

````yaml
stages:
  - test

spine-check:
  image: node:22
  stage: test
  timeout: 20 minutes

  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

  variables:
    OPENAI_API_KEY: $LLM_API_KEY

  before_script:
    - npm install -g archspine

  script:
    - spine sync --no-docs
    - spine check 2>&1 | tee spine-check-output.txt; CHECK_EXIT=${PIPESTATUS[0]}
    - |
      if [ "$CHECK_EXIT" != "0" ]; then
        echo "ArchSpine check found violations. Posting MR comment..."

        apk add --no-cache curl jq > /dev/null 2>&1 || true
        apt-get update -qq && apt-get install -y -qq curl jq > /dev/null 2>&1 || true

        OUTPUT=$(cat spine-check-output.txt | head -c 60000)
        BODY=$(jq -n --arg out "$OUTPUT" '[
          "## ArchSpine Architecture Check",
          "",
          "Architecture violations detected. Please resolve before merging:",
          "",
          "```",
          $out,
          "```",
          "",
          "> Run `spine check` locally for full control-plane details."
        ] | join("\n")')

        curl --request POST \
          --silent \
          --show-error \
          --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
          --header "Content-Type: application/json" \
          --data "{\"body\": $(echo "$BODY" | jq -Rs .)}" \
          "$CI_API_V4_URL/projects/$CI_PROJECT_ID/merge_requests/$CI_MERGE_REQUEST_IID/notes"

        exit 1
      fi

  artifacts:
    when: on_failure
    paths:
      - spine-check-output.txt
    expire_in: 7 days
````

### GitLab CI: Add Variables

In your project: **Settings > CI/CD > Variables**

| Name           | Value                                  | Protected | Masked |
| -------------- | -------------------------------------- | --------- | ------ |
| `LLM_API_KEY`  | Your LLM provider API key              | Yes       | Yes    |
| `GITLAB_TOKEN` | Personal Access Token with `api` scope | Yes       | Yes    |

### GitLab CI: Reference Without Copying

If your project already has a `.gitlab-ci.yml`, reference the template remotely:

```yaml
include:
  - remote: 'https://raw.githubusercontent.com/archspine-ai/archspine/main/.gitlab-ci.spine.yml.example'
```

## Customizing the Check

### Skip Sync

If your pipeline already includes a sync step (or you use pre-commit sync), run only the check:

```yaml
# GitHub Actions
- name: Run spine check
  run: spine check

# GitLab CI
script:
  - spine check
```

### Warning-Only Mode

Use `--severity warning` to fail only on errors (warnings are reported but pass):

This flag is available on `spine check`. See `spine check --help` for available options.

## Expected CI Output

**Passing (no violations):**

```
ArchSpine Architecture Check

Loaded 5 rules from .spine/rules/

✅ All rules passed.
Check completed successfully.
```

**Failing (violation detected):**

```
ArchSpine Architecture Check

Loaded 5 rules from .spine/rules/

❌ layered-module-separation: Services Must Not Import CLI [error]
   src/services/view/view-service.ts — imports from src/cli/help.js

-------------------------------------------------
  Errors: 1   Warnings: 0   Advisory: 0
  Check failed
```

The CI job posts this output as a comment on the PR/MR and fails the workflow.
