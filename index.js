var Hapi = require('hapi'),
    s2 = require('s2');

var server = new Hapi.Server('localhost', 8000, { cors: true });

server.views({
    engines: {
        html: 'handlebars'
    },
    path: __dirname + '/static/templates'
});

server.start(function() {
    console.log('Server started at: ' + server.info.uri);
});

server.route({
    path: '/getCover',
    method: 'POST',
    handler: getCover
});

server.route({ method: 'GET', path: '/', handler: home });

function home(request, reply) {
    reply.view('index', {});
}

function getCover(request, reply) {
    reply(coverShapes(request.payload));
}

function coverShapes(fc, options) {
    var output = [];
    fc.geojson.features.forEach(function(feature) {
        if (feature.geometry.type !== 'Polygon') return;
        var cov = s2.getCover(feature.geometry.coordinates[0].map(function(_) {
            return new s2.S2LatLng(+_[1], +_[0]);
        })).forEach(function(cell) {
            output.push(cell.toGeoJSON());
        });
    });
    return {
        type: 'FeatureCollection',
        features: output
    };
}
