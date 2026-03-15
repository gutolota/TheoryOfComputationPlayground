
/**
 * Computa o fecho-épsilon para um conjunto de estados.
 * @param {Set<string>} states Conjunto de estados atuais.
 * @param {Array} transitions Lista de transições [{from, symbol, to}].
 * @returns {Set<string>} Novo conjunto de estados incluindo transições ε.
 */
export const getEpsilonClosure = (states, transitions) => {
  const closure = new Set(states);
  const stack = Array.from(states);

  while (stack.length > 0) {
    const state = stack.pop();
    const epsilonTransitions = transitions.filter(
      (t) => t.from === state && (t.symbol === 'ε' || t.symbol === '' || t.symbol === 'empty')
    );

    for (const t of epsilonTransitions) {
      const targets = t.to.split(',').map((s) => s.trim());
      for (const target of targets) {
        if (!closure.has(target)) {
          closure.add(target);
          stack.push(target);
        }
      }
    }
  }

  return closure;
};

/**
 * Realiza um passo de transição no NFA.
 * @param {Set<string>} currentStates Estados ativos atuais.
 * @param {string} symbol Símbolo lido.
 * @param {Array} transitions Lista de transições.
 * @returns {Set<string>} Novos estados ativos.
 */
export const nfaStep = (currentStates, symbol, transitions) => {
  const nextStates = new Set();

  for (const state of currentStates) {
    const matchingTransitions = transitions.filter(
      (t) => t.from === state && t.symbol === symbol
    );

    for (const t of matchingTransitions) {
      const targets = t.to.split(',').map((s) => s.trim());
      for (const target of targets) {
        nextStates.add(target);
      }
    }
  }

  return getEpsilonClosure(nextStates, transitions);
};

/**
 * Converte a lista de transições do usuário em um formato otimizado para o simulador.
 */
export const prepareAutomataTransitions = (transitions) => {
  return transitions.map(t => ({
    from: t.from.trim(),
    symbol: t.symbol.trim(),
    to: t.to.trim()
  }));
};
