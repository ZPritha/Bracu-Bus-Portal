const mongoose = require('mongoose');
const Route = require('./models/Route');

async function checkRoutes() {
  await mongoose.connect('mongodb+srv://bracubus:bracubus1234@cluster0.xvtkkss.mongodb.net/bracubus');
  const routes = await Route.find();
  console.log(JSON.stringify(routes, null, 2));
  await mongoose.disconnect();
}

checkRoutes();
