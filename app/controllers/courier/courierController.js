const { Courier, Order } = require('../../models');
const { defaultLimit } = require('../../../config/constants');
const bcrypt = require('bcrypt');


exports.indexAction = async (req, res) => {
  const {offset} = req.query;

  const [couriers, total] = await Promise.all([
    Courier.findAll({
      attributes: {
        exclude: ['password']
      },
      offset: parseInt(offset) || 0,
      limit: defaultLimit
    }),
    Courier.count()]);

  res.json({data: couriers, total})
};

exports.createAction = async (req, res) => {
  const { name, email, phone, status } = req.body;
  const password = await bcrypt.hash(req.body.password, 10);
  const courier = await Courier.create({name, email, password, phone, status});
  delete courier.password;
  res.status(201).json({data: courier});
};

exports.updateAction = async (req, res) => {
  const courier = await Courier.findByPk(req.params.id);
  if(!courier) {
    return res.status(404).send();
  }
  courier.name = req.body.name;
  courier.email = req.body.email;
  courier.phone = req.body.phone;
  courier.status = req.body.status;
  courier.currentDistrict = req.body.currentDistrict;
  if(req.body.password) {
    courier.password = await bcrypt.hash(req.body.password, 10);
  }
  await courier.save();
  delete courier.password;
  res.json({data: courier});
};

exports.deleteAction = async (req, res) => {
  const courier = await Courier.findByPk(req.params.id);

  if(!courier) {
    return res.status(404).send();
  }

  if(await Order.count({where: {CourierId: courier.id}})) {
    return res.status(409).json({message: "Can't delete courier with orders!"})
  }

  await courier.destroy();
  res.status(204).send();
};
