module.exports = async (factory, times, data = {}) => {
  const models = [];
  for(let i = 0; i < times; i++) {
    const model = await factory(data);
    models.push(model);
  }
  return models;
};
