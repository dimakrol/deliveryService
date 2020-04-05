const chaiHttp = require("chai-http");
const chai = require('chai');
const expect = chai.expect;
const faker = require('faker');
const truncate = require('../truncate');
const customerFactory = require('../../db/factories/customerFactory');
const orderFactory = require('../../db/factories/orderFactory');
const restaurantFactory = require('../../db/factories/restaurantFactory');
const times = require('../times');
const app = require('../../app');
const {defaultLimit, apiV1} = require('../../config/constants')
const {Customer} = require('../../app/models');
const {DISTRICTS} = require('../../config/constants');

chai.use(chaiHttp);

describe('customer resource', () => {
  const totalCustomers = 15;
  const resourceEndpoint = `${apiV1}/customer`;
  beforeEach(async () => {
    await truncate();
  });

  describe('index', () => {
    let customers;
    beforeEach(async () => {
      customers = await times(customerFactory, totalCustomers);
    });
    it('should return customers with total', async () => {
      const res = await chai
        .request(app)
        .get(resourceEndpoint);

      expect(res).to.have.status(200);
      expect(res.body.total).to.eq(totalCustomers);
      expect(res.body.data.length).to.eq(defaultLimit);
    });

    it('should return customers with offset', async () => {
      const res = await chai
        .request(app)
        .get(`${resourceEndpoint}?offset=10`);

      const offsetCustomers = await Customer.findAll({
        raw: true,
        offset: 10
      });

      offsetCustomers.forEach((customer) => {
        delete customer.password;
        customer.createdAt = customer.createdAt.toJSON();
        customer.updatedAt = customer.updatedAt.toJSON();
      });

      expect(res).to.have.status(200);
      expect(res.body.total).to.eq(totalCustomers);
      expect(res.body.data).to.eql(offsetCustomers);
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
    it('should get customer', async () => {
      const {id} = await customerFactory();

      const res = await chai
        .request(app)
        .get(`${resourceEndpoint}/${id}`);

      const customer = await Customer.findByPk(id, {raw: true});
      delete customer.password;
      customer.createdAt = customer.createdAt.toJSON();
      customer.updatedAt = customer.updatedAt.toJSON()

      expect(res).to.have.status(200);
      expect(res.body.data).to.eql(customer)
    });

    it('should get validation error', async () => {
      const res = await chai
        .request(app)
        .get(`${resourceEndpoint}/stringId`);

      expect(res).to.have.status(422);
    });

    it('should not found customer', async () => {
      const customer = await customerFactory();

      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/${customer.id+1}`)
        .send();

      const total = await Customer.count();
      expect(res).to.have.status(404);
      expect(total).to.equal(1)
    });
  });

  describe('create', () => {
    const name = faker.name.findName();
    const email = faker.internet.email();
    const phone = faker.phone.phoneNumber();
    const address = faker.address.streetAddress();
    const district = DISTRICTS.PODILSKYI;

    it('should create courier', async () => {
      const res = await chai
        .request(app)
        .post(resourceEndpoint)
        .send({
          name,
          email,
          password: faker.internet.password(),
          phone,
          address,
          district,
        });
      expect(res.status).to.equal(201);

      const customer = await Customer.findOne();
      expect(customer.name).to.equal(name);
      expect(customer.email).to.equal(email);
      expect(customer.phone).to.equal(phone);
      expect(customer.address).to.equal(address);
      expect(customer.district).to.equals(district);
    });

    it('should email validation error', async () => {
      await customerFactory({email});

      const res = await chai
        .request(app)
        .post(resourceEndpoint)
        .send({
          name,
          email: email,
          password: faker.internet.password(),
          phone,
          address,
          district
        });

      expect(res.status).to.equals(422);
      expect(res.body.errors.length).to.equals(1);
    });

    it('should get validation errors', async () => {
      const res = await chai
        .request(app)
        .post(resourceEndpoint)
        .send({
          name,
          email,
          password: faker.internet.password()
        });

      expect(res.status).to.equals(422);
      expect(res.body.errors.length).to.equals(6);
    });
  });

  describe('update', () => {
    const name = faker.name.findName();
    const email = faker.internet.email();
    const phone = faker.phone.phoneNumber();
    const address = faker.address.streetAddress();
    const district = DISTRICTS.PODILSKYI;

    it('should update customer', async () => {
      const customer = await customerFactory();

      const res = await chai
        .request(app)
        .put(`${resourceEndpoint}/${customer.id}`)
        .send({
          name,
          email,
          phone,
          address,
          district
        });

      const updatedCustomer = await Customer.findByPk(customer.id);
      expect(res).to.have.status(200);

      expect(updatedCustomer.name).to.equal(name);
      expect(updatedCustomer.email).to.equal(email);
      expect(updatedCustomer.phone).to.equal(phone);
      expect(updatedCustomer.address).to.equal(address);
      expect(updatedCustomer.district).to.equals(district);
    });

    it('should get validation errors', async () => {
      const customer = await customerFactory();

      const res = await chai
        .request(app)
        .put(`${resourceEndpoint}/${customer.id}`)
        .send({});
      expect(res).to.have.status(422);
      expect(res.body.errors.length).to.equal(10)
    });

    it('should get email validation errors', async () => {
      const customer1 = await customerFactory();
      const customer2 = await customerFactory();

      const res = await chai
        .request(app)
        .put(`${resourceEndpoint}/${customer1.id}`)
        .send({
          name,
          email: customer2.email,
          phone,
          address,
          district
        });
      expect(res).to.have.status(422);
      expect(res.body.errors.length).to.equal(1)
    });

    it('should not found customer', async () => {
      const customer = await customerFactory();

      const res = await chai
        .request(app)
        .put(`${resourceEndpoint}/${customer.id+1}`)
        .send({
          name,
          email,
          phone,
          address,
          district
        });
      expect(res).to.have.status(404);
    });
  })

  describe('delete', () => {
    it('should delete customer', async () => {
      const courier = await customerFactory();

      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/${courier.id}`)
        .send();

      const total = await Customer.count();
      expect(res).to.have.status(204);
      expect(total).to.equal(0)
    });

    it('should not delete customer', async () => {
      const restaurant = await restaurantFactory();
      const customer = await customerFactory();
      await orderFactory({
        CustomerId: customer.id,
        RestaurantId: restaurant.id,
      });

      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/${customer.id}`)
        .send();

      const total = await Customer.count();
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

    it('should not found courier', async () => {
      const customer = await customerFactory();

      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/${customer.id+1}`)
        .send();

      const total = await Customer.count();
      expect(res).to.have.status(404);
      expect(total).to.equal(1)
    });

  });
});
