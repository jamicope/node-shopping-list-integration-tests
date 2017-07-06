const chai = require('chai');
const chaiHttp = require('chai-http');

const {
    app,
    runServer,
    closeServer
} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Recipes', function () {
    //activating the server and return a promise to make sure the server is on before tests run
    before(function () {
        return runServer();
    });

    //closing out the server sfter the test so other tests can use it if needed
    after(function () {
        return closeServer();
    });

    // using a promise to return the info we need
    it('should show name & ingredients of recipes', function () {
        return chai.request(app)
            .get('/recipes')
            .then(function (res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.be.above(0);
                res.body.forEach(function (item) {
                    item.should.be.a('object');
                    item.should.have.all.keys(
                        'id', 'name', 'ingredients');
                });
            });
    });
});

it('should add a recipe on POST', function () {
    const Recipes = {
        name: 'boiled eggs',
        ingredients: 'eggs, water',

    };
    return chai.request(app)
        .post('/recipes')
        .send(Recipes)
        .then(function (res) {
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.include.keys('id', 'name', 'ingredients');
            res.body.id.should.not.be.null;
            res.body.should.deep.equal(Object.assign(Recipes, {
                id: res.body.id
            }));
        });
});

it('should update recipes on PUT', function () {
    const updateData = {
        name: 'oatmeal',
        ingredients: 'dried oatmeal, water or milk'
    };
    return chai.request(app)
        // first have to get so we have an idea of object to update
        .get('/recipes')
        .then(function (res) {
            updateData.id = res.body[0].id;
            return chai.request(app)
                .put(`/recipes/${updateData.id}`)
                .send(updateData)
        })
        .then(function (res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.deep.equal(updateData);
        });
});

it('should delete recipes on DELETE', function () {
    return chai.request(app)

        // get recipe for the id first, then delte the item with the id
        .get('/recipes')
        .then(function (res) {
            return chai.request(app)
                .delete(`/recipes/${res.body[0].id}`);
        })
        .then(function (res) {
            res.should.have.status(204);
        });
});
