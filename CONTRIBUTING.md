# Contributing to OmniLog

Thank you for your interest in contributing to OmniLog! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Adding a New Transport](#adding-a-new-transport)
- [Adding a Framework Integration](#adding-a-framework-integration)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow. Please be respectful, inclusive, and constructive in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/djish/omnilog.git
   cd omnilog
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/djish/omnilog.git
   ```

## Development Setup

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0 (for workspace support)
- TypeScript knowledge

### Installation

```bash
# Install dependencies for all packages
npm install

# Build all packages
npm run build
```

### Development Workflow

```bash
# Build a specific package during development
npm run build:core
npm run build:console
npm run build:file
npm run build:react
npm run build:angular

# Watch mode (if available)
npm run dev
```

## Project Structure

OmniLog is a monorepo using npm workspaces:

```
omnilog/
├── packages/
│   ├── core/                    # @omnilog/core - Core logger and types
│   │   ├── src/
│   │   │   ├── types.ts         # Shared types and interfaces
│   │   │   ├── logger.ts        # Logger class
│   │   │   ├── manager.ts        # Global manager and registry
│   │   │   ├── buffering.ts      # Buffering implementation
│   │   │   └── utils/            # Utility functions
│   │   └── package.json
│   │
│   ├── transport-console/       # @omnilog/transport-console
│   ├── transport-file/          # @omnilog/transport-file (Node.js only)
│   ├── react/                   # @omnilog/react
│   └── angular/                 # @omnilog/angular
│
├── examples/                     # Usage examples
├── package.json                  # Root workspace config
├── tsconfig.base.json            # Shared TypeScript config
└── README.md
```

### Package Naming Convention

- Core: `@omnilog/core`
- Transports: `@omnilog/transport-{name}`
- Integrations: `@omnilog/{framework}`

## Making Changes

### Branch Strategy

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the [Code Style](#code-style) guidelines

3. Ensure all packages build successfully:
   ```bash
   npm run build
   ```

4. Test your changes (see [Testing](#testing))

5. Commit your changes with clear messages (see [Commit Messages](#commit-messages))

### Commit Messages

Follow conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(transport): add Redis transport
fix(core): handle null transports gracefully
docs(readme): update installation instructions
```

## Adding a New Transport

Transports implement the `LogTransport` interface from `@omnilog/core`.

### Step 1: Create Package Structure

```bash
mkdir -p packages/transport-{name}/src
```

### Step 2: Create Package Files

**package.json:**
```json
{
  "name": "@omnilog/transport-{name}",
  "version": "0.1.0",
  "description": "{Name} transport for OmniLog",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "@omnilog/core": "0.1.0"
  }
}
```

**tsconfig.json:**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

### Step 3: Implement Transport

**src/index.ts:**
```typescript
import { LogEntry, LogTransport } from "@omnilog/core";

export interface {Name}TransportOptions {
  // Define your options
}

export class {Name}Transport implements LogTransport {
  constructor(private readonly options: {Name}TransportOptions) {}

  async log(entry: LogEntry): Promise<void> {
    // Implement your transport logic
  }
}
```

### Step 4: Update Root Build Scripts

Add to `omnilog/package.json`:
```json
{
  "scripts": {
    "build:{name}": "npm run -w @omnilog/transport-{name} build"
  }
}
```

### Step 5: Add Example

Create an example in `examples/` showing how to use the new transport.

### Step 6: Update Documentation

- Add transport to README.md
- Document options and usage
- Add example code

## Adding a Framework Integration

### Step 1: Create Package Structure

```bash
mkdir -p packages/{framework}/src/lib
```

### Step 2: Follow Framework Patterns

**For React:**
- Use React Context API
- Provide hooks (`useLogger`)
- Export provider components

**For Angular:**
- Create injectable services
- Use dependency injection tokens
- Follow Angular style guide

### Step 3: Update Documentation

- Add framework integration section to README
- Include setup instructions
- Provide usage examples

## Code Style

### TypeScript

- Use **strict mode** (enabled in `tsconfig.base.json`)
- Prefer `async/await` over promises
- Use explicit types for public APIs
- Use `interface` for object shapes
- Use `type` for unions/intersections

### Naming Conventions

- **Classes**: PascalCase (`Logger`, `FileTransport`)
- **Functions/Methods**: camelCase (`getLogger`, `logInternal`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_MAX_FILES`)
- **Interfaces**: PascalCase with `I` prefix optional (`LogTransport`, `LoggerConfig`)

### File Organization

- One class/interface per file (when possible)
- Group related exports in `index.ts`
- Use barrel exports for public API

### Code Examples

**Good:**
```typescript
export class Logger {
  private readonly name: string;
  
  constructor(name: string, config: LoggerConfig) {
    this.name = name;
    // ...
  }
  
  async log(level: LogLevel, message: string): Promise<void> {
    // Implementation
  }
}
```

**Avoid:**
```typescript
// Don't use 'any'
function process(data: any) { }

// Don't ignore errors
try {
  await operation();
} catch {
  // Silent failure
}
```

## Testing

### Current Status

Testing infrastructure is planned. For now:

1. **Manual Testing**: Test your changes manually
2. **Build Verification**: Ensure all packages compile
3. **Example Verification**: Run examples to verify functionality

### Future Testing Requirements

When tests are added:
- Unit tests for core functionality
- Integration tests for transports
- Framework-specific tests for integrations
- Test coverage requirements (TBD)

## Submitting Changes

### Pull Request Process

1. **Update your branch**:
   ```bash
   git checkout main
   git pull upstream main
   git checkout feature/your-feature-name
   git rebase main
   ```

2. **Ensure everything builds**:
   ```bash
   npm run build
   ```

3. **Create a Pull Request** on GitHub:
   - Clear title describing the change
   - Detailed description of what and why
   - Reference any related issues
   - Include screenshots/examples if applicable

4. **Respond to feedback**:
   - Address review comments
   - Make requested changes
   - Keep discussions constructive

### PR Checklist

Before submitting, ensure:

- [ ] Code follows style guidelines
- [ ] All packages build successfully
- [ ] Changes are tested (manually or with tests)
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] No console.logs or debug code left behind
- [ ] Examples work (if applicable)

## Reporting Issues

### Bug Reports

Include:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Minimal steps to reproduce
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Node.js version, OS, package versions
- **Code Example**: Minimal code that demonstrates the issue

### Feature Requests

Include:
- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other solutions considered
- **Additional Context**: Any other relevant information

### Issue Template

```markdown
**Description**
Clear description of the issue

**Steps to Reproduce**
1. Step one
2. Step two
3. ...

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Node.js version:
- OS:
- Package versions:

**Code Example**
\`\`\`typescript
// Minimal code demonstrating the issue
\`\`\`
```

## Development Tips

### Debugging

- Use `console.log` temporarily (remove before PR)
- Use TypeScript source maps for debugging
- Check build output in `dist/` directories

### Common Tasks

**Adding a new dependency:**
```bash
# Add to specific package
cd packages/core
npm install package-name

# Add as dev dependency
npm install -D package-name
```

**Cleaning build artifacts:**
```bash
# Clean all packages
npm run clean

# Clean specific package
cd packages/core
npm run clean
```

**Checking for TypeScript errors:**
```bash
# Build will show all errors
npm run build
```

## Getting Help

- **Documentation**: Check README.md first
- **Examples**: Look in `examples/` directory
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions (if enabled)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

Thank you for contributing to OmniLog! 🎉

