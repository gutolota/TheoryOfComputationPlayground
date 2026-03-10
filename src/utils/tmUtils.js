export const convertTmArrayToObject = (rulesArray) => {
  const obj = {};
  rulesArray.forEach(r => {
    if (!r.currentState || !r.readSymbol) return;
    const key = `${r.currentState}_${r.readSymbol}`;
    obj[key] = {
      nextState: r.nextState,
      write: r.writeSymbol,
      move: r.move === 'D' ? 1 : r.move === 'E' ? -1 : 0,
      rule: `Π(${r.currentState}, ${r.readSymbol}) = (${r.nextState}, ${r.writeSymbol}, ${r.move})`
    };
  });
  return obj;
};
