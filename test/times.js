module.exports = async (factory, times) => {
  const models = [];
  for(let i = 0; i < times; i++) {
    const model = await factory();
    models.push(model);
  }
  return models;
};
