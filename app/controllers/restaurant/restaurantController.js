const { Restaurant, Order } = require('../../models');
const { defaultLimit } = require('../../../config/constants');

exports.indexAction = async (req, res) => {
  const {offset} = req.query;

  const [restaurants, total] = await Promise.all([
    Restaurant.findAll({
      offset: parseInt(offset) || 0,
      limit: defaultLimit
    }),
    Restaurant.count()]);

  res.json({data: restaurants, total})
};

exports.createAction = async (req, res) => {
  const { title, district, address } = req.body;
  const restaurant = await Restaurant.create({title, district, address});
  res.status(201).json({data: restaurant});
};

exports.updateAction = async (req, res) => {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if(!restaurant) {
    return res.status(404).send();
  }
  restaurant.title = req.body.title;
  restaurant.district = req.body.district;
  restaurant.address = req.body.address;
  await restaurant.save();
  res.json({data: restaurant});
};

exports.deleteAction = async (req, res) => {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if(!restaurant) {
    return res.status(404).send();
  }

  if(await Order.count({where: {RestaurantId: restaurant.id}})) {
    return res.status(409).json({message: "Can't delete restaurant with orders!"})
  }
  await restaurant.destroy();
  res.status(204).send();
};
