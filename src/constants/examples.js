export const TM_EXAMPLES = {
  parity: {
    name: "Paridade (Pares de '1's)",
    input: "1111",
    accept: "q3",
    rules: [
      { currentState: 'q0', readSymbol: '©', nextState: 'q1', writeSymbol: '©', move: 'D' },
      { currentState: 'q1', readSymbol: '1', nextState: 'q2', writeSymbol: '1', move: 'D' },
      { currentState: 'q2', readSymbol: '1', nextState: 'q1', writeSymbol: '1', move: 'D' },
      { currentState: 'q1', readSymbol: 'β', nextState: 'q3', writeSymbol: 'β', move: 'P' },
    ]
  },
  anbn: {
    name: "Linguagem a^n b^n",
    input: "aabb",
    accept: "q4",
    rules: [
      { currentState: 'q0', readSymbol: '©', nextState: 'q0_start', writeSymbol: '©', move: 'D' },
      { currentState: 'q0_start', readSymbol: 'a', nextState: 'q1', writeSymbol: 'X', move: 'D' },
      { currentState: 'q1', readSymbol: 'a', nextState: 'q1', writeSymbol: 'a', move: 'D' },
      { currentState: 'q1', readSymbol: 'Y', nextState: 'q1', writeSymbol: 'Y', move: 'D' },
      { currentState: 'q1', readSymbol: 'b', nextState: 'q2', writeSymbol: 'Y', move: 'E' },
      { currentState: 'q2', readSymbol: 'Y', nextState: 'q2', writeSymbol: 'Y', move: 'E' },
      { currentState: 'q2', readSymbol: 'a', nextState: 'q2', writeSymbol: 'a', move: 'E' },
      { currentState: 'q2', readSymbol: 'X', nextState: 'q0_start', writeSymbol: 'X', move: 'D' },
      { currentState: 'q0_start', readSymbol: 'Y', nextState: 'q3', writeSymbol: 'Y', move: 'D' },
      { currentState: 'q3', readSymbol: 'Y', nextState: 'q3', writeSymbol: 'Y', move: 'D' },
      { currentState: 'q3', readSymbol: 'β', nextState: 'q4', writeSymbol: 'β', move: 'P' },
    ]
  },
  increment: {
    name: "Incremento Binário (+1)",
    input: "1011",
    accept: "qf",
    rules: [
      { currentState: 'q0', readSymbol: '©', nextState: 'q1', writeSymbol: '©', move: 'D' },
      { currentState: 'q1', readSymbol: '0', nextState: 'q1', writeSymbol: '0', move: 'D' },
      { currentState: 'q1', readSymbol: '1', nextState: 'q1', writeSymbol: '1', move: 'D' },
      { currentState: 'q1', readSymbol: 'β', nextState: 'q2', writeSymbol: 'β', move: 'E' },
      { currentState: 'q2', readSymbol: '1', nextState: 'q2', writeSymbol: '0', move: 'E' },
      { currentState: 'q2', readSymbol: '0', nextState: 'qf', writeSymbol: '1', move: 'P' },
      { currentState: 'q2', readSymbol: '©', nextState: 'qf', writeSymbol: '1', move: 'P' },
    ]
  }
};

export const UTM_EXAMPLES = {
  inverter: {
    name: "Inversor de Bits (NOT)",
    data: ['1', '0', '1', '1', 'β', 'β'],
    rules: [
      { fromS: 'q0', read: '1', toS: 'q0', write: '0', move: 'D' },
      { fromS: 'q0', read: '0', toS: 'q0', write: '1', move: 'D' },
      { fromS: 'q0', read: 'β', toS: 'qf', write: 'β', move: 'P' },
    ]
  },
  eraser: {
    name: "Apagador (Zera Fita)",
    data: ['1', '1', '0', '1', 'β'],
    rules: [
      { fromS: 'q0', read: '1', toS: 'q0', write: 'β', move: 'D' },
      { fromS: 'q0', read: '0', toS: 'q0', write: 'β', move: 'D' },
      { fromS: 'q0', read: 'β', toS: 'qf', write: 'β', move: 'P' },
    ]
  },
  findZero: {
    name: "Substitui 0 por 1",
    data: ['1', '1', '0', '1', 'β'],
    rules: [
      { fromS: 'q0', read: '1', toS: 'q0', write: '1', move: 'D' },
      { fromS: 'q0', read: '0', toS: 'qf', write: '1', move: 'P' },
      { fromS: 'q0', read: 'β', toS: 'qf', write: 'β', move: 'P' },
    ]
  }
};

export const AUTOMATA_EXAMPLES = {
  dfa_ends_01: {
    name: "DFA: Termina com '01'",
    type: 'DFA',
    input: "1101",
    initialState: 'q0',
    acceptStates: ['q2'],
    transitions: [
      { from: 'q0', symbol: '0', to: 'q1' },
      { from: 'q0', symbol: '1', to: 'q0' },
      { from: 'q1', symbol: '0', to: 'q1' },
      { from: 'q1', symbol: '1', to: 'q2' },
      { from: 'q2', symbol: '0', to: 'q1' },
      { from: 'q2', symbol: '1', to: 'q0' },
    ]
  },
  nfa_ends_abb: {
    name: "NFA: Termina com 'abb'",
    type: 'NFA',
    input: "ababb",
    initialState: 'q0',
    acceptStates: ['q3'],
    transitions: [
      { from: 'q0', symbol: 'a', to: 'q0,q1' },
      { from: 'q0', symbol: 'b', to: 'q0' },
      { from: 'q1', symbol: 'b', to: 'q2' },
      { from: 'q2', symbol: 'b', to: 'q3' },
    ]
  },
  nfa_epsilon: {
    name: "NFA: (0|1)*00 épsilon",
    type: 'NFA',
    input: "100",
    initialState: 'q0',
    acceptStates: ['q2'],
    transitions: [
      { from: 'q0', symbol: '0', to: 'q0' },
      { from: 'q0', symbol: '1', to: 'q0' },
      { from: 'q0', symbol: 'ε', to: 'q1' },
      { from: 'q1', symbol: '0', to: 'q1' },
      { from: 'q1', symbol: '0', to: 'q2' },
    ]
  }
};
