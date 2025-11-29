function shouldShowQuestion(rules, answersSoFar) {
  if (!rules) return true;

  const { logic, conditions } = rules;

  let result = logic === 'AND';

  for (const condition of conditions) {
    const { questionKey, operator, value } = condition;
    const answer = answersSoFar[questionKey];

    if (answer === undefined) continue; // missing values don't crash

    let conditionMet = false;

    switch (operator) {
      case 'equals':
        conditionMet = answer === value;
        break;
      case 'notEquals':
        conditionMet = answer !== value;
        break;
      case 'contains':
        conditionMet = typeof answer === 'string' && answer.includes(value);
        break;
      default:
        conditionMet = false;
    }

    if (logic === 'AND') {
      result = result && conditionMet;
    } else {
      result = result || conditionMet;
    }
  }

  return result;
}

module.exports = { shouldShowQuestion };