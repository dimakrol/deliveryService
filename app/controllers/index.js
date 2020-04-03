const courierController = require('./courier')
const restaurantController = require('./restaurant')

exports.init = api => {
  api.get('/', (req, res) => res.send('Glogo Api'))
  courierController.init(api)
  restaurantController.init(api)
};
