const chaiHttp = require("chai-http");
const chai = require('chai');
const expect = chai.expect;
const faker = require('faker');
const truncate = require('../truncate');
const customerFactory = require('../../db/factories/customerFactory');
const restaurantFactory = require('../../db/factories/restaurantFactory');
const orderFactory = require('../../db/factories/orderFactory');
const times = require('../times');
const app = require('../../app');
const {defaultLimit, apiV1} = require('../../config/constants')
const {Order} = require('../../app/models');
const {ORDER_STATUSES, DISTRICTS} = require('../../config/constants');

chai.use(chaiHttp);

describe('order resource', () => {
  const totalOrders = 20;
  const resourceEndpoint = `${apiV1}/order`;
  beforeEach(async () => {
    await truncate();
  });

  describe('index', () => {
    let orders;
    beforeEach(async () => {
      const customer = await customerFactory();
      const restaurant = await restaurantFactory();
      orders = await times(orderFactory, totalOrders, {
        CustomerId: customer.id,
        RestaurantId: restaurant.id
      });
    });
    it('should return orders with total', async () => {
      const res = await chai
        .request(app)
        .get(resourceEndpoint);

      expect(res).to.have.status(200);
      expect(res.body.total).to.eq(totalOrders);
      expect(res.body.data.length).to.eq(defaultLimit);
    });

    it('should return orders with offset', async () => {
      const res = await chai
        .request(app)
        .get(`${resourceEndpoint}?offset=10`);

      const offsetOrders = await Order.findAll({
        raw: true,
        offset: 10
      });

      offsetOrders.forEach((order) => {
        order.deliveredAt = order.deliveredAt.toJSON();
        order.createdAt = order.createdAt.toJSON();
        order.updatedAt = order.updatedAt.toJSON();
      });

      expect(res).to.have.status(200);
      expect(res.body.total).to.eq(totalOrders);
      expect(res.body.data).to.eql(offsetOrders);
    });

    it('should return invalid offset error', async () => {
      const res = await chai
        .request(app)
        .get(`${resourceEndpoint}?offset=invalidOffset`);

      expect(res).to.have.status(422);
      expect(res.body.errors.length).to.equals(1);
    });
  });

  describe('create', () => {
    const status = ORDER_STATUSES.NEW;
    const district = DISTRICTS.OBOLONSKYI;
    const address = faker.address.streetAddress();
    const deliveredAt = Date.now();
    const deliveryCost = faker.random.number({min:50, max:200});
    const totalPrice = faker.random.number({min:50, max:1000});

    it('should create order', async () => {
      const customer = await customerFactory();
      const restaurant = await restaurantFactory();

      const res = await chai
        .request(app)
        .post(resourceEndpoint)
        .send({
          status,
          district,
          address,
          deliveredAt,
          deliveryCost,
          totalPrice,
          CustomerId: customer.id,
          RestaurantId: restaurant.id,
        });

      expect(res.status).to.equal(201);

      const total = await Order.count();
      const order = await Order.findOne();
      expect(total).to.equal(1);

      expect(order.status).to.equal(status);
      expect(order.district).to.equal(district);
      expect(order.address).to.equal(address);
      expect(order.deliveryCost).to.equal(deliveryCost);
      expect(order.totalPrice).to.equal(totalPrice);
      expect(order.CustomerId).to.equal(customer.id);
      expect(order.RestaurantId).to.equal(restaurant.id);
    });

    it('should get undefined entities errors', async () => {
      const customer = await customerFactory();
      const restaurant = await restaurantFactory();
      const res = await chai
        .request(app)
        .post(resourceEndpoint)
        .send({
          status,
          district,
          address,
          deliveredAt,
          deliveryCost,
          totalPrice,
          CustomerId: customer.id+1,
          RestaurantId: restaurant.id+1,
        });

      expect(res.status).to.equals(422);
      expect(res.body.errors.length).to.equals(2);
    });

    it('should get validation errors', async () => {
      const res = await chai
        .request(app)
        .post(resourceEndpoint)
        .send({
          status,
          district,
          address,
          deliveredAt,
        });

      expect(res.status).to.equals(422);
      expect(res.body.errors.length).to.equals(8);
    });
  });

  describe('update', () => {
    const status = ORDER_STATUSES.NEW;
    const district = DISTRICTS.OBOLONSKYI;
    const address = faker.address.streetAddress();
    const deliveredAt = Date.now();
    const deliveryCost = faker.random.number({min:50, max:200});
    const totalPrice = faker.random.number({min:50, max:1000});

    it('should update order', async () => {
      const customer = await customerFactory();
      const restaurant = await restaurantFactory();
      const order = await orderFactory({
        CustomerId: customer.id,
        RestaurantId: restaurant.id
      });

      const res = await chai
        .request(app)
        .put(`${resourceEndpoint}/${order.id}`)
        .send({
          status,
          district,
          address,
          deliveredAt,
          deliveryCost,
          totalPrice,
          CustomerId: customer.id,
          RestaurantId: restaurant.id,
        });

      expect(res.status).to.equal(200);

      const total = await Order.count();
      const orderUpdated = await Order.findOne();
      expect(total).to.equal(1);

      expect(orderUpdated.status).to.equal(status);
      expect(orderUpdated.district).to.equal(district);
      expect(orderUpdated.address).to.equal(address);
      expect(orderUpdated.deliveryCost).to.equal(deliveryCost);
      expect(orderUpdated.totalPrice).to.equal(totalPrice);
      expect(orderUpdated.CustomerId).to.equal(customer.id);
      expect(orderUpdated.RestaurantId).to.equal(restaurant.id);
    });

    it('should get undefined entities errors', async () => {
      const customer = await customerFactory();
      const restaurant = await restaurantFactory();
      const order = await orderFactory({
        CustomerId: customer.id,
        RestaurantId: restaurant.id
      });

      const res = await chai
        .request(app)
        .put(`${resourceEndpoint}/${order.id}`)
        .send({
          status,
          district,
          address,
          deliveredAt,
          deliveryCost,
          totalPrice,
          CustomerId: customer.id+1,
          RestaurantId: restaurant.id+1,
        });

      expect(res.status).to.equals(422);
      expect(res.body.errors.length).to.equals(2);
    });

    it('should get validation errors', async () => {
      const customer = await customerFactory();
      const restaurant = await restaurantFactory();
      const order = await orderFactory({
        CustomerId: customer.id,
        RestaurantId: restaurant.id
      });

      const res = await chai
        .request(app)
        .put(`${resourceEndpoint}/${order.id}`)
        .send({
          status,
          district,
          address,
          deliveredAt,
        });

      expect(res.status).to.equals(422);
      expect(res.body.errors.length).to.equals(8);
    });

    it('should not found order', async () => {
      const customer = await customerFactory();
      const restaurant = await restaurantFactory();
      const order = await orderFactory({
        CustomerId: customer.id,
        RestaurantId: restaurant.id
      });

      const res = await chai
        .request(app)
        .put(`${resourceEndpoint}/${order.id+1}`)
        .send({
          status,
          district,
          address,
          deliveredAt,
          deliveryCost,
          totalPrice,
          CustomerId: customer.id,
          RestaurantId: restaurant.id,
        });
      expect(res).to.have.status(404);
    });
  });

  describe('delete', () => {
    it('should delete order', async () => {
      const customer = await customerFactory();
      const restaurant = await restaurantFactory();
      const order = await orderFactory({
        CustomerId: customer.id,
        RestaurantId: restaurant.id
      });

      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/${order.id}`)
        .send();

      const total = await Order.count();
      expect(res).to.have.status(204);
      expect(total).to.equal(0)
    });

    it('should get validation error', async () => {
      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/stringId`)
        .send();

      expect(res).to.have.status(422);
    });

    it('should not found courier', async () => {
      const customer = await customerFactory();
      const restaurant = await restaurantFactory();
      const order = await orderFactory({
        CustomerId: customer.id,
        RestaurantId: restaurant.id
      });

      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/${order.id+1}`)
        .send();

      const total = await Order.count();
      expect(res).to.have.status(404);
      expect(total).to.equal(1)
    });
  });
});
