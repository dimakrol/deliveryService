const { Courier, Order } = require('../../models');
const {ORDER_STATUSES} = require('../../../config/constants');
const sequelize = require('sequelize');

exports.totalOrdersAction = async (req, res) => {
  const courier = await Courier.findByPk(req.params.id);

  if(!courier) {
    return res.status(404).send();
  }

  const finishedOrdersTotal = await Order.count({
    where: {CourierId: courier.id, status: ORDER_STATUSES.DELIVERED},
  });

  res.json({data: {totalOrders: finishedOrdersTotal}})
};

exports.sumDeliveredAction = async (req, res) => {
  const courier = await Courier.findByPk(req.params.id);

  if(!courier) {
    return res.status(404).send();
  }

  const finishedOrders = await Order.findOne({
    where: {CourierId: courier.id, status: ORDER_STATUSES.DELIVERED},
    attributes: [
      [sequelize.fn('sum', sequelize.col('totalPrice')), 'total'],
      [sequelize.fn('sum', sequelize.col('deliveryCost')), 'sumDeliveredCost']
    ],
    raw: true,
  });

  res.json({data: {total: finishedOrders.total, deliveredCostTotal: finishedOrders.sumDeliveredCost}});
};

exports.populatesDistrictAction = async (req, res) => {
  const courier = await Courier.findByPk(req.params.id);

  if(!courier) {
    return res.status(404).send();
  }

  const finishedOrders = await Order.findOne({
    where: {CourierId: courier.id, status: ORDER_STATUSES.DELIVERED},
    attributes: ['district', [sequelize.fn('count', sequelize.col('id')), 'count']],
    group : ['district'],
    raw: true,
    order: sequelize.literal('count DESC')
  });

  res.json({data: {district: finishedOrders.district, maxCount: finishedOrders.count}});
};

exports.avgDeliveryTimeAction = async (req, res) => {
  const courier = await Courier.findByPk(req.params.id);

  if(!courier) {
    return res.status(404).send();
  }

  const finishedOrders = await Order.findOne({
    where: {CourierId: courier.id, status: ORDER_STATUSES.DELIVERED},
    attributes: [
      [sequelize.fn('avg',
        sequelize.fn('TIMESTAMPDIFF', sequelize.literal('MINUTE'), sequelize.col('deliveredAt'), sequelize.col('createdAt'))
      ), 'deliveredTimeAvg']
    ],
    raw: true
  });

  res.json({data: parseFloat(finishedOrders.deliveredTimeAvg) + ' minutes'});
};
