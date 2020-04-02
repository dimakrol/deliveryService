const courierController = require('./courier')

exports.init = api => {
  api.get('/', (req, res) => res.send('Glogo Api'))
  courierController.init(api)
};
