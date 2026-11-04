# JSON Buddy - Gemini Instructions

## 1. Project Overview

JSON Buddy is a browser-based developer tool for working with JSON data.

The application helps developers:

- Format and minify JSON
- Validate JSON syntax
- Explore JSON using a tree view
- Compare two JSON objects
- Generate TypeScript interfaces from JSON
- Generate JSON Schema

The primary goal is to create a fast, reliable, privacy-friendly developer tool.

## 2. Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS (planned)
- Monaco Editor (planned)
- Vitest
- React Testing Library
- Playwright (planned)

Do not introduce additional frameworks or libraries without explaining why they are needed.

## 3. Architecture

- Keep the application modular.
- Separate UI components from JSON processing logic.
- Keep reusable JSON utilities independent of React.
- Avoid putting all application logic inside App.tsx.
- Prefer small, focused components.
- Use TypeScript types instead of any whenever possible.

Suggested structure:

src/
components/
features/
formatter/
validator/
tree-view/
json-diff/
typescript-generator/
hooks/
lib/
types/
test/

Do not create all these directories immediately.
Create them when the corresponding feature is implemented.

## 4. Coding Standards

- Use functional React components.
- Use TypeScript.
- Prefer named exports for reusable components and utilities.
- Use async/await when asynchronous operations are needed.
- Avoid unnecessary abstractions.
- Do not duplicate existing functionality.
- Do not modify unrelated files.
- Follow the existing project conventions.

## 5. JSON Processing Rules

- Handle invalid JSON gracefully.
- Never silently modify user-provided JSON.
- Preserve the distinction between null, missing values, and undefined.
- Handle nested objects and arrays.
- Avoid unsafe evaluation of user-provided data.
- Do not execute user-provided JSON as JavaScript.
- Do not send user JSON data to external services.

## 6. Privacy

JSON Buddy processes JSON data locally in the browser.

Do not send user-provided JSON to external APIs or services.

Do not introduce analytics or telemetry that captures user data.

## 7. UI and UX

- Support both light and dark themes.
- Use a clean, modern developer-tool interface.
- Prioritize readability and accessibility.
- Provide clear validation errors.
- Use consistent spacing and typography.
- Ensure the interface works on desktop and mobile.
- Avoid unnecessary animations.

## 8. Testing

- Use Vitest for unit tests.
- Use React Testing Library for component tests.
- Use Playwright for end-to-end tests when appropriate.
- Write tests for JSON processing utilities.
- Include valid, invalid, and edge-case inputs.
- Do not weaken existing tests to make them pass.
- Do not claim tests passed unless they were executed.

## 9. Development Workflow

Before implementing a feature:

1. Inspect the existing code.
2. Identify relevant files.
3. Explain the proposed implementation.
4. Identify potential edge cases.
5. Implement the smallest reasonable solution.
6. Write or update tests.
7. Run relevant tests.
8. Report the changes and test results.

Do not implement multiple unrelated features in one task.

Ask for clarification when requirements are ambiguous.

## 10. Agent Behavior

Act as a senior software engineer and mentor.

Explain important architectural decisions.

Do not blindly follow requests that introduce unnecessary complexity.

Prefer maintainable and testable solutions.

When a task is large, break it into smaller independent tasks.

Do not create subagents unless the task benefits from delegation.
