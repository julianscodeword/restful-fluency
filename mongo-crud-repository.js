const mongoose = require('mongoose');

module.exports = class MongoCrudRepository {
    constructor(model) {
        this._model = model;
    }
    
    _getIdTemplate(id) {
        return { id };
    }
    
    create(item) {
        return (new this._model(item))
            .save()
            .exec();
    }
    
    read(id) {
        return this._model
            .findOne(this._getIdTemplate(id))
            .exec();
    }
    
    readAll() {
        return this._model
            .find()
            .exec();
    }
    
    update(id, item) {
        return this._model
            .findOneAndUpdate(this._getIdTemplate(id), item, { upsert: true })
            .exec();
    }
    
    delete(id) {
        return this._model
            .remove(this._getIdTemplate(id))
            .exec();
    }
    
    deleteAll() {
        return this._model
            .remove()
            .exec();
    }

}
