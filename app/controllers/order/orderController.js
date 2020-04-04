const { Order } = require('../../models');
const { defaultLimit } = require('../../../config/constants');

exports.indexAction = async (req, res) => {
  const {offset} = req.query;

  const [orders, total] = await Promise.all([
    Order.findAll({
      offset: parseInt(offset) || 0,
      limit: defaultLimit
    }),
    Order.count()]);

  res.json({data: orders, total})
};

exports.createAction = async (req, res) => {
  const { status, district, address, deliveredAt, deliveryCost,
    totalPrice, CustomerId, RestaurantId, CourierId } = req.body;

  const order = await Order.create({status, district, address, deliveredAt,
    deliveryCost, totalPrice, CustomerId, RestaurantId, CourierId});

  res.status(201).json({data: order});
};

exports.updateAction = async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if(!order) {
    return res.status(404).send();
  }

  order.status = req.body.status;
  order.district = req.body.district;
  order.address = req.body.address;
  order.deliveredAt = req.body.deliveredAt;
  order.deliveryCost = req.body.deliveryCost;
  order.totalPrice = req.body.totalPrice;
  order.CustomerId = req.body.CustomerId;
  order.RestaurantId = req.body.RestaurantId;
  order.CourierId = req.body.CourierId;

  await order.save();

  res.json({data: order});
};

exports.deleteAction = async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if(!order) {
    return res.status(404).send();
  }
  await order.destroy();
  res.status(204).send();
};
