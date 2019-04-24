const express = require("express");
const Joi = require("joi");
const app = express();
const req = require("request-promise");
const Promise = require("bluebird");

app.use(express.json());

function getCarOwners() {
  return Promise.try(() => {
    return req({
      uri: "http://users:3000/api/users",
      json: true
    });
  })
    .then(body => {
      console.log("received resp");
      console.dir(body);
      if (body.error) throw new Error(body.message);
      return body;
    })
    .catch(function(resp) {
      throw resp.error;
    });
}

function getCarOwner(id) {
  return Promise.try(() => {
    return req({
      uri: "http://users:3000/api/users/" + id,
      json: true
    });
  })
    .then(body => {
      console.log("received resp");
      console.dir(body);
      if (body.error) throw new Error(body.message);
      return body;
    })
    .catch(function(resp) {
      throw resp.error;
    });
}

const cars = [
  { id: 1, name: "bmw e90", bought: true, price: 100, userId: 1 },
  { id: 2, name: "mazda miyata", bought: false, price: 95, userId: 2 },
  { id: 3, name: "mitsubishi lancer", bought: true, price: 70, userId: 3 }
];

app.get("/", (req, res) => {
  res.send("listening to port 3000");
});

app.get("/api/cars", (req, res) => {
  res.send(cars);
});

app.get("/api/users", (req, res) => {
  console.log("app get carOwner  was done");
  Promise.try(function() {
    return getCarOwners();
  })
    .then(function(items) {
      res.send(items);
    })
    .catch(function(e) {
      console.log("error in get /users", e);
    });
});

app.get("/api/cars/:id", (req, res) => {
  const car = cars.find(c => c.id === parseInt(req.params.id));
  if (!car) return res.status(404).send("The car with given id was not found");
  res.send(car);
});
app.get("/api/carOwner/:id", (req, res) => {
  console.log("app get carOwner  was done");
  Promise.try(function() {
    return getCarOwner(req.params.id);
  })
    .then(function(items) {
      res.send(items);
    })
    .catch(function(e) {
      console.log("error in get /", e);
    });
});
app.post("/api/cars", (req, res) => {
  const { error } = validateCar(req.body);

  if (error) return res.status(400).send(error.details[0]);
  const userId = _.get(req.body, "userId", 1);
  const car = {
    id: cars.length + 1,
    name: req.body.name,
    bought: req.body.bought,
    price: req.body.price,
    userId
  };
  cars.push(car);
  res.status(201).send(car);
});

app.put("/api/cars/:id", (req, res) => {
  const car = cars.find(c => c.id === parseInt(req.params.id));
  if (!car) return res.status(404).send("The car with given id was not found");

  const { error } = validateCarPut(req.body);

  if (error) return res.status(400).send(error.details[0]);

  car.name = req.body.name;
  car.bought = req.body.bought;
  car.price = req.body.price;
  car.userId = req.body.userId;
  res.send(car);
});
app.patch("/api/cars/:id", (req, res) => {
  const car = cars.find(c => c.id === parseInt(req.params.id));
  if (!car) return res.status(404).send("The car with given id was not found");

  const { error } = validateCar(req.body);

  if (error) return res.status(400).send(error.details[0]);

  if (req.body.name) {
    car.name = req.body.name;
  }
  if (req.body.bought) {
    car.bought = req.body.bought;
  }
  if (req.body.price) {
    car.price = req.body.price;
  }
  if (req.body.userId) {
    car.userId = req.body.userId;
  }
  res.send(car);
});

app.delete("/api/cars/:id", (req, res) => {
  const car = cars.find(c => c.id === parseInt(req.params.id));
  if (!car) return res.status(404).send("The car with given id was not found");

  const index = cars.indexOf(car);
  cars.splice(index, 1);
  res.send(car);
});

app.use("/api/*", (req, res) => {
  res.status(405).end();
});
const port = 3001;

app.listen(port, () => console.log(`Listening ... on port 3001`));

function validateCar(car) {
  const schema = {
    name: Joi.string().min(3),
    bought: Joi.boolean(),
    price: Joi.number(),
    userId: Joi.number().max(3)
  };
  return Joi.validate(car, schema);
}

function validateCarPut(car) {
  const schema = {
    name: Joi.string()
      .min(3)
      .required(),
    bought: Joi.boolean().required(),
    price: Joi.number().required(),
    userId: Joi.number()
      .max(3)
      .required()
  };
  return Joi.validate(car, schema);
}
