This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Development Workflow

This project follows a feature-branch workflow with pull requests and mentor review.

The `main` branch contains reviewed and approved changes. All development work must be performed on separate branches and merged into `main` only after mentor approval.

### 1. Branch Naming

Branches must use lowercase names with hyphens separating words.

| Prefix | Purpose | Example |
|---|---|---|
| `feature/` | Implement new functionality or technical tasks | `feature/prisma-setup` |
| `fix/` | Fix bugs or incorrect behavior | `fix/batch-validation` |
| `docs/` | Create or update documentation | `docs/repository-conventions` |

Each branch should focus on one clearly defined task.

### 2. Commit Messages

Commit messages follow this format:

`type: short description`

The description should be concise and explain the purpose of the change.

| Type | Purpose | Example |
|---|---|---|
| `feat` | Add functionality | `feat: add product management API` |
| `fix` | Fix incorrect behavior | `fix: correct batch expiry validation` |
| `docs` | Update documentation | `docs: document repository conventions` |
| `test` | Add or update tests | `test: add batch service tests` |
| `refactor` | Restructure code without changing intended behavior | `refactor: simplify batch validation` |
| `chore` | Perform maintenance or configure tooling | `chore: configure Prisma` |

### 3. Pull Request Workflow

Every feature, fix, or documentation task must follow this workflow:

1. Update the local `main` branch with the latest changes.
2. Create a branch for the task.
3. Implement the changes and perform the relevant checks.
4. Commit the changes using the agreed commit-message convention.
5. Push the branch to GitHub.
6. Open a pull request targeting `main`.
7. Include a description of the purpose, changes, and verification performed.
8. Send the pull request link to the mentor for review.
9. Address any requested changes on the same branch and update the existing pull request.
10. Merge the pull request only after mentor approval.
11. Update the local `main` branch after the merge.

Direct commits to `main` are not part of the normal development workflow.

### 4. Pull Request Requirements

Each pull request should include:

- **Purpose:** Why the change is necessary.
- **Changes:** A summary of the implementation.
- **Verification:** Tests, commands, or checks performed and their results.
- **Review notes:** Important technical decisions, trade-offs, or limitations that the mentor should consider.

Pull requests must be focused on a specific task and should not contain unrelated changes.

### 5. Definition of Done

A task is considered complete when:

- Its requirements and acceptance criteria have been satisfied.
- The implementation follows the approved system design and project conventions.
- Relevant tests and quality checks have passed.
- The changes have been reviewed for correctness and unnecessary complexity.
- No credentials, secrets, or unnecessary generated files have been committed.
- The pull request includes an adequate description and verification notes.
- The mentor has reviewed and approved the pull request.
- The approved changes have been merged into `main`.

If review feedback identifies outstanding issues, the task remains in progress until the issues are addressed and approval is obtained.

### 6. Engineering Decisions

Technical decisions should be consistent with the approved requirements, ERD, and API contract.

Significant architectural changes or deviations from approved designs must be discussed with the mentor before implementation.

Decisions involving alternative approaches should consider maintainability, reliability, security, complexity, and the actual requirements of the system.