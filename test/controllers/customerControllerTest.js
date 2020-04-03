const chaiHttp = require("chai-http");
const chai = require('chai');
const expect = chai.expect;
const faker = require('faker');
const truncate = require('../truncate');
const customerFactory = require('../../db/factories/customerFactory');
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

  // describe('update', () => {
  //   const name = faker.name.findName();
  //   const email = faker.internet.email();
  //   const phone = faker.phone.phoneNumber();
  //   const status = COURIER_STATUSES.INACTIVE;
  //
  //   it('should update courier', async () => {
  //     const courier = await courierFactory();
  //
  //     const res = await chai
  //       .request(app)
  //       .put(`${resourceEndpoint}/${courier.id}`)
  //       .send({
  //         name,
  //         email,
  //         currentDistrict: DISTRICTS.HOLOSIIVSKYI,
  //         phone,
  //         status
  //       });
  //
  //     const updatedCourier = await Courier.findByPk(courier.id);
  //     expect(res).to.have.status(200);
  //
  //     expect(updatedCourier.name).to.equal(name);
  //     expect(updatedCourier.email).to.equal(email);
  //     expect(updatedCourier.phone).to.equal(phone);
  //     expect(updatedCourier.status).to.equal(status);
  //     expect(updatedCourier.currentDistrict).to.equals(DISTRICTS.HOLOSIIVSKYI);
  //   });
  //
  //   it('should get validation errors', async () => {
  //     const courier = await courierFactory();
  //
  //     const res = await chai
  //       .request(app)
  //       .put(`${resourceEndpoint}/${courier.id}`)
  //       .send({});
  //     expect(res).to.have.status(422);
  //     expect(res.body.errors.length).to.equal(10)
  //   });
  //
  //   it('should get email validation errors', async () => {
  //     const courier1 = await courierFactory();
  //     const courier2 = await courierFactory();
  //
  //     const res = await chai
  //       .request(app)
  //       .put(`${resourceEndpoint}/${courier1.id}`)
  //       .send({
  //         name,
  //         email: courier2.email,
  //         currentDistrict: DISTRICTS.HOLOSIIVSKYI,
  //         phone,
  //         status
  //       });
  //     expect(res).to.have.status(422);
  //     expect(res.body.errors.length).to.equal(1)
  //   });
  //
  //   it('should not found courier', async () => {
  //     const courier = await courierFactory();
  //
  //     const res = await chai
  //       .request(app)
  //       .put(`${resourceEndpoint}/${courier.id+1}`)
  //       .send({
  //         name,
  //         email,
  //         currentDistrict: DISTRICTS.HOLOSIIVSKYI,
  //         phone,
  //         status
  //       });
  //     expect(res).to.have.status(404);
  //   });
  // })
  //
  // describe('delete', () => {
  //   it('should delete courier', async () => {
  //     const courier = await courierFactory();
  //
  //     const res = await chai
  //       .request(app)
  //       .delete(`${resourceEndpoint}/${courier.id}`)
  //       .send();
  //
  //     const total = await Courier.count();
  //     expect(res).to.have.status(204);
  //     expect(total).to.equal(0)
  //   });
  //
  //   it('should get validation error', async () => {
  //     const res = await chai
  //       .request(app)
  //       .delete(`${resourceEndpoint}/stringId`)
  //       .send();
  //
  //     expect(res).to.have.status(422);
  //   });
  //
  //   it('should not found courier', async () => {
  //     const courier = await courierFactory();
  //
  //     const res = await chai
  //       .request(app)
  //       .delete(`${resourceEndpoint}/${courier.id+1}`)
  //       .send();
  //
  //     const total = await Courier.count();
  //     expect(res).to.have.status(404);
  //     expect(total).to.equal(1)
  //   });
  //
  // });
});
