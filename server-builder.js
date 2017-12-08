const restify = require('restify');
const restifyPromises = require('restify-await-promise');

const MongoCrudRepository = require('./mongo-crud-repository');

class RestfulApiConfiguration {
    constructor(parent) {
        this._parent = parent;
    }
    
    withReadonlyAccess() {
        this._hasReadonlyAccess = true;
        return this;
    }
    
    thatValidatesWritesWith(validator) {
        this._validator = validator;
        return this;
    }
    
    accessibleFrom(name) {
        this._name = name;
        return this;
    }
    
    thatUsesRepository(repository) {
        this._repository = repository;
        return this;
    }
    
    thatUsesMongoModel(model) {
        this._repository = new MongoCrudRepository(model);
        return this;
    }
    
    and() {
        return this._parent;
    }
}

class RestifyRestfulApiConfiguration extends RestfulApiConfiguration {
    configure(server) {
        console.log(`Using Restify to create a ${this._hasReadonlyAccess ? 'READ-ONLY' : 'WRITE-ENABLED'} API at /${this._name}.`);

        server.get(`/${this._name}/:id`, (request) => this._repository.read(request.params.id));
        server.get(`/${this._name}`,         (request) => this._repository.readAll());

        if (!this._hasReadonlyAccess) {
            server.post(`/${this._name}`,    (request) => {
                if (!!this._validator && !this._validator(request)) {
                    return Promise.reject("The request was invalid.");
                }
                return this._repository.create(request.body);
            });
            server.put(`/${this._name}/:id`, (request) => {
                if (!!this._validator && !this._validator(request)) {
                    return Promise.reject("The request was invalid.");
                }
                return this._repository.update(request.params.id, request.body);
            });
            server.del(`/${this._name}`,     (request) => this._repository.deleteAll());
            server.del(`/${this._name}/:id`, (request) => this._repository.delete(request.params.id));
        }            
    }
}

class SingleMethodApiConfiguration {
    constructor(parent, method) {
        this._parent = parent;
        this._method = method;
    }
    
    at(uri) {
        this._uri = uri;
        return this;
    }
    
    thatUsesHandler(handler) {
        this._handler = handler;
        return this;
    }
    
    and() {
        return this._parent;
    }
}

class GetMethodApiConfiguration extends SingleMethodApiConfiguration {
    configure(server) {
        console.log(`Using Restify to create a GET API at ${this._uri}.`);
        server.get(this._uri, (request) => this._handler(request.body, request.params));
    }
}

class PostMethodApiConfiguration extends SingleMethodApiConfiguration {
    configure(server) {
        console.log(`Using Restify to create a POST API at ${this._uri}.`);
        server.post(this._uri, (request) => this._handler(request.body, request.params));
    }
}

class PutMethodApiConfiguration extends SingleMethodApiConfiguration {
    configure(server) {
        console.log(`Using Restify to create a PUT API at ${this._uri}.`);
        server.put(this._uri, (request) => this._handler(request.body, request.params));
    }
}

class DeleteMethodApiConfiguration extends SingleMethodApiConfiguration {
    configure(server) {
        console.log(`Using Restify to create a DELETE API at ${this._uri}.`);
        server.del(this._uri, (request) => this._handler(request.body, request.params));
    }
}

class ServerBuilder {
    constructor() {
        this._apis = [];
    }
    
    whichListensOnPort(port) {
        this._port = port;
        return this;
    }
}

class RestifyServerBuilder extends ServerBuilder {
    withAnApi(api) {
        this._apis.push(api);
        return api;
    }
    
    withARestfulApi() {
        return this.withAnApi(new RestifyRestfulApiConfiguration(this));
    }
    
    withAGetApi() {
        return this.withAnApi(new GetMethodApiConfiguration(this));
    }
    
    withAPostApi() {
        return this.withAnApi(new PostMethodApiConfiguration(this));
    }
    
    withAPutApi() {
        return this.withAnApi(new PutMethodApiConfiguration(this));
    }
    
    withADeleteApi() {
        return this.withAnApi(new DeleteMethodApiConfiguration(this));
    }
    
    build() {
        const server = restify.createServer();
        
        server.use(restify.plugins.jsonBodyParser({ mapParams: true }));
        server.use(restify.plugins.acceptParser(server.acceptable));
        server.use(restify.plugins.queryParser({ mapParams: true }));
        server.use(restify.plugins.fullResponse());
        restifyPromises.install(server);
        
        this._apis.forEach(api => api.configure(server));
        
        server.listen(this._port, () => console.log('%s listening at %s', server.name, server.url));
    }
}

class ServerBuilderFactory {
    get DEFAULT() {
        return this.basedOnRestify();
    }
    
    get RESTIFY() {
        return new RestifyServerBuilder();
    }
}

module.exports = new ServerBuilderFactory();
