const chaiHttp = require("chai-http");
const chai = require('chai');
const expect = chai.expect;
const truncate = require('../truncate');
const orderFactory = require('../../db/factories/orderFactory');
const customerFactory = require('../../db/factories/customerFactory');
const restaurantFactory = require('../../db/factories/restaurantFactory');
const courierFactory = require('../../db/factories/courierFactory');
const app = require('../../app');
const {apiV1} = require('../../config/constants');
const {ORDER_STATUSES, DISTRICTS} = require('../../config/constants');

chai.use(chaiHttp);

describe('courier analytics', () => {
  const resourceEndpoint = `${apiV1}/courier-analytics`;
  beforeEach(async () => {
    await truncate();
  });

  it('should return courier total delivered orders', async () => {
    const courier = await courierFactory();
    const restaurant = await restaurantFactory();
    const customer = await customerFactory();

    const orderRelations = {CustomerId: customer.id, RestaurantId: restaurant.id, CourierId: courier.id};
    await Promise.all([
      orderFactory({...orderRelations, status: ORDER_STATUSES.DELIVERED}),
      orderFactory({...orderRelations, status: ORDER_STATUSES.DELIVERED}),
      orderFactory({...orderRelations, status: ORDER_STATUSES.REJECTED})
    ]);

    const res = await chai
      .request(app)
      .get(`${resourceEndpoint}/${courier.id}/total-orders`);

    expect(res).to.have.status(200);
    expect(res.body.data.totalOrders).to.eq(2);
  });

  it('should return courier sum delivered orders', async () => {
    const courier = await courierFactory();
    const restaurant = await restaurantFactory();
    const customer = await customerFactory();

    const orderRelations = {CustomerId: customer.id, RestaurantId: restaurant.id, CourierId: courier.id};
    const [order1, order2, order3] = await Promise.all([
      orderFactory({...orderRelations, status: ORDER_STATUSES.DELIVERED}),
      orderFactory({...orderRelations, status: ORDER_STATUSES.DELIVERED}),
      orderFactory({...orderRelations, status: ORDER_STATUSES.REJECTED})
    ]);

    const res = await chai
      .request(app)
      .get(`${resourceEndpoint}/${courier.id}/sum-orders`);

    expect(res).to.have.status(200);
    expect(res.body.data.total).to.eq(order1.totalPrice + order2.totalPrice);
    expect(res.body.data.deliveredCostTotal).to.eq(order1.deliveryCost + order2.deliveryCost);
  });

  it('should return most popular courier\s district', async () => {
    const courier = await courierFactory();
    const restaurant = await restaurantFactory();
    const customer = await customerFactory();

    const orderRelations = {CustomerId: customer.id, RestaurantId: restaurant.id, CourierId: courier.id};
    await Promise.all([
      orderFactory({...orderRelations, status: ORDER_STATUSES.DELIVERED, district: DISTRICTS.PODILSKYI}),
      orderFactory({...orderRelations, status: ORDER_STATUSES.DELIVERED, district: DISTRICTS.PODILSKYI}),
      orderFactory({...orderRelations, status: ORDER_STATUSES.DELIVERED, district: DISTRICTS.DNIPROVSKYI}),
      orderFactory({...orderRelations, status: ORDER_STATUSES.REJECTED, district: DISTRICTS.PODILSKYI})
    ]);

    const res = await chai
      .request(app)
      .get(`${resourceEndpoint}/${courier.id}/populates-district`);

    expect(res).to.have.status(200);
    expect(res.body.data.district).to.eq(DISTRICTS.PODILSKYI);
    expect(res.body.data.maxCount).to.eq(2);
  });

  it('should return avg delivery time', async () => {
    const courier = await courierFactory();
    const restaurant = await restaurantFactory();
    const customer = await customerFactory();

    const orderRelations = {CustomerId: customer.id, RestaurantId: restaurant.id, CourierId: courier.id};
    const firstDate = new Date();
    const secondDate = new Date();
    const thirdDate = new Date();

    await Promise.all([
      orderFactory({...orderRelations, status: ORDER_STATUSES.DELIVERED,
        district: DISTRICTS.PODILSKYI, deliveredAt: firstDate.setMinutes(firstDate.getMinutes() - 50)}),
      orderFactory({...orderRelations, status: ORDER_STATUSES.DELIVERED,
        district: DISTRICTS.PODILSKYI, deliveredAt: secondDate.setMinutes(secondDate.getMinutes() - 60)}),
      orderFactory({...orderRelations, status: ORDER_STATUSES.REJECTED,
        district: DISTRICTS.OBOLONSKYI, deliveredAt: thirdDate.setMinutes(thirdDate.getMinutes() - 90)})
    ]);

    const res = await chai
      .request(app)
      .get(`${resourceEndpoint}/${courier.id}/avg-delivery-time`);

    expect(res).to.have.status(200);
    expect(res.body.data).to.eq("55 minutes");
  });
});
