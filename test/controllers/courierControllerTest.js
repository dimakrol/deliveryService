const chaiHttp = require("chai-http");
const chai = require('chai');
const expect = chai.expect;
const faker = require('faker');
const truncate = require('../truncate');
const orderFactory = require('../../db/factories/orderFactory');
const customerFactory = require('../../db/factories/customerFactory');
const restaurantFactory = require('../../db/factories/restaurantFactory');
const courierFactory = require('../../db/factories/courierFactory');
const times = require('../times');
const app = require('../../app');
const {defaultLimit, apiV1} = require('../../config/constants')
const {Courier} = require('../../app/models');
const {COURIER_STATUSES, DISTRICTS} = require('../../config/constants');

chai.use(chaiHttp);

describe('courier resource', () => {
  const totalCouriers = 20;
  const resourceEndpoint = `${apiV1}/courier`;
  beforeEach(async () => {
    await truncate();
  });

  describe('index', () => {
    let couriers;
    beforeEach(async () => {
      couriers = await times(courierFactory, totalCouriers);
    });
    it('should return couriers with total', async () => {
      const res = await chai
        .request(app)
        .get(resourceEndpoint);

      expect(res).to.have.status(200);
      expect(res.body.total).to.eq(totalCouriers);
      expect(res.body.data.length).to.eq(defaultLimit);
    });

    it('should return couriers with offset', async () => {
      const res = await chai
        .request(app)
        .get(`${resourceEndpoint}?offset=10`);

      const offsetCouriers = await Courier.findAll({
        raw: true,
        offset: 10
      });

      offsetCouriers.forEach((courier) => {
        delete courier.password;
        courier.createdAt = courier.createdAt.toJSON();
        courier.updatedAt = courier.updatedAt.toJSON();
      });

      expect(res).to.have.status(200);
      expect(res.body.total).to.eq(totalCouriers);
      expect(res.body.data).to.eql(offsetCouriers);
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
    it('should get courier', async () => {
      const {id} = await courierFactory();

      const res = await chai
        .request(app)
        .get(`${resourceEndpoint}/${id}`);
      const courier = await Courier.findByPk(id, {raw: true});
      delete courier.password;
      courier.createdAt = courier.createdAt.toJSON();
      courier.updatedAt = courier.updatedAt.toJSON()

      expect(res).to.have.status(200);
      expect(res.body.data).to.eql(courier)
    });

    it('should get validation error', async () => {
      const res = await chai
        .request(app)
        .get(`${resourceEndpoint}/stringId`);

      expect(res).to.have.status(422);
    });

    it('should not found courier', async () => {
      const courier = await courierFactory();

      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/${courier.id+1}`)
        .send();

      const total = await Courier.count();
      expect(res).to.have.status(404);
      expect(total).to.equal(1)
    });
  });

  describe('create', () => {
    const name = faker.name.findName();
    const email = faker.internet.email();
    const phone = faker.phone.phoneNumber();
    const status = COURIER_STATUSES.INACTIVE;

    it('should create courier', async () => {
      const res = await chai
        .request(app)
        .post(resourceEndpoint)
        .send({
          name,
          email,
          password: faker.internet.password(),
          phone,
          status,
        });
      expect(res.status).to.equal(201);

      const courier = await Courier.findOne();
      expect(courier.name).to.equal(name);
      expect(courier.email).to.equal(email);
      expect(courier.phone).to.equal(phone);
      expect(courier.status).to.equal(status);
      expect(courier.currentDistrict).to.equals(null);
    });

    it('should email validation error', async () => {
      await courierFactory({email});

      const res = await chai
        .request(app)
        .post(resourceEndpoint)
        .send({
          name,
          email: email,
          password: faker.internet.password(),
          phone,
          status
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
      expect(res.body.errors.length).to.equals(4);
    });
  });

  describe('update', () => {
    const name = faker.name.findName();
    const email = faker.internet.email();
    const phone = faker.phone.phoneNumber();
    const status = COURIER_STATUSES.INACTIVE;

    it('should update courier', async () => {
      const courier = await courierFactory();

      const res = await chai
        .request(app)
        .put(`${resourceEndpoint}/${courier.id}`)
        .send({
          name,
          email,
          currentDistrict: DISTRICTS.HOLOSIIVSKYI,
          phone,
          status
        });

      const updatedCourier = await Courier.findByPk(courier.id);
      expect(res).to.have.status(200);

      expect(updatedCourier.name).to.equal(name);
      expect(updatedCourier.email).to.equal(email);
      expect(updatedCourier.phone).to.equal(phone);
      expect(updatedCourier.status).to.equal(status);
      expect(updatedCourier.currentDistrict).to.equals(DISTRICTS.HOLOSIIVSKYI);
    });

    it('should get validation errors', async () => {
      const courier = await courierFactory();

      const res = await chai
        .request(app)
        .put(`${resourceEndpoint}/${courier.id}`)
        .send({});
      expect(res).to.have.status(422);
      expect(res.body.errors.length).to.equal(10)
    });

    it('should get email validation errors', async () => {
      const courier1 = await courierFactory();
      const courier2 = await courierFactory();

      const res = await chai
        .request(app)
        .put(`${resourceEndpoint}/${courier1.id}`)
        .send({
          name,
          email: courier2.email,
          currentDistrict: DISTRICTS.HOLOSIIVSKYI,
          phone,
          status
        });
      expect(res).to.have.status(422);
      expect(res.body.errors.length).to.equal(1)
    });

    it('should not found courier', async () => {
      const courier = await courierFactory();

      const res = await chai
        .request(app)
        .put(`${resourceEndpoint}/${courier.id+1}`)
        .send({
          name,
          email,
          currentDistrict: DISTRICTS.HOLOSIIVSKYI,
          phone,
          status
        });
      expect(res).to.have.status(404);
    });
  });

  describe('delete', () => {
    it('should delete courier', async () => {
      const courier = await courierFactory();

      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/${courier.id}`)
        .send();

      const total = await Courier.count();
      expect(res).to.have.status(204);
      expect(total).to.equal(0)
    });

    it('should not delete courier', async () => {
      const courier = await courierFactory();
      const restaurant = await restaurantFactory();
      const customer = await customerFactory();
      await orderFactory({
        CustomerId: customer.id,
        RestaurantId: restaurant.id,
        CourierId: courier.id
      });


      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/${courier.id}`)
        .send();

      const total = await Courier.count();
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
      const courier = await courierFactory();

      const res = await chai
        .request(app)
        .delete(`${resourceEndpoint}/${courier.id+1}`)
        .send();

      const total = await Courier.count();
      expect(res).to.have.status(404);
      expect(total).to.equal(1)
    });

  });
});
