## Setup

```
$ npm install
$ cp ./config/database.example.json ./config/database.json
```
1. set database credentials for test and development
2. run migrations
```
$ npx sequelize-cli db:migrate
```
3. Seed database
```
$ npx sequelize-cli db:seed:all
```

## Testing
```
$ npm run test
```
