const faker = require('faker');
const models = require('../../app/models');
const {DISTRICTS} = require('../../config/constants');
/**
 *
 * @param  {Object} props Properties to use for the Customer.
 *
 * @return {Object} An object to build the customer from.
 */
const data = async (props = {}) => {
  const defaultProps = {
    name: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    phone: faker.phone.phoneNumber(),
    address: faker.address.streetAddress(),
    district: faker.random.arrayElement(
      Object.values(DISTRICTS)
    )
  };

  return Object.assign({}, defaultProps, props);
};

/**
 *
 * @param  {Object} props Properties to use for the customer.
 *
 * @return {Object} A Customer instance
 */
module.exports = async (props = {}) =>
  models.Customer.create(await data(props));
