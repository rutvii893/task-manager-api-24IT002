const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

let hits = 0;
let misses = 0;

cache.recordHit = () => {
    hits++;
};

cache.recordMiss = () => {
    misses++;
};

cache.getStats = () => {
    return { hits, misses };
};

module.exports = cache;
