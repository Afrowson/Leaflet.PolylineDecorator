// enable rotationAngle and rotationOrigin support on L.Marker
﻿import 'leaflet-rotatedmarker';

/**
* Defines several classes of symbol factories,
* to be used with L.PolylineDecorator
*/

L.Symbol = L.Symbol || {};

/**
* A simple dash symbol, drawn as a Polyline.
* Can also be used for dots, if 'pixelSize' option is given the 0 value.
*/
L.Symbol.Dash = L.Class.extend({
    isZoomDependant: true,

    options: {
        pixelSize: 10,
        pathOptions: { }
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
        this.options.pathOptions.clickable = false;
    },

    buildSymbol: function(dirPoint, latLngs, map, index, total) {
        var opts = this.options,
            d2r = Math.PI / 180;

        // for a dot, nothing more to compute
        if(opts.pixelSize <= 1) {
            return L.polyline([dirPoint.latLng, dirPoint.latLng], opts.pathOptions);
        }

        var midPoint = map.project(dirPoint.latLng);
        var angle = (-(dirPoint.heading - 90)) * d2r;
        var a = L.point(
                midPoint.x + opts.pixelSize * Math.cos(angle + Math.PI) / 2,
                midPoint.y + opts.pixelSize * Math.sin(angle) / 2
            );
        // compute second point by central symmetry to avoid unecessary cos/sin
        var b = midPoint.add(midPoint.subtract(a));
        return L.polyline([map.unproject(a), map.unproject(b)], opts.pathOptions);
    }
});

L.Symbol.dash = function (options) {
    return new L.Symbol.Dash(options);
};

L.Symbol.ArrowHead = L.Class.extend({
    isZoomDependant: true,

    options: {
        polygon: true,
        pixelSize: 10,
        headAngle: 60,
        pathOptions: {
            stroke: false,
            weight: 2
        }
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
        this.options.pathOptions.clickable = false;
    },

    buildSymbol: function(dirPoint, latLngs, map, index, total) {
        var opts = this.options;
        var path;
        if(opts.polygon) {
            path = L.polygon(this._buildArrowPath(dirPoint, map), opts.pathOptions);
        } else {
            path = L.polyline(this._buildArrowPath(dirPoint, map), opts.pathOptions);
        }
        return path;
    },

    _buildArrowPath: function (dirPoint, map) {
        var d2r = Math.PI / 180;
        var tipPoint = map.project(dirPoint.latLng);
        var direction = (-(dirPoint.heading - 90)) * d2r;
        var radianArrowAngle = this.options.headAngle / 2 * d2r;

        var headAngle1 = direction + radianArrowAngle,
            headAngle2 = direction - radianArrowAngle;
        var arrowHead1 = L.point(
                tipPoint.x - this.options.pixelSize * Math.cos(headAngle1),
                tipPoint.y + this.options.pixelSize * Math.sin(headAngle1)),
            arrowHead2 = L.point(
                tipPoint.x - this.options.pixelSize * Math.cos(headAngle2),
                tipPoint.y + this.options.pixelSize * Math.sin(headAngle2));

        return [
            map.unproject(arrowHead1),
            dirPoint.latLng,
            map.unproject(arrowHead2)
        ];
    }
});

L.Symbol.arrowHead = function (options) {
    return new L.Symbol.ArrowHead(options);
};

L.Symbol.Marker = L.Class.extend({
    isZoomDependant: false,

    options: {
        markerOptions: { },
        rotate: false
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
        this.options.markerOptions.clickable = false;
        this.options.markerOptions.draggable = false;
        this.isZoomDependant = (L.Browser.ie && this.options.rotate);
    },

    buildSymbol: function(directionPoint, latLngs, map, index, total) {
        if(this.options.rotate) {
            this.options.markerOptions.rotationAngle = directionPoint.heading + (this.options.angleCorrection || 0);
        }
        return L.marker(directionPoint.latLng, this.options.markerOptions);
    }
});

L.Symbol.marker = function (options) {
    return new L.Symbol.Marker(options);
};
