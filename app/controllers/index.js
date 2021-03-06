const courierController = require('./courier');
const restaurantController = require('./restaurant');
const customerController = require('./customer');
const orderController = require('./order');
const courierAnalyticsController = require('./courierAnalytics');

exports.init = api => {
  api.get('/', (req, res) => res.send('Glogo Api'));
  courierController.init(api);
  restaurantController.init(api);
  customerController.init(api);
  orderController.init(api);
  courierAnalyticsController.init(api);
};
