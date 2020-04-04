const models = require('../app/models');
module.exports = async function truncate() {
  await models['Order'].destroy({ where: {}, force: true });
  return await Promise.all(
    Object.keys(models).map((key) => {
      if (['sequelize', 'Sequelize', 'Orders'].includes(key)) return null;
      return models[key].destroy({ where: {}, force: true });
    })
  );
};

