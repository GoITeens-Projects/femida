module.exports = (template) => {
  return (values) => {
    return template.replace(/{{(\w+)}}/g, (match, key) => {
      return values[key] !== undefined ? values[key] : match;
    });
  };
};
