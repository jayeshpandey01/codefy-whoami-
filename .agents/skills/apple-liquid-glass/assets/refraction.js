/**
 * Apple Liquid Glass - Optical Refraction Filter Generator
 * Creates dynamic SVG displacement mapping for real edge light bending.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LiquidGlass = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var filterCounter = 0;

  function createLiquidGlassFilter(options) {
    options = options || {};
    var scale = options.scale !== undefined ? options.scale : -18;
    var baseFreq = options.baseFrequency || '0.02 0.02';
    var octaves = options.numOctaves || 2;
    var filterId = options.id || 'liquid-glass-filter-' + (++filterCounter);

    var existing = document.getElementById(filterId);
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    var svg = document.getElementById('liquid-glass-svg-host');
    if (!svg) {
      svg = document.createElementNS(SVG_NS, 'svg');
      svg.id = 'liquid-glass-svg-host';
      svg.setAttribute('style', 'position: absolute; width: 0; height: 0; pointer-events: none; overflow: hidden;');
      svg.setAttribute('aria-hidden', 'true');
      document.body.appendChild(svg);
    }

    var defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(SVG_NS, 'defs');
      svg.appendChild(defs);
    }

    var filter = document.createElementNS(SVG_NS, 'filter');
    filter.id = filterId;
    // CRITICAL: Prevent upward-left linearRGB chromatic distortion
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    filter.setAttribute('x', '-20%');
    filter.setAttribute('y', '-20%');
    filter.setAttribute('width', '140%');
    filter.setAttribute('height', '140%');

    var feTurbulence = document.createElementNS(SVG_NS, 'feTurbulence');
    feTurbulence.setAttribute('type', 'fractalNoise');
    feTurbulence.setAttribute('baseFrequency', baseFreq);
    feTurbulence.setAttribute('numOctaves', String(octaves));
    feTurbulence.setAttribute('result', 'noise');
    filter.appendChild(feTurbulence);

    var feDisplacement = document.createElementNS(SVG_NS, 'feDisplacementMap');
    feDisplacement.setAttribute('in', 'SourceGraphic');
    feDisplacement.setAttribute('in2', 'noise');
    feDisplacement.setAttribute('scale', String(scale));
    feDisplacement.setAttribute('xChannelSelector', 'R');
    feDisplacement.setAttribute('yChannelSelector', 'G');
    feDisplacement.setAttribute('result', 'displaced');
    filter.appendChild(feDisplacement);

    var feGaussian = document.createElementNS(SVG_NS, 'feGaussianBlur');
    feGaussian.setAttribute('in', 'displaced');
    feGaussian.setAttribute('stdDeviation', '0.4');
    feGaussian.setAttribute('result', 'blurred');
    filter.appendChild(feGaussian);

    var feMerge = document.createElementNS(SVG_NS, 'feMerge');
    var mergeNode = document.createElementNS(SVG_NS, 'feMergeNode');
    mergeNode.setAttribute('in', 'blurred');
    feMerge.appendChild(mergeNode);
    filter.appendChild(feMerge);

    defs.appendChild(filter);

    return {
      id: filterId,
      url: 'url(#' + filterId + ')',
      destroy: function () {
        if (filter.parentNode) {
          filter.parentNode.removeChild(filter);
        }
      }
    };
  }

  function applyRefraction(element, options) {
    if (!element) return null;
    var filterInstance = createLiquidGlassFilter(options);
    element.style.filter = filterInstance.url;
    return filterInstance;
  }

  return {
    createFilter: createLiquidGlassFilter,
    apply: applyRefraction
  };
});

