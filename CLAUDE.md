# Theory of Computation Visualizer (ToC Visualizer)

This project is a visual experimentation platform for abstract machines, designed for university students and enthusiasts of computer science theory.

## Design Context

### Users
Undergraduate students and curious individuals. They use this tool to demystify complex theoretical concepts (DFA, NFA, TM, UTM, Cantor's Diagonalization) through interactive, visual simulation.

### Brand Personality
**Modern, Scholarly, Modular.**
Inspired by the clean, workspace-centric organization of apps like **Obsidian**. The feel should be that of a "Digital Lab" for theoretical computer science.

### Aesthetic Direction
**Minimalist Light.**
Moving towards a clean, paper-like interface with subtle borders and a focus on crisp typography. The current "Dark Tech" aesthetic is being phased out in favor of a more readable, minimalist light theme (whites, light grays, and soft accents).

### Design Principles
1. **Clarity over Flash**: Prioritize the legibility of machine states and transitions. Avoid excessive glowing effects; use color only to indicate functional status (e.g., active, accepted, rejected).
2. **Modular Workspace**: Each machine should feel like a dedicated module within a larger, cohesive research environment.
3. **Interactive Simulation**: Visual feedback (real-time animation) is the primary teaching mechanism.
4. **Scholarly Precision**: Correct use of mathematical symbols ($\copyright$, $\beta$, $\epsilon$) and standard theoretical notation is mandatory.

## Technology Stack
- **Frontend**: React (Vite)
- **Styling**: Tailwind CSS (Vanilla CSS for custom components)
- **Icons**: Lucide-react
- **Graph Engine**: @xyflow/react (React Flow)
- **Persistence**: Local Storage
