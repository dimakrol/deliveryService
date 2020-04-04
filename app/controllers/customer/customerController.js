const { Customer, Order } = require('../../models');
const { defaultLimit } = require('../../../config/constants');
const bcrypt = require('bcrypt');


exports.indexAction = async (req, res) => {
  const {offset} = req.query;

  const [customers, total] = await Promise.all([
    Customer.findAll({
      attributes: {
        exclude: ['password']
      },
      offset: parseInt(offset) || 0,
      limit: defaultLimit
    }),
    Customer.count()]);

  res.json({data: customers, total})
};

exports.createAction = async (req, res) => {
  const { name, email, phone, district, address } = req.body;
  const password = await bcrypt.hash(req.body.password, 10);
  const customer = await Customer.create({name, email, password, phone, district, address});
  delete customer.password;
  res.status(201).json({data: customer});
};

exports.updateAction = async (req, res) => {
  const customer = await Customer.findByPk(req.params.id);
  if(!customer) {
    return res.status(404).send();
  }
  customer.name = req.body.name;
  customer.email = req.body.email;
  customer.phone = req.body.phone;
  customer.address = req.body.address;
  customer.district = req.body.district;
  if(req.body.password) {
    customer.password = await bcrypt.hash(req.body.password, 10);
  }
  await customer.save();
  delete customer.password;
  res.json({data: customer});
};

exports.deleteAction = async (req, res) => {
  const customer = await Customer.findByPk(req.params.id);
  if(!customer) {
    return res.status(404).send();
  }

  if(await Order.count({where: {CustomerId: customer.id}})) {
    return res.status(409).json({message: "Can't delete customers with orders!"})
  }

  await customer.destroy();
  res.status(204).send();
};
