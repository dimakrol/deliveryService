const chaiHttp = require("chai-http");
const chai = require('chai');
const expect = chai.expect;
const faker = require('faker');
const truncate = require('../truncate');
const restaurantFactory = require('../../db/factories/restaurantFactory');
const customerFactory = require('../../db/factories/customerFactory');
const orderFactory = require('../../db/factories/orderFactory');
const times = require('../times');
const app = require('../../app');
const {defaultLimit, apiV1} = require('../../config/constants')
const {Restaurant} = require('../../app/models');
const {DISTRICTS} = require('../../config/constants');

chai.use(chaiHttp);

describe('restaurant resource', () => {
  const totalRestaurants = 20;
  const resourceEndpoint = `${apiV1}/restaurant`;
  beforeEach(async () => {
    await truncate();
  });

  describe('index', () => {
    let restaurants;
    beforeEach(async () => {
      restaurants = await times(restaurantFactory, totalRestaurants);
    });
    it('should return restaurants with total', async () => {
      const res = await chai
        .request(app)
        .get(resourceEndpoint);

      expect(res).to.have.status(200);
      expect(res.body.total).to.eq(totalRestaurants);
      expect(res.body.data.length).to.eq(defaultLimit);
    });

    it('should return restaurants with offset', async () => {
      const res = await chai
        .request(app)
        .get(`${resourceEndpoint}?offset=10`);

      const offsetRestaurants = await Restaurant.findAll({
        raw: true,
        offset: 10
      });

      offsetRestaurants.forEach((restaurant) => {
        restaurant.createdAt = restaurant.createdAt.toJSON();
        restaurant.updatedAt = restaurant.updatedAt.toJSON();
      });

      expect(res).to.have.status(200);
      expect(res.body.total).to.eq(totalRestaurants);
      expect(res.body.data).to.eql(offsetRestaurants);
    });

    it('should return invalid offset error', async () => {
      const res = await chai
        .request(app)
        .get(`${resourceEndpoint}?offset=invalidOffset`);

      expect(res).to.have.status(422);
      expect(res.body.errors.length).to.equals(1);
    });
  });

  describe('show', () => {
    it('should get restaurant', async () => {
      const {id} = await restaurantFactory();

      const res = await chai
        .request(app)
        .get(`${resourceEndpoint}/${id}`);

      const restaurant = await Restaurant.findByPk(id, {raw: true});
      restaurant.createdAt = restaurant.createdAt.toJSON();
      restaurant.updatedAt = restaurant.updatedAt.toJSON()

      expect(res).to.have.status(200);
      expect(res.body.data).to.eql(restaurant)
    });

    it('should get validation error', async () => {
      const res = await chai
        .request(app)
        .get(`${resourceEndpoint}/stringId`);

      expect(res).to.have.status(422);
    });

    it('should not found restaurant', async () => {
      const restaurant = await restaurantFactory();

      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/${restaurant.id+1}`)
        .send();

      const total = await Restaurant.count();
      expect(res).to.have.status(404);
      expect(total).to.equal(1)
    });
  });

  describe('create', () => {
    const title = faker.company.companyName();
    const district = DISTRICTS.DNIPROVSKYI;
    const address =faker.address.streetAddress();

    it('should create restaurant', async () => {
      const res = await chai
        .request(app)
        .post(resourceEndpoint)
        .send({
          title,
          district,
          address
        });

      expect(res.status).to.equal(201);
      const restaurant = await Restaurant.findOne();
      expect(restaurant.title).to.equal(title);
      expect(restaurant.district).to.equal(district);
      expect(restaurant.address).to.equal(address);
    });

    it('should get validation errors', async () => {
      const res = await chai
        .request(app)
        .post(resourceEndpoint)
        .send({
          title,
        });

      expect(res.status).to.equals(422);
      expect(res.body.errors.length).to.equals(4);
    });
  });

  describe('update', () => {
    const title = faker.company.companyName();
    const district = DISTRICTS.DNIPROVSKYI;
    const address = faker.address.streetAddress();

    it('should update restaurant', async () => {
      const restaurant = await restaurantFactory();

      const res = await chai
        .request(app)
        .put(`${resourceEndpoint}/${restaurant.id}`)
        .send({
          title,
          district,
          address
        });

      const updatedRestaurant = await Restaurant.findByPk(restaurant.id);
      expect(res).to.have.status(200);

      expect(updatedRestaurant.title).to.equal(title);
      expect(updatedRestaurant.district).to.equal(district);
      expect(updatedRestaurant.address).to.equal(address);
    });

    it('should get validation errors', async () => {
      const restaurant = await restaurantFactory();

      const res = await chai
        .request(app)
        .put(`${resourceEndpoint}/${restaurant.id}`)
        .send({});
      expect(res).to.have.status(422);
      expect(res.body.errors.length).to.equal(6)
    });

    it('should not found restaurant', async () => {
      const restaurant = await restaurantFactory();

      const res = await chai
        .request(app)
        .put(`${resourceEndpoint}/${restaurant.id+1}`)
        .send({
          title,
          district,
          address
        });
      expect(res).to.have.status(404);
    });
  });
  describe('delete', () => {
    it('should delete restaurant', async () => {
      const restaurant = await restaurantFactory();

      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/${restaurant.id}`)
        .send();

      const total = await Restaurant.count();
      expect(res).to.have.status(204);
      expect(total).to.equal(0)
    });

    it('should not delete restaurant', async () => {
      const restaurant = await restaurantFactory();
      const customer = await customerFactory();
      await orderFactory({
        CustomerId: customer.id,
        RestaurantId: restaurant.id,
      });

      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/${restaurant.id}`)
        .send();

      const total = await Restaurant.count();
      expect(res).to.have.status(409);
      expect(total).to.equal(1)
    });

    it('should get validation error', async () => {
      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/stringId`)
        .send();

      expect(res).to.have.status(422);
    });

    it('should not found restaurant', async () => {
      const restaurant = await restaurantFactory();

      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/${restaurant.id+1}`)
        .send();

      const total = await Restaurant.count();
      expect(res).to.have.status(404);
      expect(total).to.equal(1)
    });
  });
});
