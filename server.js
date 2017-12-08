const ServerBuilder = require('./server-builder');
const mongoose = require('mongoose');
const productModel = require('./product-model');
const orderModel = require('./order-model');

mongoose.connect('mongodb://localhost/sampledb', { useMongoClient: true });
mongoose.Promise = global.Promise;

ServerBuilder.DEFAULT
    .withARestfulApi().thatUsesMongoModel(productModel).accessibleFrom('product').withReadonlyAccess().and()
    .withARestfulApi().thatUsesMongoModel(orderModel).accessibleFrom('order').and()
    .whichListensOnPort(8080)
    .build();
