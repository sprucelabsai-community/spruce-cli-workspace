# Agent SOPs

## Coding Workflow

1. **Outline a plan** - Present each step with a concise description and code samples
2. **Get approval** - Wait for approval before starting; go through each step one at a time to allow for edits
3. **Detail the step** - Before executing, present the step in full detail (complete code, file paths, rationale) for review and approval
4. **Execute** - Implement the approved step, then present the next step in detail and repeat

## Planning Principles

- Plans describe discrete, concrete mutations to code/config.
- One step maps to one conceptual change set; split unrelated changes.
- Each step is proposed, approved, then executed before moving on.
- Each step must explicitly list the concrete file changes (add/remove/modify) it will make.
- If scope changes mid-stream, update the plan with a brief reason before proceeding.

## Research Principles

- Research (reading files, scanning logs, running read-only commands) can proceed without a formal plan or step approvals.
- Always complete research before making suggestions.
- Never stop research based on initial findings.
- Focus on holistic and detailed analysis: both wide (breadth) and deep (depth).
- When scanning for documentation, check `docs/` in addition to root-level files.
- Treat `docs/PROJECT.md` as critical project-specific instructions and read it early.
- Any code/config changes, script edits, or stateful commands still require the full plan/approval workflow.

## Replanning Principles

- When plans change, reprint the full plan with status markers.
- Mark completed steps as checked off, removed steps as crossed out, and new steps as highlighted.
- Always explain why the plan changed before continuing.

## Bugfixing Principles

- Investigate problems thoroughly (think RCA) before proposing fixes.
- Explain the understood issue back to the user to prove comprehension.
- No "stabbing at things" or guesswork changes.
- If the problem is not understood, zoom out and review again.

## Coding Standards

- Prefer OOP designs; use composition where possible.
- Maximum of one inheritance layer.
- Keep things DRY: after writing code, review for reuse opportunities and extract shared pieces.
- Place type definitions at the bottom of files.
- All class names are to be capitalized in PascalCase.
- Files that define a class should be named after that class in PascalCase (e.g., `DataFetcher.py` for class `DataFetcher`) and the class should be the default export.
- We take types and formatting seriously, consider running `yarn fix.lint` after making changes.
- Before pushing, run `yarn fix.lint` and `yarn build.ci` successfully.

## Refactor Principles

- Do not use git commands to refactor (e.g., avoid `git mv`).
- Make refactors via local file changes, then commit those changes.

## SOLID Principles for AI Agents

Applying these five design principles helps prevent "super-agent" bloat, reduces fragility when switching LLM providers, and ensures specialized agents collaborate effectively.

### 1. Single Responsibility Principle (SRP)
- **Definition:** An agent should have one, and only one, reason to change. It should focus on a single core task.
- **Detailed Explanation:** In agentic workflows, SRP prevents monolithic "God Agents" that handle everything from data retrieval to final formatting. Instead, break workflows into specialized sub-agents. This improves reliability by giving each agent a tighter, more focused system prompt.
- **Example:**
  - **Bad:** A "Support Agent" that reads emails, queries the database, processes returns, and sends confirmation emails.
  - **Good:** A Classifier Agent (categorizes intent) -> A Retrieval Agent (fetches data) -> A Resolution Agent (proposes action) -> A Writer Agent (drafts response).

### 2. Open-Closed Principle (OCP)
- **Definition:** Agents should be open for extension but closed for modification.
- **Detailed Explanation:** You should be able to add new capabilities to your system (extension) without rewriting the core orchestration logic (modification). This is typically achieved through standardized protocols and pluggable tool interfaces.
- **Example:**
  - **Scenario:** Your orchestrator works with a "Search Tool." If you want to add "Voice Search," you shouldn't have to rewrite the orchestrator.
  - **Implementation:** Define a BaseTool interface. New tools like VoiceSearchTool inherit from BaseTool. The orchestrator interacts with BaseTool, automatically supporting any new tool you add later.

### 3. Liskov Substitution Principle (LSP)
- **Definition:** Subclasses or specific agent implementations must be substitutable for their base types without altering the correctness of the system.
- **Detailed Explanation:** In 2026, agents often swap between different LLMs (e.g., GPT-5 to Claude 4) or specialized models for cost/speed. LSP ensures that if you swap a "Reasoning Agent" for a faster "Drafting Agent," the system's output format and interface remain consistent so the next agent in the pipeline doesn't break.
- **Example:**
  - If your system expects a SearchAgent to return a JSON list of URLs, any new VectorSearchAgent must also return a JSON list of URLs, not raw text or markdown, to ensure downstream compatibility.

### 4. Interface Segregation Principle (ISP)
- **Definition:** An agent should not be forced to depend on tools or interfaces it does not use.
- **Detailed Explanation:** Don't give an agent a massive toolkit if it only needs one tool. Large context windows filled with irrelevant tool descriptions lead to "tool-use hallucinations" and increased token costs. Create smaller, specific "toolsets" for specific agent roles.
- **Example:**
  - **Bad:** Giving a "Proofreading Agent" access to DeleteDatabase, SendEmail, and WriteFile.
  - **Good:** Giving it a specific TextEditing interface that only exposes ReadText and SubmitCorrection.

### 5. Dependency Inversion Principle (DIP)
- **Definition:** Depend on abstractions, not concretions. High-level agent logic should not depend on low-level implementation details.
- **Detailed Explanation:** Your core business logic shouldn't be hard-coded to a specific LLM API or a specific database. Instead, the agent should depend on an abstract "Inference Provider" or "Data Store" interface. This allows you to switch from OpenAI to an in-house Llama model just by changing the underlying implementation.
- **Example:**
  - **Concretion (Bad):** OpenAI.chat_completion(prompt) called directly inside your agent code.
  - **Abstraction (Good):** Agent.generate(prompt) which calls an abstract LLMProvider. You can then "inject" OpenAIProvider, AnthropicProvider, or LocalModelProvider at runtime.

## Test-Driven Development (TDD) Protocols

All development must strictly adhere to the Three Laws of TDD. These laws mandate a "nano-cycle" workflow where the time between running tests is measured in seconds or minutes, ensuring the system remains executing at all times.

### The Three Laws

1. No Production Code Without Failure: You may not write any production code unless it is to make a failing unit test pass.
2. Minimal Test Writing: You may not write more of a unit test than is sufficient to fail; failing to compile is considered a valid failure.
3. Minimal Production Code: You may not write more production code than is sufficient to pass the currently failing unit test.

### The Red-Green-Refactor Cycle

The criticalness of TDD lies in its tight feedback loop, which provides immediate verification and prevents "invisible drift" in complex systems. All our tests watch and rerun on every change, this is our continuous safety net while developing. The tests will also run in CI/CD pipelines to ensure no regressions are introduced.

- Red (Tight Specification): Write a failing test first that approaches to solve the first, smallest piece of functionality you want to add. 
  - Most times, this is failing because the function or class does not yet exist.
  - It can cover calling a method with missing or incorrect parameters
  - It can cover edge cases or error conditions.
  - Write the smallest test possible to force the production code changes to be as small as possible.
  - Think of the test as a challenge to the production code writer to solve with the least amount of code.
- Green (Rapid Feedback): Write the absolute minimum code to pass the test. The priority here is the feedback speed—once the test is green, you have a "safe harbor" of working code.
  - This code may be ugly, unoptimized, or even hard-coded.
  - The goal is to get to a passing state as quickly as possible to maintain momentum and confidence.
  - Think of this as a challenge to the test writer to write another test that forces improvement.
  - In the end, the code should have no choice but to work.
  - Many times the production code starts in the same file as the test code for speed, just at the bottom.
- Refactor (Fearless Optimization): With a passing test suite as a safety net, you must clean up and optimize the code. This is the only time design improvements should happen. The feedback loop ensures that if a refactor breaks logic, you know exactly which change caused the issue within seconds.
  - It is best to refactor after you have written the same code twice and the tests pass.
  - Follow CLEAN code principles here. It's ok to refactor the same code to match different patterns as the codebase evolves.
  - Keep functions/methods small, only a few lines of code, the idea being that we need to trust the function/method names and not be conserned with the implementation details.
  - When the implementation is done, move the production code to its proper file and location.


### Why This is Critical for Agents

- Instant Verification: Frequent test runs (every 30–60 seconds) mean debugging is nearly eliminated because the bug must be in the handful of lines written since the last pass.
- Confidence to Release: A comprehensive suite of "cannot fail" tests allows for rapid iteration and deployment with total confidence in system stability.
- Prevention of Rot: Slow feedback loops lead to developer fatigue and code rot. Keeping tests fast and the cycle tight ensures the cost of refactoring remains low.

## Commit Message Convention

Commit messages must follow semver intent for CI/CD:

- `patch: {detailed description of changes}` for immaterial behavior changes
- `minor: {detailed description of changes}` for new features
- `major: {detailed description of changes}` for breaking changes
