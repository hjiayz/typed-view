const CondList = (condList, optionalConditions) => ({
  condList: condList,
  optionalConditions: optionalConditions,
});
const Cond = () => (name, define, label, getLabel, autoComplete) => ({
  name,
  define,
  label,
  getLabel,
  autoComplete,
});

export {CondList, Cond};
