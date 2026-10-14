/*!
  * Bootstrap v5.3.8 (https://getbootstrap.com/)
  * Copyright 2011-2025 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.bootstrap = factory());
})(this, (function () { 'use strict';

  /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/data.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  /**
   * Constants
   */

  const elementMap = new Map();
  const Data = {
    set(element, key, instance) {
      if (!elementMap.has(element)) {
        elementMap.set(element, new Map());
      }
      const instanceMap = elementMap.get(element);

      // make it clear we only want one instance per element
      // can be removed later when multiple key/instances are fine to be used
      if (!instanceMap.has(key) && instanceMap.size !== 0) {
        // eslint-disable-next-line no-console
        console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
        return;
      }
      instanceMap.set(key, instance);
    },
    get(element, key) {
      if (elementMap.has(element)) {
        return elementMap.get(element).get(key) || null;
      }
      return null;
    },
    remove(element, key) {
      if (!elementMap.has(element)) {
        return;
      }
      const instanceMap = elementMap.get(element);
      instanceMap.delete(key);

      // free up element references if there are no instances left for an element
      if (instanceMap.size === 0) {
        elementMap.delete(element);
      }
    }
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/index.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const MAX_UID = 1000000;
  const MILLISECONDS_MULTIPLIER = 1000;
  const TRANSITION_END = 'transitionend';

  /**
   * Properly escape IDs selectors to handle weird IDs
   * @param {string} selector
   * @returns {string}
   */
  const parseSelector = selector => {
    if (selector && window.CSS && window.CSS.escape) {
      // document.querySelector needs escaping to handle IDs (html5+) containing for instance /
      selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
    }
    return selector;
  };

  // Shout-out Angus Croll (https://goo.gl/pxwQGp)
  const toType = object => {
    if (object === null || object === undefined) {
      return `${object}`;
    }
    return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
  };

  /**
   * Public Util API
   */

  const getUID = prefix => {
    do {
      prefix += Math.floor(Math.random() * MAX_UID);
    } while (document.getElementById(prefix));
    return prefix;
  };
  const getTransitionDurationFromElement = element => {
    if (!element) {
      return 0;
    }

    // Get transition-duration of the element
    let {
      transitionDuration,
      transitionDelay
    } = window.getComputedStyle(element);
    const floatTransitionDuration = Number.parseFloat(transitionDuration);
    const floatTransitionDelay = Number.parseFloat(transitionDelay);

    // Return 0 if element or transition duration is not found
    if (!floatTransitionDuration && !floatTransitionDelay) {
      return 0;
    }

    // If multiple durations are defined, take the first
    transitionDuration = transitionDuration.split(',')[0];
    transitionDelay = transitionDelay.split(',')[0];
    return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
  };
  const triggerTransitionEnd = element => {
    element.dispatchEvent(new Event(TRANSITION_END));
  };
  const isElement$1 = object => {
    if (!object || typeof object !== 'object') {
      return false;
    }
    if (typeof object.jquery !== 'undefined') {
      object = object[0];
    }
    return typeof object.nodeType !== 'undefined';
  };
  const getElement = object => {
    // it's a jQuery object or a node element
    if (isElement$1(object)) {
      return object.jquery ? object[0] : object;
    }
    if (typeof object === 'string' && object.length > 0) {
      return document.querySelector(parseSelector(object));
    }
    return null;
  };
  const isVisible = element => {
    if (!isElement$1(element) || element.getClientRects().length === 0) {
      return false;
    }
    const elementIsVisible = getComputedStyle(element).getPropertyValue('visibility') === 'visible';
    // Handle `details` element as its content may falsie appear visible when it is closed
    const closedDetails = element.closest('details:not([open])');
    if (!closedDetails) {
      return elementIsVisible;
    }
    if (closedDetails !== element) {
      const summary = element.closest('summary');
      if (summary && summary.parentNode !== closedDetails) {
        return false;
      }
      if (summary === null) {
        return false;
      }
    }
    return elementIsVisible;
  };
  const isDisabled = element => {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      return true;
    }
    if (element.classList.contains('disabled')) {
      return true;
    }
    if (typeof element.disabled !== 'undefined') {
      return element.disabled;
    }
    return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false';
  };
  const findShadowRoot = element => {
    if (!document.documentElement.attachShadow) {
      return null;
    }

    // Can find the shadow root otherwise it'll return the document
    if (typeof element.getRootNode === 'function') {
      const root = element.getRootNode();
      return root instanceof ShadowRoot ? root : null;
    }
    if (element instanceof ShadowRoot) {
      return element;
    }

    // when we don't find a shadow root
    if (!element.parentNode) {
      return null;
    }
    return findShadowRoot(element.parentNode);
  };
  const noop = () => {};

  /**
   * Trick to restart an element's animation
   *
   * @param {HTMLElement} element
   * @return void
   *
   * @see https://www.harrytheo.com/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
   */
  const reflow = element => {
    element.offsetHeight; // eslint-disable-line no-unused-expressions
  };
  const getjQuery = () => {
    if (window.jQuery && !document.body.hasAttribute('data-bs-no-jquery')) {
      return window.jQuery;
    }
    return null;
  };
  const DOMContentLoadedCallbacks = [];
  const onDOMContentLoaded = callback => {
    if (document.readyState === 'loading') {
      // add listener on the first call when the document is in loading state
      if (!DOMContentLoadedCallbacks.length) {
        document.addEventListener('DOMContentLoaded', () => {
          for (const callback of DOMContentLoadedCallbacks) {
            callback();
          }
        });
      }
      DOMContentLoadedCallbacks.push(callback);
    } else {
      callback();
    }
  };
  const isRTL = () => document.documentElement.dir === 'rtl';
  const defineJQueryPlugin = plugin => {
    onDOMContentLoaded(() => {
      const $ = getjQuery();
      /* istanbul ignore if */
      if ($) {
        const name = plugin.NAME;
        const JQUERY_NO_CONFLICT = $.fn[name];
        $.fn[name] = plugin.jQueryInterface;
        $.fn[name].Constructor = plugin;
        $.fn[name].noConflict = () => {
          $.fn[name] = JQUERY_NO_CONFLICT;
          return plugin.jQueryInterface;
        };
      }
    });
  };
  const execute = (possibleCallback, args = [], defaultValue = possibleCallback) => {
    return typeof possibleCallback === 'function' ? possibleCallback.call(...args) : defaultValue;
  };
  const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
    if (!waitForTransition) {
      execute(callback);
      return;
    }
    const durationPadding = 5;
    const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
    let called = false;
    const handler = ({
      target
    }) => {
      if (target !== transitionElement) {
        return;
      }
      called = true;
      transitionElement.removeEventListener(TRANSITION_END, handler);
      execute(callback);
    };
    transitionElement.addEventListener(TRANSITION_END, handler);
    setTimeout(() => {
      if (!called) {
        triggerTransitionEnd(transitionElement);
      }
    }, emulatedDuration);
  };

  /**
   * Return the previous/next element of a list.
   *
   * @param {array} list    The list of elements
   * @param activeElement   The active element
   * @param shouldGetNext   Choose to get next or previous element
   * @param isCycleAllowed
   * @return {Element|elem} The proper element
   */
  const getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
    const listLength = list.length;
    let index = list.indexOf(activeElement);

    // if the element does not exist in the list return an element
    // depending on the direction and if cycle is allowed
    if (index === -1) {
      return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
    }
    index += shouldGetNext ? 1 : -1;
    if (isCycleAllowed) {
      index = (index + listLength) % listLength;
    }
    return list[Math.max(0, Math.min(index, listLength - 1))];
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/event-handler.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
  const stripNameRegex = /\..*/;
  const stripUidRegex = /::\d+$/;
  const eventRegistry = {}; // Events storage
  let uidEvent = 1;
  const customEvents = {
    mouseenter: 'mouseover',
    mouseleave: 'mouseout'
  };
  const nativeEvents = new Set(['click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu', 'mousewheel', 'DOMMouseScroll', 'mouseover', 'mouseout', 'mousemove', 'selectstart', 'selectend', 'keydown', 'keypress', 'keyup', 'orientationchange', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup', 'pointerleave', 'pointercancel', 'gesturestart', 'gesturechange', 'gestureend', 'focus', 'blur', 'change', 'reset', 'select', 'submit', 'focusin', 'focusout', 'load', 'unload', 'beforeunload', 'resize', 'move', 'DOMContentLoaded', 'readystatechange', 'error', 'abort', 'scroll']);

  /**
   * Private methods
   */

  function makeEventUid(element, uid) {
    return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
  }
  function getElementEvents(element) {
    const uid = makeEventUid(element);
    element.uidEvent = uid;
    eventRegistry[uid] = eventRegistry[uid] || {};
    return eventRegistry[uid];
  }
  function bootstrapHandler(element, fn) {
    return function handler(event) {
      hydrateObj(event, {
        delegateTarget: element
      });
      if (handler.oneOff) {
        EventHandler.off(element, event.type, fn);
      }
      return fn.apply(element, [event]);
    };
  }
  function bootstrapDelegationHandler(element, selector, fn) {
    return function handler(event) {
      const domElements = element.querySelectorAll(selector);
      for (let {
        target
      } = event; target && target !== this; target = target.parentNode) {
        for (const domElement of domElements) {
          if (domElement !== target) {
            continue;
          }
          hydrateObj(event, {
            delegateTarget: target
          });
          if (handler.oneOff) {
            EventHandler.off(element, event.type, selector, fn);
          }
          return fn.apply(target, [event]);
        }
      }
    };
  }
  function findHandler(events, callable, delegationSelector = null) {
    return Object.values(events).find(event => event.callable === callable && event.delegationSelector === delegationSelector);
  }
  function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
    const isDelegated = typeof handler === 'string';
    // TODO: tooltip passes `false` instead of selector, so we need to check
    const callable = isDelegated ? delegationFunction : handler || delegationFunction;
    let typeEvent = getTypeEvent(originalTypeEvent);
    if (!nativeEvents.has(typeEvent)) {
      typeEvent = originalTypeEvent;
    }
    return [isDelegated, callable, typeEvent];
  }
  function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
    if (typeof originalTypeEvent !== 'string' || !element) {
      return;
    }
    let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);

    // in case of mouseenter or mouseleave wrap the handler within a function that checks for its DOM position
    // this prevents the handler from being dispatched the same way as mouseover or mouseout does
    if (originalTypeEvent in customEvents) {
      const wrapFunction = fn => {
        return function (event) {
          if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
            return fn.call(this, event);
          }
        };
      };
      callable = wrapFunction(callable);
    }
    const events = getElementEvents(element);
    const handlers = events[typeEvent] || (events[typeEvent] = {});
    const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);
    if (previousFunction) {
      previousFunction.oneOff = previousFunction.oneOff && oneOff;
      return;
    }
    const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ''));
    const fn = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
    fn.delegationSelector = isDelegated ? handler : null;
    fn.callable = callable;
    fn.oneOff = oneOff;
    fn.uidEvent = uid;
    handlers[uid] = fn;
    element.addEventListener(typeEvent, fn, isDelegated);
  }
  function removeHandler(element, events, typeEvent, handler, delegationSelector) {
    const fn = findHandler(events[typeEvent], handler, delegationSelector);
    if (!fn) {
      return;
    }
    element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
    delete events[typeEvent][fn.uidEvent];
  }
  function removeNamespacedHandlers(element, events, typeEvent, namespace) {
    const storeElementEvent = events[typeEvent] || {};
    for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
      if (handlerKey.includes(namespace)) {
        removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
      }
    }
  }
  function getTypeEvent(event) {
    // allow to get the native events from namespaced events ('click.bs.button' --> 'click')
    event = event.replace(stripNameRegex, '');
    return customEvents[event] || event;
  }
  const EventHandler = {
    on(element, event, handler, delegationFunction) {
      addHandler(element, event, handler, delegationFunction, false);
    },
    one(element, event, handler, delegationFunction) {
      addHandler(element, event, handler, delegationFunction, true);
    },
    off(element, originalTypeEvent, handler, delegationFunction) {
      if (typeof originalTypeEvent !== 'string' || !element) {
        return;
      }
      const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
      const inNamespace = typeEvent !== originalTypeEvent;
      const events = getElementEvents(element);
      const storeElementEvent = events[typeEvent] || {};
      const isNamespace = originalTypeEvent.startsWith('.');
      if (typeof callable !== 'undefined') {
        // Simplest case: handler is passed, remove that listener ONLY.
        if (!Object.keys(storeElementEvent).length) {
          return;
        }
        removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
        return;
      }
      if (isNamespace) {
        for (const elementEvent of Object.keys(events)) {
          removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
        }
      }
      for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
        const handlerKey = keyHandlers.replace(stripUidRegex, '');
        if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
          removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
        }
      }
    },
    trigger(element, event, args) {
      if (typeof event !== 'string' || !element) {
        return null;
      }
      const $ = getjQuery();
      const typeEvent = getTypeEvent(event);
      const inNamespace = event !== typeEvent;
      let jQueryEvent = null;
      let bubbles = true;
      let nativeDispatch = true;
      let defaultPrevented = false;
      if (inNamespace && $) {
        jQueryEvent = $.Event(event, args);
        $(element).trigger(jQueryEvent);
        bubbles = !jQueryEvent.isPropagationStopped();
        nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
        defaultPrevented = jQueryEvent.isDefaultPrevented();
      }
      const evt = hydrateObj(new Event(event, {
        bubbles,
        cancelable: true
      }), args);
      if (defaultPrevented) {
        evt.preventDefault();
      }
      if (nativeDispatch) {
        element.dispatchEvent(evt);
      }
      if (evt.defaultPrevented && jQueryEvent) {
        jQueryEvent.preventDefault();
      }
      return evt;
    }
  };
  function hydrateObj(obj, meta = {}) {
    for (const [key, value] of Object.entries(meta)) {
      try {
        obj[key] = value;
      } catch (_unused) {
        Object.defineProperty(obj, key, {
          configurable: true,
          get() {
            return value;
          }
        });
      }
    }
    return obj;
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/manipulator.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  function normalizeData(value) {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    if (value === Number(value).toString()) {
      return Number(value);
    }
    if (value === '' || value === 'null') {
      return null;
    }
    if (typeof value !== 'string') {
      return value;
    }
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch (_unused) {
      return value;
    }
  }
  function normalizeDataKey(key) {
    return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
  }
  const Manipulator = {
    setDataAttribute(element, key, value) {
      element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
    },
    removeDataAttribute(element, key) {
      element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
    },
    getDataAttributes(element) {
      if (!element) {
        return {};
      }
      const attributes = {};
      const bsKeys = Object.keys(element.dataset).filter(key => key.startsWith('bs') && !key.startsWith('bsConfig'));
      for (const key of bsKeys) {
        let pureKey = key.replace(/^bs/, '');
        pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1);
        attributes[pureKey] = normalizeData(element.dataset[key]);
      }
      return attributes;
    },
    getDataAttribute(element, key) {
      return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
    }
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/config.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Class definition
   */

  class Config {
    // Getters
    static get Default() {
      return {};
    }
    static get DefaultType() {
      return {};
    }
    static get NAME() {
      throw new Error('You have to implement the static method "NAME", for each component!');
    }
    _getConfig(config) {
      config = this._mergeConfigObj(config);
      config = this._configAfterMerge(config);
      this._typeCheckConfig(config);
      return config;
    }
    _configAfterMerge(config) {
      return config;
    }
    _mergeConfigObj(config, element) {
      const jsonConfig = isElement$1(element) ? Manipulator.getDataAttribute(element, 'config') : {}; // try to parse

      return {
        ...this.constructor.Default,
        ...(typeof jsonConfig === 'object' ? jsonConfig : {}),
        ...(isElement$1(element) ? Manipulator.getDataAttributes(element) : {}),
        ...(typeof config === 'object' ? config : {})
      };
    }
    _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
      for (const [property, expectedTypes] of Object.entries(configTypes)) {
        const value = config[property];
        const valueType = isElement$1(value) ? 'element' : toType(value);
        if (!new RegExp(expectedTypes).test(valueType)) {
          throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
        }
      }
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap base-component.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const VERSION = '5.3.8';

  /**
   * Class definition
   */

  class BaseComponent extends Config {
    constructor(element, config) {
      super();
      element = getElement(element);
      if (!element) {
        return;
      }
      this._element = element;
      this._config = this._getConfig(config);
      Data.set(this._element, this.constructor.DATA_KEY, this);
    }

    // Public
    dispose() {
      Data.remove(this._element, this.constructor.DATA_KEY);
      EventHandler.off(this._element, this.constructor.EVENT_KEY);
      for (const propertyName of Object.getOwnPropertyNames(this)) {
        this[propertyName] = null;
      }
    }

    // Private
    _queueCallback(callback, element, isAnimated = true) {
      executeAfterTransition(callback, element, isAnimated);
    }
    _getConfig(config) {
      config = this._mergeConfigObj(config, this._element);
      config = this._configAfterMerge(config);
      this._typeCheckConfig(config);
      return config;
    }

    // Static
    static getInstance(element) {
      return Data.get(getElement(element), this.DATA_KEY);
    }
    static getOrCreateInstance(element, config = {}) {
      return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null);
    }
    static get VERSION() {
      return VERSION;
    }
    static get DATA_KEY() {
      return `bs.${this.NAME}`;
    }
    static get EVENT_KEY() {
      return `.${this.DATA_KEY}`;
    }
    static eventName(name) {
      return `${name}${this.EVENT_KEY}`;
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap dom/selector-engine.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const getSelector = element => {
    let selector = element.getAttribute('data-bs-target');
    if (!selector || selector === '#') {
      let hrefAttribute = element.getAttribute('href');

      // The only valid content that could double as a selector are IDs or classes,
      // so everything starting with `#` or `.`. If a "real" URL is used as the selector,
      // `document.querySelector` will rightfully complain it is invalid.
      // See https://github.com/twbs/bootstrap/issues/32273
      if (!hrefAttribute || !hrefAttribute.includes('#') && !hrefAttribute.startsWith('.')) {
        return null;
      }

      // Just in case some CMS puts out a full URL with the anchor appended
      if (hrefAttribute.includes('#') && !hrefAttribute.startsWith('#')) {
        hrefAttribute = `#${hrefAttribute.split('#')[1]}`;
      }
      selector = hrefAttribute && hrefAttribute !== '#' ? hrefAttribute.trim() : null;
    }
    return selector ? selector.split(',').map(sel => parseSelector(sel)).join(',') : null;
  };
  const SelectorEngine = {
    find(selector, element = document.documentElement) {
      return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
    },
    findOne(selector, element = document.documentElement) {
      return Element.prototype.querySelector.call(element, selector);
    },
    children(element, selector) {
      return [].concat(...element.children).filter(child => child.matches(selector));
    },
    parents(element, selector) {
      const parents = [];
      let ancestor = element.parentNode.closest(selector);
      while (ancestor) {
        parents.push(ancestor);
        ancestor = ancestor.parentNode.closest(selector);
      }
      return parents;
    },
    prev(element, selector) {
      let previous = element.previousElementSibling;
      while (previous) {
        if (previous.matches(selector)) {
          return [previous];
        }
        previous = previous.previousElementSibling;
      }
      return [];
    },
    // TODO: this is now unused; remove later along with prev()
    next(element, selector) {
      let next = element.nextElementSibling;
      while (next) {
        if (next.matches(selector)) {
          return [next];
        }
        next = next.nextElementSibling;
      }
      return [];
    },
    focusableChildren(element) {
      const focusables = ['a', 'button', 'input', 'textarea', 'select', 'details', '[tabindex]', '[contenteditable="true"]'].map(selector => `${selector}:not([tabindex^="-"])`).join(',');
      return this.find(focusables, element).filter(el => !isDisabled(el) && isVisible(el));
    },
    getSelectorFromElement(element) {
      const selector = getSelector(element);
      if (selector) {
        return SelectorEngine.findOne(selector) ? selector : null;
      }
      return null;
    },
    getElementFromSelector(element) {
      const selector = getSelector(element);
      return selector ? SelectorEngine.findOne(selector) : null;
    },
    getMultipleElementsFromSelector(element) {
      const selector = getSelector(element);
      return selector ? SelectorEngine.find(selector) : [];
    }
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/component-functions.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const enableDismissTrigger = (component, method = 'hide') => {
    const clickEvent = `click.dismiss${component.EVENT_KEY}`;
    const name = component.NAME;
    EventHandler.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function (event) {
      if (['A', 'AREA'].includes(this.tagName)) {
        event.preventDefault();
      }
      if (isDisabled(this)) {
        return;
      }
      const target = SelectorEngine.getElementFromSelector(this) || this.closest(`.${name}`);
      const instance = component.getOrCreateInstance(target);

      // Method argument is left, for Alert and only, as it doesn't implement the 'hide' method
      instance[method]();
    });
  };

  /**
   * --------------------------------------------------------------------------
   * Bootstrap alert.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$f = 'alert';
  const DATA_KEY$a = 'bs.alert';
  const EVENT_KEY$b = `.${DATA_KEY$a}`;
  const EVENT_CLOSE = `close${EVENT_KEY$b}`;
  const EVENT_CLOSED = `closed${EVENT_KEY$b}`;
  const CLASS_NAME_FADE$5 = 'fade';
  const CLASS_NAME_SHOW$8 = 'show';

  /**
   * Class definition
   */

  class Alert extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$f;
    }

    // Public
    close() {
      const closeEvent = EventHandler.trigger(this._element, EVENT_CLOSE);
      if (closeEvent.defaultPrevented) {
        return;
      }
      this._element.classList.remove(CLASS_NAME_SHOW$8);
      const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);
      this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
    }

    // Private
    _destroyElement() {
      this._element.remove();
      EventHandler.trigger(this._element, EVENT_CLOSED);
      this.dispose();
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Alert.getOrCreateInstance(this);
        if (typeof config !== 'string') {
          return;
        }
        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](this);
      });
    }
  }

  /**
   * Data API implementation
   */

  enableDismissTrigger(Alert, 'close');

  /**
   * jQuery
   */

  defineJQueryPlugin(Alert);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap button.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$e = 'button';
  const DATA_KEY$9 = 'bs.button';
  const EVENT_KEY$a = `.${DATA_KEY$9}`;
  const DATA_API_KEY$6 = '.data-api';
  const CLASS_NAME_ACTIVE$3 = 'active';
  const SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="button"]';
  const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$a}${DATA_API_KEY$6}`;

  /**
   * Class definition
   */

  class Button extends BaseComponent {
    // Getters
    static get NAME() {
      return NAME$e;
    }

    // Public
    toggle() {
      // Toggle class and sync the `aria-pressed` attribute with the return value of the `.toggle()` method
      this._element.setAttribute('aria-pressed', this._element.classList.toggle(CLASS_NAME_ACTIVE$3));
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Button.getOrCreateInstance(this);
        if (config === 'toggle') {
          data[config]();
        }
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$5, event => {
    event.preventDefault();
    const button = event.target.closest(SELECTOR_DATA_TOGGLE$5);
    const data = Button.getOrCreateInstance(button);
    data.toggle();
  });

  /**
   * jQuery
   */

  defineJQueryPlugin(Button);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/swipe.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$d = 'swipe';
  const EVENT_KEY$9 = '.bs.swipe';
  const EVENT_TOUCHSTART = `touchstart${EVENT_KEY$9}`;
  const EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$9}`;
  const EVENT_TOUCHEND = `touchend${EVENT_KEY$9}`;
  const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$9}`;
  const EVENT_POINTERUP = `pointerup${EVENT_KEY$9}`;
  const POINTER_TYPE_TOUCH = 'touch';
  const POINTER_TYPE_PEN = 'pen';
  const CLASS_NAME_POINTER_EVENT = 'pointer-event';
  const SWIPE_THRESHOLD = 40;
  const Default$c = {
    endCallback: null,
    leftCallback: null,
    rightCallback: null
  };
  const DefaultType$c = {
    endCallback: '(function|null)',
    leftCallback: '(function|null)',
    rightCallback: '(function|null)'
  };

  /**
   * Class definition
   */

  class Swipe extends Config {
    constructor(element, config) {
      super();
      this._element = element;
      if (!element || !Swipe.isSupported()) {
        return;
      }
      this._config = this._getConfig(config);
      this._deltaX = 0;
      this._supportPointerEvents = Boolean(window.PointerEvent);
      this._initEvents();
    }

    // Getters
    static get Default() {
      return Default$c;
    }
    static get DefaultType() {
      return DefaultType$c;
    }
    static get NAME() {
      return NAME$d;
    }

    // Public
    dispose() {
      EventHandler.off(this._element, EVENT_KEY$9);
    }

    // Private
    _start(event) {
      if (!this._supportPointerEvents) {
        this._deltaX = event.touches[0].clientX;
        return;
      }
      if (this._eventIsPointerPenTouch(event)) {
        this._deltaX = event.clientX;
      }
    }
    _end(event) {
      if (this._eventIsPointerPenTouch(event)) {
        this._deltaX = event.clientX - this._deltaX;
      }
      this._handleSwipe();
      execute(this._config.endCallback);
    }
    _move(event) {
      this._deltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this._deltaX;
    }
    _handleSwipe() {
      const absDeltaX = Math.abs(this._deltaX);
      if (absDeltaX <= SWIPE_THRESHOLD) {
        return;
      }
      const direction = absDeltaX / this._deltaX;
      this._deltaX = 0;
      if (!direction) {
        return;
      }
      execute(direction > 0 ? this._config.rightCallback : this._config.leftCallback);
    }
    _initEvents() {
      if (this._supportPointerEvents) {
        EventHandler.on(this._element, EVENT_POINTERDOWN, event => this._start(event));
        EventHandler.on(this._element, EVENT_POINTERUP, event => this._end(event));
        this._element.classList.add(CLASS_NAME_POINTER_EVENT);
      } else {
        EventHandler.on(this._element, EVENT_TOUCHSTART, event => this._start(event));
        EventHandler.on(this._element, EVENT_TOUCHMOVE, event => this._move(event));
        EventHandler.on(this._element, EVENT_TOUCHEND, event => this._end(event));
      }
    }
    _eventIsPointerPenTouch(event) {
      return this._supportPointerEvents && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
    }

    // Static
    static isSupported() {
      return 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0;
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap carousel.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$c = 'carousel';
  const DATA_KEY$8 = 'bs.carousel';
  const EVENT_KEY$8 = `.${DATA_KEY$8}`;
  const DATA_API_KEY$5 = '.data-api';
  const ARROW_LEFT_KEY$1 = 'ArrowLeft';
  const ARROW_RIGHT_KEY$1 = 'ArrowRight';
  const TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

  const ORDER_NEXT = 'next';
  const ORDER_PREV = 'prev';
  const DIRECTION_LEFT = 'left';
  const DIRECTION_RIGHT = 'right';
  const EVENT_SLIDE = `slide${EVENT_KEY$8}`;
  const EVENT_SLID = `slid${EVENT_KEY$8}`;
  const EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$8}`;
  const EVENT_MOUSEENTER$1 = `mouseenter${EVENT_KEY$8}`;
  const EVENT_MOUSELEAVE$1 = `mouseleave${EVENT_KEY$8}`;
  const EVENT_DRAG_START = `dragstart${EVENT_KEY$8}`;
  const EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$8}${DATA_API_KEY$5}`;
  const EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$8}${DATA_API_KEY$5}`;
  const CLASS_NAME_CAROUSEL = 'carousel';
  const CLASS_NAME_ACTIVE$2 = 'active';
  const CLASS_NAME_SLIDE = 'slide';
  const CLASS_NAME_END = 'carousel-item-end';
  const CLASS_NAME_START = 'carousel-item-start';
  const CLASS_NAME_NEXT = 'carousel-item-next';
  const CLASS_NAME_PREV = 'carousel-item-prev';
  const SELECTOR_ACTIVE = '.active';
  const SELECTOR_ITEM = '.carousel-item';
  const SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
  const SELECTOR_ITEM_IMG = '.carousel-item img';
  const SELECTOR_INDICATORS = '.carousel-indicators';
  const SELECTOR_DATA_SLIDE = '[data-bs-slide], [data-bs-slide-to]';
  const SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
  const KEY_TO_DIRECTION = {
    [ARROW_LEFT_KEY$1]: DIRECTION_RIGHT,
    [ARROW_RIGHT_KEY$1]: DIRECTION_LEFT
  };
  const Default$b = {
    interval: 5000,
    keyboard: true,
    pause: 'hover',
    ride: false,
    touch: true,
    wrap: true
  };
  const DefaultType$b = {
    interval: '(number|boolean)',
    // TODO:v6 remove boolean support
    keyboard: 'boolean',
    pause: '(string|boolean)',
    ride: '(boolean|string)',
    touch: 'boolean',
    wrap: 'boolean'
  };

  /**
   * Class definition
   */

  class Carousel extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._interval = null;
      this._activeElement = null;
      this._isSliding = false;
      this.touchTimeout = null;
      this._swipeHelper = null;
      this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
      this._addEventListeners();
      if (this._config.ride === CLASS_NAME_CAROUSEL) {
        this.cycle();
      }
    }

    // Getters
    static get Default() {
      return Default$b;
    }
    static get DefaultType() {
      return DefaultType$b;
    }
    static get NAME() {
      return NAME$c;
    }

    // Public
    next() {
      this._slide(ORDER_NEXT);
    }
    nextWhenVisible() {
      // FIXME TODO use `document.visibilityState`
      // Don't call next when the page isn't visible
      // or the carousel or its parent isn't visible
      if (!document.hidden && isVisible(this._element)) {
        this.next();
      }
    }
    prev() {
      this._slide(ORDER_PREV);
    }
    pause() {
      if (this._isSliding) {
        triggerTransitionEnd(this._element);
      }
      this._clearInterval();
    }
    cycle() {
      this._clearInterval();
      this._updateInterval();
      this._interval = setInterval(() => this.nextWhenVisible(), this._config.interval);
    }
    _maybeEnableCycle() {
      if (!this._config.ride) {
        return;
      }
      if (this._isSliding) {
        EventHandler.one(this._element, EVENT_SLID, () => this.cycle());
        return;
      }
      this.cycle();
    }
    to(index) {
      const items = this._getItems();
      if (index > items.length - 1 || index < 0) {
        return;
      }
      if (this._isSliding) {
        EventHandler.one(this._element, EVENT_SLID, () => this.to(index));
        return;
      }
      const activeIndex = this._getItemIndex(this._getActive());
      if (activeIndex === index) {
        return;
      }
      const order = index > activeIndex ? ORDER_NEXT : ORDER_PREV;
      this._slide(order, items[index]);
    }
    dispose() {
      if (this._swipeHelper) {
        this._swipeHelper.dispose();
      }
      super.dispose();
    }

    // Private
    _configAfterMerge(config) {
      config.defaultInterval = config.interval;
      return config;
    }
    _addEventListeners() {
      if (this._config.keyboard) {
        EventHandler.on(this._element, EVENT_KEYDOWN$1, event => this._keydown(event));
      }
      if (this._config.pause === 'hover') {
        EventHandler.on(this._element, EVENT_MOUSEENTER$1, () => this.pause());
        EventHandler.on(this._element, EVENT_MOUSELEAVE$1, () => this._maybeEnableCycle());
      }
      if (this._config.touch && Swipe.isSupported()) {
        this._addTouchEventListeners();
      }
    }
    _addTouchEventListeners() {
      for (const img of SelectorEngine.find(SELECTOR_ITEM_IMG, this._element)) {
        EventHandler.on(img, EVENT_DRAG_START, event => event.preventDefault());
      }
      const endCallBack = () => {
        if (this._config.pause !== 'hover') {
          return;
        }

        // If it's a touch-enabled device, mouseenter/leave are fired as
        // part of the mouse compatibility events on first tap - the carousel
        // would stop cycling until user tapped out of it;
        // here, we listen for touchend, explicitly pause the carousel
        // (as if it's the second time we tap on it, mouseenter compat event
        // is NOT fired) and after a timeout (to allow for mouse compatibility
        // events to fire) we explicitly restart cycling

        this.pause();
        if (this.touchTimeout) {
          clearTimeout(this.touchTimeout);
        }
        this.touchTimeout = setTimeout(() => this._maybeEnableCycle(), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
      };
      const swipeConfig = {
        leftCallback: () => this._slide(this._directionToOrder(DIRECTION_LEFT)),
        rightCallback: () => this._slide(this._directionToOrder(DIRECTION_RIGHT)),
        endCallback: endCallBack
      };
      this._swipeHelper = new Swipe(this._element, swipeConfig);
    }
    _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }
      const direction = KEY_TO_DIRECTION[event.key];
      if (direction) {
        event.preventDefault();
        this._slide(this._directionToOrder(direction));
      }
    }
    _getItemIndex(element) {
      return this._getItems().indexOf(element);
    }
    _setActiveIndicatorElement(index) {
      if (!this._indicatorsElement) {
        return;
      }
      const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE, this._indicatorsElement);
      activeIndicator.classList.remove(CLASS_NAME_ACTIVE$2);
      activeIndicator.removeAttribute('aria-current');
      const newActiveIndicator = SelectorEngine.findOne(`[data-bs-slide-to="${index}"]`, this._indicatorsElement);
      if (newActiveIndicator) {
        newActiveIndicator.classList.add(CLASS_NAME_ACTIVE$2);
        newActiveIndicator.setAttribute('aria-current', 'true');
      }
    }
    _updateInterval() {
      const element = this._activeElement || this._getActive();
      if (!element) {
        return;
      }
      const elementInterval = Number.parseInt(element.getAttribute('data-bs-interval'), 10);
      this._config.interval = elementInterval || this._config.defaultInterval;
    }
    _slide(order, element = null) {
      if (this._isSliding) {
        return;
      }
      const activeElement = this._getActive();
      const isNext = order === ORDER_NEXT;
      const nextElement = element || getNextActiveElement(this._getItems(), activeElement, isNext, this._config.wrap);
      if (nextElement === activeElement) {
        return;
      }
      const nextElementIndex = this._getItemIndex(nextElement);
      const triggerEvent = eventName => {
        return EventHandler.trigger(this._element, eventName, {
          relatedTarget: nextElement,
          direction: this._orderToDirection(order),
          from: this._getItemIndex(activeElement),
          to: nextElementIndex
        });
      };
      const slideEvent = triggerEvent(EVENT_SLIDE);
      if (slideEvent.defaultPrevented) {
        return;
      }
      if (!activeElement || !nextElement) {
        // Some weirdness is happening, so we bail
        // TODO: change tests that use empty divs to avoid this check
        return;
      }
      const isCycling = Boolean(this._interval);
      this.pause();
      this._isSliding = true;
      this._setActiveIndicatorElement(nextElementIndex);
      this._activeElement = nextElement;
      const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
      const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;
      nextElement.classList.add(orderClassName);
      reflow(nextElement);
      activeElement.classList.add(directionalClassName);
      nextElement.classList.add(directionalClassName);
      const completeCallBack = () => {
        nextElement.classList.remove(directionalClassName, orderClassName);
        nextElement.classList.add(CLASS_NAME_ACTIVE$2);
        activeElement.classList.remove(CLASS_NAME_ACTIVE$2, orderClassName, directionalClassName);
        this._isSliding = false;
        triggerEvent(EVENT_SLID);
      };
      this._queueCallback(completeCallBack, activeElement, this._isAnimated());
      if (isCycling) {
        this.cycle();
      }
    }
    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_SLIDE);
    }
    _getActive() {
      return SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
    }
    _getItems() {
      return SelectorEngine.find(SELECTOR_ITEM, this._element);
    }
    _clearInterval() {
      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }
    }
    _directionToOrder(direction) {
      if (isRTL()) {
        return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
      }
      return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
    }
    _orderToDirection(order) {
      if (isRTL()) {
        return order === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
      }
      return order === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Carousel.getOrCreateInstance(this, config);
        if (typeof config === 'number') {
          data.to(config);
          return;
        }
        if (typeof config === 'string') {
          if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        }
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API$5, SELECTOR_DATA_SLIDE, function (event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
      return;
    }
    event.preventDefault();
    const carousel = Carousel.getOrCreateInstance(target);
    const slideIndex = this.getAttribute('data-bs-slide-to');
    if (slideIndex) {
      carousel.to(slideIndex);
      carousel._maybeEnableCycle();
      return;
    }
    if (Manipulator.getDataAttribute(this, 'slide') === 'next') {
      carousel.next();
      carousel._maybeEnableCycle();
      return;
    }
    carousel.prev();
    carousel._maybeEnableCycle();
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API$3, () => {
    const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);
    for (const carousel of carousels) {
      Carousel.getOrCreateInstance(carousel);
    }
  });

  /**
   * jQuery
   */

  defineJQueryPlugin(Carousel);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap collapse.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$b = 'collapse';
  const DATA_KEY$7 = 'bs.collapse';
  const EVENT_KEY$7 = `.${DATA_KEY$7}`;
  const DATA_API_KEY$4 = '.data-api';
  const EVENT_SHOW$6 = `show${EVENT_KEY$7}`;
  const EVENT_SHOWN$6 = `shown${EVENT_KEY$7}`;
  const EVENT_HIDE$6 = `hide${EVENT_KEY$7}`;
  const EVENT_HIDDEN$6 = `hidden${EVENT_KEY$7}`;
  const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$7}${DATA_API_KEY$4}`;
  const CLASS_NAME_SHOW$7 = 'show';
  const CLASS_NAME_COLLAPSE = 'collapse';
  const CLASS_NAME_COLLAPSING = 'collapsing';
  const CLASS_NAME_COLLAPSED = 'collapsed';
  const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
  const CLASS_NAME_HORIZONTAL = 'collapse-horizontal';
  const WIDTH = 'width';
  const HEIGHT = 'height';
  const SELECTOR_ACTIVES = '.collapse.show, .collapse.collapsing';
  const SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="collapse"]';
  const Default$a = {
    parent: null,
    toggle: true
  };
  const DefaultType$a = {
    parent: '(null|element)',
    toggle: 'boolean'
  };

  /**
   * Class definition
   */

  class Collapse extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._isTransitioning = false;
      this._triggerArray = [];
      const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);
      for (const elem of toggleList) {
        const selector = SelectorEngine.getSelectorFromElement(elem);
        const filterElement = SelectorEngine.find(selector).filter(foundElement => foundElement === this._element);
        if (selector !== null && filterElement.length) {
          this._triggerArray.push(elem);
        }
      }
      this._initializeChildren();
      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
      }
      if (this._config.toggle) {
        this.toggle();
      }
    }

    // Getters
    static get Default() {
      return Default$a;
    }
    static get DefaultType() {
      return DefaultType$a;
    }
    static get NAME() {
      return NAME$b;
    }

    // Public
    toggle() {
      if (this._isShown()) {
        this.hide();
      } else {
        this.show();
      }
    }
    show() {
      if (this._isTransitioning || this._isShown()) {
        return;
      }
      let activeChildren = [];

      // find active children
      if (this._config.parent) {
        activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter(element => element !== this._element).map(element => Collapse.getOrCreateInstance(element, {
          toggle: false
        }));
      }
      if (activeChildren.length && activeChildren[0]._isTransitioning) {
        return;
      }
      const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$6);
      if (startEvent.defaultPrevented) {
        return;
      }
      for (const activeInstance of activeChildren) {
        activeInstance.hide();
      }
      const dimension = this._getDimension();
      this._element.classList.remove(CLASS_NAME_COLLAPSE);
      this._element.classList.add(CLASS_NAME_COLLAPSING);
      this._element.style[dimension] = 0;
      this._addAriaAndCollapsedClass(this._triggerArray, true);
      this._isTransitioning = true;
      const complete = () => {
        this._isTransitioning = false;
        this._element.classList.remove(CLASS_NAME_COLLAPSING);
        this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
        this._element.style[dimension] = '';
        EventHandler.trigger(this._element, EVENT_SHOWN$6);
      };
      const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      const scrollSize = `scroll${capitalizedDimension}`;
      this._queueCallback(complete, this._element, true);
      this._element.style[dimension] = `${this._element[scrollSize]}px`;
    }
    hide() {
      if (this._isTransitioning || !this._isShown()) {
        return;
      }
      const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$6);
      if (startEvent.defaultPrevented) {
        return;
      }
      const dimension = this._getDimension();
      this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_COLLAPSING);
      this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
      for (const trigger of this._triggerArray) {
        const element = SelectorEngine.getElementFromSelector(trigger);
        if (element && !this._isShown(element)) {
          this._addAriaAndCollapsedClass([trigger], false);
        }
      }
      this._isTransitioning = true;
      const complete = () => {
        this._isTransitioning = false;
        this._element.classList.remove(CLASS_NAME_COLLAPSING);
        this._element.classList.add(CLASS_NAME_COLLAPSE);
        EventHandler.trigger(this._element, EVENT_HIDDEN$6);
      };
      this._element.style[dimension] = '';
      this._queueCallback(complete, this._element, true);
    }

    // Private
    _isShown(element = this._element) {
      return element.classList.contains(CLASS_NAME_SHOW$7);
    }
    _configAfterMerge(config) {
      config.toggle = Boolean(config.toggle); // Coerce string values
      config.parent = getElement(config.parent);
      return config;
    }
    _getDimension() {
      return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
    }
    _initializeChildren() {
      if (!this._config.parent) {
        return;
      }
      const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$4);
      for (const element of children) {
        const selected = SelectorEngine.getElementFromSelector(element);
        if (selected) {
          this._addAriaAndCollapsedClass([element], this._isShown(selected));
        }
      }
    }
    _getFirstLevelChildren(selector) {
      const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
      // remove children if greater depth
      return SelectorEngine.find(selector, this._config.parent).filter(element => !children.includes(element));
    }
    _addAriaAndCollapsedClass(triggerArray, isOpen) {
      if (!triggerArray.length) {
        return;
      }
      for (const element of triggerArray) {
        element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
        element.setAttribute('aria-expanded', isOpen);
      }
    }

    // Static
    static jQueryInterface(config) {
      const _config = {};
      if (typeof config === 'string' && /show|hide/.test(config)) {
        _config.toggle = false;
      }
      return this.each(function () {
        const data = Collapse.getOrCreateInstance(this, _config);
        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config]();
        }
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$4, function (event) {
    // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
    if (event.target.tagName === 'A' || event.delegateTarget && event.delegateTarget.tagName === 'A') {
      event.preventDefault();
    }
    for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) {
      Collapse.getOrCreateInstance(element, {
        toggle: false
      }).toggle();
    }
  });

  /**
   * jQuery
   */

  defineJQueryPlugin(Collapse);

  var top = 'top';
  var bottom = 'bottom';
  var right = 'right';
  var left = 'left';
  var auto = 'auto';
  var basePlacements = [top, bottom, right, left];
  var start = 'start';
  var end = 'end';
  var clippingParents = 'clippingParents';
  var viewport = 'viewport';
  var popper = 'popper';
  var reference = 'reference';
  var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
    return acc.concat([placement + "-" + start, placement + "-" + end]);
  }, []);
  var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
    return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
  }, []); // modifiers that need to read the DOM

  var beforeRead = 'beforeRead';
  var read = 'read';
  var afterRead = 'afterRead'; // pure-logic modifiers

  var beforeMain = 'beforeMain';
  var main = 'main';
  var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

  var beforeWrite = 'beforeWrite';
  var write = 'write';
  var afterWrite = 'afterWrite';
  var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

  function getNodeName(element) {
    return element ? (element.nodeName || '').toLowerCase() : null;
  }

  function getWindow(node) {
    if (node == null) {
      return window;
    }

    if (node.toString() !== '[object Window]') {
      var ownerDocument = node.ownerDocument;
      return ownerDocument ? ownerDocument.defaultView || window : window;
    }

    return node;
  }

  function isElement(node) {
    var OwnElement = getWindow(node).Element;
    return node instanceof OwnElement || node instanceof Element;
  }

  function isHTMLElement(node) {
    var OwnElement = getWindow(node).HTMLElement;
    return node instanceof OwnElement || node instanceof HTMLElement;
  }

  function isShadowRoot(node) {
    // IE 11 has no ShadowRoot
    if (typeof ShadowRoot === 'undefined') {
      return false;
    }

    var OwnElement = getWindow(node).ShadowRoot;
    return node instanceof OwnElement || node instanceof ShadowRoot;
  }

  // and applies them to the HTMLElements such as popper and arrow

  function applyStyles(_ref) {
    var state = _ref.state;
    Object.keys(state.elements).forEach(function (name) {
      var style = state.styles[name] || {};
      var attributes = state.attributes[name] || {};
      var element = state.elements[name]; // arrow is optional + virtual elements

      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      } // Flow doesn't support to extend this property, but it's the most
      // effective way to apply styles to an HTMLElement
      // $FlowFixMe[cannot-write]


      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function (name) {
        var value = attributes[name];

        if (value === false) {
          element.removeAttribute(name);
        } else {
          element.setAttribute(name, value === true ? '' : value);
        }
      });
    });
  }

  function effect$2(_ref2) {
    var state = _ref2.state;
    var initialStyles = {
      popper: {
        position: state.options.strategy,
        left: '0',
        top: '0',
        margin: '0'
      },
      arrow: {
        position: 'absolute'
      },
      reference: {}
    };
    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;

    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    }

    return function () {
      Object.keys(state.elements).forEach(function (name) {
        var element = state.elements[name];
        var attributes = state.attributes[name] || {};
        var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them

        var style = styleProperties.reduce(function (style, property) {
          style[property] = '';
          return style;
        }, {}); // arrow is optional + virtual elements

        if (!isHTMLElement(element) || !getNodeName(element)) {
          return;
        }

        Object.assign(element.style, style);
        Object.keys(attributes).forEach(function (attribute) {
          element.removeAttribute(attribute);
        });
      });
    };
  } // eslint-disable-next-line import/no-unused-modules


  const applyStyles$1 = {
    name: 'applyStyles',
    enabled: true,
    phase: 'write',
    fn: applyStyles,
    effect: effect$2,
    requires: ['computeStyles']
  };

  function getBasePlacement(placement) {
    return placement.split('-')[0];
  }

  var max = Math.max;
  var min = Math.min;
  var round = Math.round;

  function getUAString() {
    var uaData = navigator.userAgentData;

    if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
      return uaData.brands.map(function (item) {
        return item.brand + "/" + item.version;
      }).join(' ');
    }

    return navigator.userAgent;
  }

  function isLayoutViewport() {
    return !/^((?!chrome|android).)*safari/i.test(getUAString());
  }

  function getBoundingClientRect(element, includeScale, isFixedStrategy) {
    if (includeScale === void 0) {
      includeScale = false;
    }

    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }

    var clientRect = element.getBoundingClientRect();
    var scaleX = 1;
    var scaleY = 1;

    if (includeScale && isHTMLElement(element)) {
      scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
      scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
    }

    var _ref = isElement(element) ? getWindow(element) : window,
        visualViewport = _ref.visualViewport;

    var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
    var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
    var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
    var width = clientRect.width / scaleX;
    var height = clientRect.height / scaleY;
    return {
      width: width,
      height: height,
      top: y,
      right: x + width,
      bottom: y + height,
      left: x,
      x: x,
      y: y
    };
  }

  // means it doesn't take into account transforms.

  function getLayoutRect(element) {
    var clientRect = getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.
    // Fixes https://github.com/popperjs/popper-core/issues/1223

    var width = element.offsetWidth;
    var height = element.offsetHeight;

    if (Math.abs(clientRect.width - width) <= 1) {
      width = clientRect.width;
    }

    if (Math.abs(clientRect.height - height) <= 1) {
      height = clientRect.height;
    }

    return {
      x: element.offsetLeft,
      y: element.offsetTop,
      width: width,
      height: height
    };
  }

  function contains(parent, child) {
    var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method

    if (parent.contains(child)) {
      return true;
    } // then fallback to custom implementation with Shadow DOM support
    else if (rootNode && isShadowRoot(rootNode)) {
        var next = child;

        do {
          if (next && parent.isSameNode(next)) {
            return true;
          } // $FlowFixMe[prop-missing]: need a better way to handle this...


          next = next.parentNode || next.host;
        } while (next);
      } // Give up, the result is false


    return false;
  }

  function getComputedStyle$1(element) {
    return getWindow(element).getComputedStyle(element);
  }

  function isTableElement(element) {
    return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
  }

  function getDocumentElement(element) {
    // $FlowFixMe[incompatible-return]: assume body is always available
    return ((isElement(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
    element.document) || window.document).documentElement;
  }

  function getParentNode(element) {
    if (getNodeName(element) === 'html') {
      return element;
    }

    return (// this is a quicker (but less type safe) way to save quite some bytes from the bundle
      // $FlowFixMe[incompatible-return]
      // $FlowFixMe[prop-missing]
      element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
      element.parentNode || ( // DOM Element detected
      isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
      // $FlowFixMe[incompatible-call]: HTMLElement is a Node
      getDocumentElement(element) // fallback

    );
  }

  function getTrueOffsetParent(element) {
    if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
    getComputedStyle$1(element).position === 'fixed') {
      return null;
    }

    return element.offsetParent;
  } // `.offsetParent` reports `null` for fixed elements, while absolute elements
  // return the containing block


  function getContainingBlock(element) {
    var isFirefox = /firefox/i.test(getUAString());
    var isIE = /Trident/i.test(getUAString());

    if (isIE && isHTMLElement(element)) {
      // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
      var elementCss = getComputedStyle$1(element);

      if (elementCss.position === 'fixed') {
        return null;
      }
    }

    var currentNode = getParentNode(element);

    if (isShadowRoot(currentNode)) {
      currentNode = currentNode.host;
    }

    while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
      var css = getComputedStyle$1(currentNode); // This is non-exhaustive but covers the most common CSS properties that
      // create a containing block.
      // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

      if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
        return currentNode;
      } else {
        currentNode = currentNode.parentNode;
      }
    }

    return null;
  } // Gets the closest ancestor positioned element. Handles some edge cases,
  // such as table ancestors and cross browser bugs.


  function getOffsetParent(element) {
    var window = getWindow(element);
    var offsetParent = getTrueOffsetParent(element);

    while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === 'static') {
      offsetParent = getTrueOffsetParent(offsetParent);
    }

    if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle$1(offsetParent).position === 'static')) {
      return window;
    }

    return offsetParent || getContainingBlock(element) || window;
  }

  function getMainAxisFromPlacement(placement) {
    return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
  }

  function within(min$1, value, max$1) {
    return max(min$1, min(value, max$1));
  }
  function withinMaxClamp(min, value, max) {
    var v = within(min, value, max);
    return v > max ? max : v;
  }

  function getFreshSideObject() {
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }

  function mergePaddingObject(paddingObject) {
    return Object.assign({}, getFreshSideObject(), paddingObject);
  }

  function expandToHashMap(value, keys) {
    return keys.reduce(function (hashMap, key) {
      hashMap[key] = value;
      return hashMap;
    }, {});
  }

  var toPaddingObject = function toPaddingObject(padding, state) {
    padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
      placement: state.placement
    })) : padding;
    return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  };

  function arrow(_ref) {
    var _state$modifiersData$;

    var state = _ref.state,
        name = _ref.name,
        options = _ref.options;
    var arrowElement = state.elements.arrow;
    var popperOffsets = state.modifiersData.popperOffsets;
    var basePlacement = getBasePlacement(state.placement);
    var axis = getMainAxisFromPlacement(basePlacement);
    var isVertical = [left, right].indexOf(basePlacement) >= 0;
    var len = isVertical ? 'height' : 'width';

    if (!arrowElement || !popperOffsets) {
      return;
    }

    var paddingObject = toPaddingObject(options.padding, state);
    var arrowRect = getLayoutRect(arrowElement);
    var minProp = axis === 'y' ? top : left;
    var maxProp = axis === 'y' ? bottom : right;
    var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
    var startDiff = popperOffsets[axis] - state.rects.reference[axis];
    var arrowOffsetParent = getOffsetParent(arrowElement);
    var clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
    var centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
    // outside of the popper bounds

    var min = paddingObject[minProp];
    var max = clientSize - arrowRect[len] - paddingObject[maxProp];
    var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
    var offset = within(min, center, max); // Prevents breaking syntax highlighting...

    var axisProp = axis;
    state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
  }

  function effect$1(_ref2) {
    var state = _ref2.state,
        options = _ref2.options;
    var _options$element = options.element,
        arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;

    if (arrowElement == null) {
      return;
    } // CSS selector


    if (typeof arrowElement === 'string') {
      arrowElement = state.elements.popper.querySelector(arrowElement);

      if (!arrowElement) {
        return;
      }
    }

    if (!contains(state.elements.popper, arrowElement)) {
      return;
    }

    state.elements.arrow = arrowElement;
  } // eslint-disable-next-line import/no-unused-modules


  const arrow$1 = {
    name: 'arrow',
    enabled: true,
    phase: 'main',
    fn: arrow,
    effect: effect$1,
    requires: ['popperOffsets'],
    requiresIfExists: ['preventOverflow']
  };

  function getVariation(placement) {
    return placement.split('-')[1];
  }

  var unsetSides = {
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    left: 'auto'
  }; // Round the offsets to the nearest suitable subpixel based on the DPR.
  // Zooming can change the DPR, but it seems to report a value that will
  // cleanly divide the values into the appropriate subpixels.

  function roundOffsetsByDPR(_ref, win) {
    var x = _ref.x,
        y = _ref.y;
    var dpr = win.devicePixelRatio || 1;
    return {
      x: round(x * dpr) / dpr || 0,
      y: round(y * dpr) / dpr || 0
    };
  }

  function mapToStyles(_ref2) {
    var _Object$assign2;

    var popper = _ref2.popper,
        popperRect = _ref2.popperRect,
        placement = _ref2.placement,
        variation = _ref2.variation,
        offsets = _ref2.offsets,
        position = _ref2.position,
        gpuAcceleration = _ref2.gpuAcceleration,
        adaptive = _ref2.adaptive,
        roundOffsets = _ref2.roundOffsets,
        isFixed = _ref2.isFixed;
    var _offsets$x = offsets.x,
        x = _offsets$x === void 0 ? 0 : _offsets$x,
        _offsets$y = offsets.y,
        y = _offsets$y === void 0 ? 0 : _offsets$y;

    var _ref3 = typeof roundOffsets === 'function' ? roundOffsets({
      x: x,
      y: y
    }) : {
      x: x,
      y: y
    };

    x = _ref3.x;
    y = _ref3.y;
    var hasX = offsets.hasOwnProperty('x');
    var hasY = offsets.hasOwnProperty('y');
    var sideX = left;
    var sideY = top;
    var win = window;

    if (adaptive) {
      var offsetParent = getOffsetParent(popper);
      var heightProp = 'clientHeight';
      var widthProp = 'clientWidth';

      if (offsetParent === getWindow(popper)) {
        offsetParent = getDocumentElement(popper);

        if (getComputedStyle$1(offsetParent).position !== 'static' && position === 'absolute') {
          heightProp = 'scrollHeight';
          widthProp = 'scrollWidth';
        }
      } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it


      offsetParent = offsetParent;

      if (placement === top || (placement === left || placement === right) && variation === end) {
        sideY = bottom;
        var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : // $FlowFixMe[prop-missing]
        offsetParent[heightProp];
        y -= offsetY - popperRect.height;
        y *= gpuAcceleration ? 1 : -1;
      }

      if (placement === left || (placement === top || placement === bottom) && variation === end) {
        sideX = right;
        var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : // $FlowFixMe[prop-missing]
        offsetParent[widthProp];
        x -= offsetX - popperRect.width;
        x *= gpuAcceleration ? 1 : -1;
      }
    }

    var commonStyles = Object.assign({
      position: position
    }, adaptive && unsetSides);

    var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
      x: x,
      y: y
    }, getWindow(popper)) : {
      x: x,
      y: y
    };

    x = _ref4.x;
    y = _ref4.y;

    if (gpuAcceleration) {
      var _Object$assign;

      return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? '0' : '', _Object$assign[sideX] = hasX ? '0' : '', _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
    }

    return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : '', _Object$assign2[sideX] = hasX ? x + "px" : '', _Object$assign2.transform = '', _Object$assign2));
  }

  function computeStyles(_ref5) {
    var state = _ref5.state,
        options = _ref5.options;
    var _options$gpuAccelerat = options.gpuAcceleration,
        gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat,
        _options$adaptive = options.adaptive,
        adaptive = _options$adaptive === void 0 ? true : _options$adaptive,
        _options$roundOffsets = options.roundOffsets,
        roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
    var commonStyles = {
      placement: getBasePlacement(state.placement),
      variation: getVariation(state.placement),
      popper: state.elements.popper,
      popperRect: state.rects.popper,
      gpuAcceleration: gpuAcceleration,
      isFixed: state.options.strategy === 'fixed'
    };

    if (state.modifiersData.popperOffsets != null) {
      state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.popperOffsets,
        position: state.options.strategy,
        adaptive: adaptive,
        roundOffsets: roundOffsets
      })));
    }

    if (state.modifiersData.arrow != null) {
      state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
        offsets: state.modifiersData.arrow,
        position: 'absolute',
        adaptive: false,
        roundOffsets: roundOffsets
      })));
    }

    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      'data-popper-placement': state.placement
    });
  } // eslint-disable-next-line import/no-unused-modules


  const computeStyles$1 = {
    name: 'computeStyles',
    enabled: true,
    phase: 'beforeWrite',
    fn: computeStyles,
    data: {}
  };

  var passive = {
    passive: true
  };

  function effect(_ref) {
    var state = _ref.state,
        instance = _ref.instance,
        options = _ref.options;
    var _options$scroll = options.scroll,
        scroll = _options$scroll === void 0 ? true : _options$scroll,
        _options$resize = options.resize,
        resize = _options$resize === void 0 ? true : _options$resize;
    var window = getWindow(state.elements.popper);
    var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);

    if (scroll) {
      scrollParents.forEach(function (scrollParent) {
        scrollParent.addEventListener('scroll', instance.update, passive);
      });
    }

    if (resize) {
      window.addEventListener('resize', instance.update, passive);
    }

    return function () {
      if (scroll) {
        scrollParents.forEach(function (scrollParent) {
          scrollParent.removeEventListener('scroll', instance.update, passive);
        });
      }

      if (resize) {
        window.removeEventListener('resize', instance.update, passive);
      }
    };
  } // eslint-disable-next-line import/no-unused-modules


  const eventListeners = {
    name: 'eventListeners',
    enabled: true,
    phase: 'write',
    fn: function fn() {},
    effect: effect,
    data: {}
  };

  var hash$1 = {
    left: 'right',
    right: 'left',
    bottom: 'top',
    top: 'bottom'
  };
  function getOppositePlacement(placement) {
    return placement.replace(/left|right|bottom|top/g, function (matched) {
      return hash$1[matched];
    });
  }

  var hash = {
    start: 'end',
    end: 'start'
  };
  function getOppositeVariationPlacement(placement) {
    return placement.replace(/start|end/g, function (matched) {
      return hash[matched];
    });
  }

  function getWindowScroll(node) {
    var win = getWindow(node);
    var scrollLeft = win.pageXOffset;
    var scrollTop = win.pageYOffset;
    return {
      scrollLeft: scrollLeft,
      scrollTop: scrollTop
    };
  }

  function getWindowScrollBarX(element) {
    // If <html> has a CSS width greater than the viewport, then this will be
    // incorrect for RTL.
    // Popper 1 is broken in this case and never had a bug report so let's assume
    // it's not an issue. I don't think anyone ever specifies width on <html>
    // anyway.
    // Browsers where the left scrollbar doesn't cause an issue report `0` for
    // this (e.g. Edge 2019, IE11, Safari)
    return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
  }

  function getViewportRect(element, strategy) {
    var win = getWindow(element);
    var html = getDocumentElement(element);
    var visualViewport = win.visualViewport;
    var width = html.clientWidth;
    var height = html.clientHeight;
    var x = 0;
    var y = 0;

    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      var layoutViewport = isLayoutViewport();

      if (layoutViewport || !layoutViewport && strategy === 'fixed') {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }

    return {
      width: width,
      height: height,
      x: x + getWindowScrollBarX(element),
      y: y
    };
  }

  // of the `<html>` and `<body>` rect bounds if horizontally scrollable

  function getDocumentRect(element) {
    var _element$ownerDocumen;

    var html = getDocumentElement(element);
    var winScroll = getWindowScroll(element);
    var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
    var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
    var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
    var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
    var y = -winScroll.scrollTop;

    if (getComputedStyle$1(body || html).direction === 'rtl') {
      x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
    }

    return {
      width: width,
      height: height,
      x: x,
      y: y
    };
  }

  function isScrollParent(element) {
    // Firefox wants us to check `-x` and `-y` variations as well
    var _getComputedStyle = getComputedStyle$1(element),
        overflow = _getComputedStyle.overflow,
        overflowX = _getComputedStyle.overflowX,
        overflowY = _getComputedStyle.overflowY;

    return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
  }

  function getScrollParent(node) {
    if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
      // $FlowFixMe[incompatible-return]: assume body is always available
      return node.ownerDocument.body;
    }

    if (isHTMLElement(node) && isScrollParent(node)) {
      return node;
    }

    return getScrollParent(getParentNode(node));
  }

  /*
  given a DOM element, return the list of all scroll parents, up the list of ancesors
  until we get to the top window object. This list is what we attach scroll listeners
  to, because if any of these parent elements scroll, we'll need to re-calculate the
  reference element's position.
  */

  function listScrollParents(element, list) {
    var _element$ownerDocumen;

    if (list === void 0) {
      list = [];
    }

    var scrollParent = getScrollParent(element);
    var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
    var win = getWindow(scrollParent);
    var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
    var updatedList = list.concat(target);
    return isBody ? updatedList : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
    updatedList.concat(listScrollParents(getParentNode(target)));
  }

  function rectToClientRect(rect) {
    return Object.assign({}, rect, {
      left: rect.x,
      top: rect.y,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height
    });
  }

  function getInnerBoundingClientRect(element, strategy) {
    var rect = getBoundingClientRect(element, false, strategy === 'fixed');
    rect.top = rect.top + element.clientTop;
    rect.left = rect.left + element.clientLeft;
    rect.bottom = rect.top + element.clientHeight;
    rect.right = rect.left + element.clientWidth;
    rect.width = element.clientWidth;
    rect.height = element.clientHeight;
    rect.x = rect.left;
    rect.y = rect.top;
    return rect;
  }

  function getClientRectFromMixedType(element, clippingParent, strategy) {
    return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
  } // A "clipping parent" is an overflowable container with the characteristic of
  // clipping (or hiding) overflowing elements with a position different from
  // `initial`


  function getClippingParents(element) {
    var clippingParents = listScrollParents(getParentNode(element));
    var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle$1(element).position) >= 0;
    var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;

    if (!isElement(clipperElement)) {
      return [];
    } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414


    return clippingParents.filter(function (clippingParent) {
      return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body';
    });
  } // Gets the maximum area that the element is visible in due to any number of
  // clipping parents


  function getClippingRect(element, boundary, rootBoundary, strategy) {
    var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
    var clippingParents = [].concat(mainClippingParents, [rootBoundary]);
    var firstClippingParent = clippingParents[0];
    var clippingRect = clippingParents.reduce(function (accRect, clippingParent) {
      var rect = getClientRectFromMixedType(element, clippingParent, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromMixedType(element, firstClippingParent, strategy));
    clippingRect.width = clippingRect.right - clippingRect.left;
    clippingRect.height = clippingRect.bottom - clippingRect.top;
    clippingRect.x = clippingRect.left;
    clippingRect.y = clippingRect.top;
    return clippingRect;
  }

  function computeOffsets(_ref) {
    var reference = _ref.reference,
        element = _ref.element,
        placement = _ref.placement;
    var basePlacement = placement ? getBasePlacement(placement) : null;
    var variation = placement ? getVariation(placement) : null;
    var commonX = reference.x + reference.width / 2 - element.width / 2;
    var commonY = reference.y + reference.height / 2 - element.height / 2;
    var offsets;

    switch (basePlacement) {
      case top:
        offsets = {
          x: commonX,
          y: reference.y - element.height
        };
        break;

      case bottom:
        offsets = {
          x: commonX,
          y: reference.y + reference.height
        };
        break;

      case right:
        offsets = {
          x: reference.x + reference.width,
          y: commonY
        };
        break;

      case left:
        offsets = {
          x: reference.x - element.width,
          y: commonY
        };
        break;

      default:
        offsets = {
          x: reference.x,
          y: reference.y
        };
    }

    var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;

    if (mainAxis != null) {
      var len = mainAxis === 'y' ? 'height' : 'width';

      switch (variation) {
        case start:
          offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
          break;

        case end:
          offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
          break;
      }
    }

    return offsets;
  }

  function detectOverflow(state, options) {
    if (options === void 0) {
      options = {};
    }

    var _options = options,
        _options$placement = _options.placement,
        placement = _options$placement === void 0 ? state.placement : _options$placement,
        _options$strategy = _options.strategy,
        strategy = _options$strategy === void 0 ? state.strategy : _options$strategy,
        _options$boundary = _options.boundary,
        boundary = _options$boundary === void 0 ? clippingParents : _options$boundary,
        _options$rootBoundary = _options.rootBoundary,
        rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary,
        _options$elementConte = _options.elementContext,
        elementContext = _options$elementConte === void 0 ? popper : _options$elementConte,
        _options$altBoundary = _options.altBoundary,
        altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary,
        _options$padding = _options.padding,
        padding = _options$padding === void 0 ? 0 : _options$padding;
    var paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
    var altContext = elementContext === popper ? reference : popper;
    var popperRect = state.rects.popper;
    var element = state.elements[altBoundary ? altContext : elementContext];
    var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
    var referenceClientRect = getBoundingClientRect(state.elements.reference);
    var popperOffsets = computeOffsets({
      reference: referenceClientRect,
      element: popperRect,
      placement: placement
    });
    var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
    var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect
    // 0 or negative = within the clipping rect

    var overflowOffsets = {
      top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
      bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
      left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
      right: elementClientRect.right - clippingClientRect.right + paddingObject.right
    };
    var offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element

    if (elementContext === popper && offsetData) {
      var offset = offsetData[placement];
      Object.keys(overflowOffsets).forEach(function (key) {
        var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
        var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
        overflowOffsets[key] += offset[axis] * multiply;
      });
    }

    return overflowOffsets;
  }

  function computeAutoPlacement(state, options) {
    if (options === void 0) {
      options = {};
    }

    var _options = options,
        placement = _options.placement,
        boundary = _options.boundary,
        rootBoundary = _options.rootBoundary,
        padding = _options.padding,
        flipVariations = _options.flipVariations,
        _options$allowedAutoP = _options.allowedAutoPlacements,
        allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
    var variation = getVariation(placement);
    var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function (placement) {
      return getVariation(placement) === variation;
    }) : basePlacements;
    var allowedPlacements = placements$1.filter(function (placement) {
      return allowedAutoPlacements.indexOf(placement) >= 0;
    });

    if (allowedPlacements.length === 0) {
      allowedPlacements = placements$1;
    } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...


    var overflows = allowedPlacements.reduce(function (acc, placement) {
      acc[placement] = detectOverflow(state, {
        placement: placement,
        boundary: boundary,
        rootBoundary: rootBoundary,
        padding: padding
      })[getBasePlacement(placement)];
      return acc;
    }, {});
    return Object.keys(overflows).sort(function (a, b) {
      return overflows[a] - overflows[b];
    });
  }

  function getExpandedFallbackPlacements(placement) {
    if (getBasePlacement(placement) === auto) {
      return [];
    }

    var oppositePlacement = getOppositePlacement(placement);
    return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
  }

  function flip(_ref) {
    var state = _ref.state,
        options = _ref.options,
        name = _ref.name;

    if (state.modifiersData[name]._skip) {
      return;
    }

    var _options$mainAxis = options.mainAxis,
        checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
        _options$altAxis = options.altAxis,
        checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis,
        specifiedFallbackPlacements = options.fallbackPlacements,
        padding = options.padding,
        boundary = options.boundary,
        rootBoundary = options.rootBoundary,
        altBoundary = options.altBoundary,
        _options$flipVariatio = options.flipVariations,
        flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio,
        allowedAutoPlacements = options.allowedAutoPlacements;
    var preferredPlacement = state.options.placement;
    var basePlacement = getBasePlacement(preferredPlacement);
    var isBasePlacement = basePlacement === preferredPlacement;
    var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
    var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement) {
      return acc.concat(getBasePlacement(placement) === auto ? computeAutoPlacement(state, {
        placement: placement,
        boundary: boundary,
        rootBoundary: rootBoundary,
        padding: padding,
        flipVariations: flipVariations,
        allowedAutoPlacements: allowedAutoPlacements
      }) : placement);
    }, []);
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var checksMap = new Map();
    var makeFallbackChecks = true;
    var firstFittingPlacement = placements[0];

    for (var i = 0; i < placements.length; i++) {
      var placement = placements[i];

      var _basePlacement = getBasePlacement(placement);

      var isStartVariation = getVariation(placement) === start;
      var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
      var len = isVertical ? 'width' : 'height';
      var overflow = detectOverflow(state, {
        placement: placement,
        boundary: boundary,
        rootBoundary: rootBoundary,
        altBoundary: altBoundary,
        padding: padding
      });
      var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;

      if (referenceRect[len] > popperRect[len]) {
        mainVariationSide = getOppositePlacement(mainVariationSide);
      }

      var altVariationSide = getOppositePlacement(mainVariationSide);
      var checks = [];

      if (checkMainAxis) {
        checks.push(overflow[_basePlacement] <= 0);
      }

      if (checkAltAxis) {
        checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
      }

      if (checks.every(function (check) {
        return check;
      })) {
        firstFittingPlacement = placement;
        makeFallbackChecks = false;
        break;
      }

      checksMap.set(placement, checks);
    }

    if (makeFallbackChecks) {
      // `2` may be desired in some cases – research later
      var numberOfChecks = flipVariations ? 3 : 1;

      var _loop = function _loop(_i) {
        var fittingPlacement = placements.find(function (placement) {
          var checks = checksMap.get(placement);

          if (checks) {
            return checks.slice(0, _i).every(function (check) {
              return check;
            });
          }
        });

        if (fittingPlacement) {
          firstFittingPlacement = fittingPlacement;
          return "break";
        }
      };

      for (var _i = numberOfChecks; _i > 0; _i--) {
        var _ret = _loop(_i);

        if (_ret === "break") break;
      }
    }

    if (state.placement !== firstFittingPlacement) {
      state.modifiersData[name]._skip = true;
      state.placement = firstFittingPlacement;
      state.reset = true;
    }
  } // eslint-disable-next-line import/no-unused-modules


  const flip$1 = {
    name: 'flip',
    enabled: true,
    phase: 'main',
    fn: flip,
    requiresIfExists: ['offset'],
    data: {
      _skip: false
    }
  };

  function getSideOffsets(overflow, rect, preventedOffsets) {
    if (preventedOffsets === void 0) {
      preventedOffsets = {
        x: 0,
        y: 0
      };
    }

    return {
      top: overflow.top - rect.height - preventedOffsets.y,
      right: overflow.right - rect.width + preventedOffsets.x,
      bottom: overflow.bottom - rect.height + preventedOffsets.y,
      left: overflow.left - rect.width - preventedOffsets.x
    };
  }

  function isAnySideFullyClipped(overflow) {
    return [top, right, bottom, left].some(function (side) {
      return overflow[side] >= 0;
    });
  }

  function hide(_ref) {
    var state = _ref.state,
        name = _ref.name;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var preventedOffsets = state.modifiersData.preventOverflow;
    var referenceOverflow = detectOverflow(state, {
      elementContext: 'reference'
    });
    var popperAltOverflow = detectOverflow(state, {
      altBoundary: true
    });
    var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
    var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
    var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
    var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
    state.modifiersData[name] = {
      referenceClippingOffsets: referenceClippingOffsets,
      popperEscapeOffsets: popperEscapeOffsets,
      isReferenceHidden: isReferenceHidden,
      hasPopperEscaped: hasPopperEscaped
    };
    state.attributes.popper = Object.assign({}, state.attributes.popper, {
      'data-popper-reference-hidden': isReferenceHidden,
      'data-popper-escaped': hasPopperEscaped
    });
  } // eslint-disable-next-line import/no-unused-modules


  const hide$1 = {
    name: 'hide',
    enabled: true,
    phase: 'main',
    requiresIfExists: ['preventOverflow'],
    fn: hide
  };

  function distanceAndSkiddingToXY(placement, rects, offset) {
    var basePlacement = getBasePlacement(placement);
    var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;

    var _ref = typeof offset === 'function' ? offset(Object.assign({}, rects, {
      placement: placement
    })) : offset,
        skidding = _ref[0],
        distance = _ref[1];

    skidding = skidding || 0;
    distance = (distance || 0) * invertDistance;
    return [left, right].indexOf(basePlacement) >= 0 ? {
      x: distance,
      y: skidding
    } : {
      x: skidding,
      y: distance
    };
  }

  function offset(_ref2) {
    var state = _ref2.state,
        options = _ref2.options,
        name = _ref2.name;
    var _options$offset = options.offset,
        offset = _options$offset === void 0 ? [0, 0] : _options$offset;
    var data = placements.reduce(function (acc, placement) {
      acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
      return acc;
    }, {});
    var _data$state$placement = data[state.placement],
        x = _data$state$placement.x,
        y = _data$state$placement.y;

    if (state.modifiersData.popperOffsets != null) {
      state.modifiersData.popperOffsets.x += x;
      state.modifiersData.popperOffsets.y += y;
    }

    state.modifiersData[name] = data;
  } // eslint-disable-next-line import/no-unused-modules


  const offset$1 = {
    name: 'offset',
    enabled: true,
    phase: 'main',
    requires: ['popperOffsets'],
    fn: offset
  };

  function popperOffsets(_ref) {
    var state = _ref.state,
        name = _ref.name;
    // Offsets are the actual position the popper needs to have to be
    // properly positioned near its reference element
    // This is the most basic placement, and will be adjusted by
    // the modifiers in the next step
    state.modifiersData[name] = computeOffsets({
      reference: state.rects.reference,
      element: state.rects.popper,
      placement: state.placement
    });
  } // eslint-disable-next-line import/no-unused-modules


  const popperOffsets$1 = {
    name: 'popperOffsets',
    enabled: true,
    phase: 'read',
    fn: popperOffsets,
    data: {}
  };

  function getAltAxis(axis) {
    return axis === 'x' ? 'y' : 'x';
  }

  function preventOverflow(_ref) {
    var state = _ref.state,
        options = _ref.options,
        name = _ref.name;
    var _options$mainAxis = options.mainAxis,
        checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
        _options$altAxis = options.altAxis,
        checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
        boundary = options.boundary,
        rootBoundary = options.rootBoundary,
        altBoundary = options.altBoundary,
        padding = options.padding,
        _options$tether = options.tether,
        tether = _options$tether === void 0 ? true : _options$tether,
        _options$tetherOffset = options.tetherOffset,
        tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
    var overflow = detectOverflow(state, {
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding,
      altBoundary: altBoundary
    });
    var basePlacement = getBasePlacement(state.placement);
    var variation = getVariation(state.placement);
    var isBasePlacement = !variation;
    var mainAxis = getMainAxisFromPlacement(basePlacement);
    var altAxis = getAltAxis(mainAxis);
    var popperOffsets = state.modifiersData.popperOffsets;
    var referenceRect = state.rects.reference;
    var popperRect = state.rects.popper;
    var tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
      placement: state.placement
    })) : tetherOffset;
    var normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? {
      mainAxis: tetherOffsetValue,
      altAxis: tetherOffsetValue
    } : Object.assign({
      mainAxis: 0,
      altAxis: 0
    }, tetherOffsetValue);
    var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
    var data = {
      x: 0,
      y: 0
    };

    if (!popperOffsets) {
      return;
    }

    if (checkMainAxis) {
      var _offsetModifierState$;

      var mainSide = mainAxis === 'y' ? top : left;
      var altSide = mainAxis === 'y' ? bottom : right;
      var len = mainAxis === 'y' ? 'height' : 'width';
      var offset = popperOffsets[mainAxis];
      var min$1 = offset + overflow[mainSide];
      var max$1 = offset - overflow[altSide];
      var additive = tether ? -popperRect[len] / 2 : 0;
      var minLen = variation === start ? referenceRect[len] : popperRect[len];
      var maxLen = variation === start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
      // outside the reference bounds

      var arrowElement = state.elements.arrow;
      var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
        width: 0,
        height: 0
      };
      var arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
      var arrowPaddingMin = arrowPaddingObject[mainSide];
      var arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want
      // to include its full size in the calculation. If the reference is small
      // and near the edge of a boundary, the popper can overflow even if the
      // reference is not overflowing as well (e.g. virtual elements with no
      // width or height)

      var arrowLen = within(0, referenceRect[len], arrowRect[len]);
      var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
      var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
      var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
      var clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
      var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
      var tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
      var tetherMax = offset + maxOffset - offsetModifierValue;
      var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset, tether ? max(max$1, tetherMax) : max$1);
      popperOffsets[mainAxis] = preventedOffset;
      data[mainAxis] = preventedOffset - offset;
    }

    if (checkAltAxis) {
      var _offsetModifierState$2;

      var _mainSide = mainAxis === 'x' ? top : left;

      var _altSide = mainAxis === 'x' ? bottom : right;

      var _offset = popperOffsets[altAxis];

      var _len = altAxis === 'y' ? 'height' : 'width';

      var _min = _offset + overflow[_mainSide];

      var _max = _offset - overflow[_altSide];

      var isOriginSide = [top, left].indexOf(basePlacement) !== -1;

      var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;

      var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;

      var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;

      var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);

      popperOffsets[altAxis] = _preventedOffset;
      data[altAxis] = _preventedOffset - _offset;
    }

    state.modifiersData[name] = data;
  } // eslint-disable-next-line import/no-unused-modules


  const preventOverflow$1 = {
    name: 'preventOverflow',
    enabled: true,
    phase: 'main',
    fn: preventOverflow,
    requiresIfExists: ['offset']
  };

  function getHTMLElementScroll(element) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }

  function getNodeScroll(node) {
    if (node === getWindow(node) || !isHTMLElement(node)) {
      return getWindowScroll(node);
    } else {
      return getHTMLElementScroll(node);
    }
  }

  function isElementScaled(element) {
    var rect = element.getBoundingClientRect();
    var scaleX = round(rect.width) / element.offsetWidth || 1;
    var scaleY = round(rect.height) / element.offsetHeight || 1;
    return scaleX !== 1 || scaleY !== 1;
  } // Returns the composite rect of an element relative to its offsetParent.
  // Composite means it takes into account transforms as well as layout.


  function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
    if (isFixed === void 0) {
      isFixed = false;
    }

    var isOffsetParentAnElement = isHTMLElement(offsetParent);
    var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
    var documentElement = getDocumentElement(offsetParent);
    var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
    var scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    var offsets = {
      x: 0,
      y: 0
    };

    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== 'body' || // https://github.com/popperjs/popper-core/issues/1078
      isScrollParent(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }

      if (isHTMLElement(offsetParent)) {
        offsets = getBoundingClientRect(offsetParent, true);
        offsets.x += offsetParent.clientLeft;
        offsets.y += offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }

    return {
      x: rect.left + scroll.scrollLeft - offsets.x,
      y: rect.top + scroll.scrollTop - offsets.y,
      width: rect.width,
      height: rect.height
    };
  }

  function order(modifiers) {
    var map = new Map();
    var visited = new Set();
    var result = [];
    modifiers.forEach(function (modifier) {
      map.set(modifier.name, modifier);
    }); // On visiting object, check for its dependencies and visit them recursively

    function sort(modifier) {
      visited.add(modifier.name);
      var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
      requires.forEach(function (dep) {
        if (!visited.has(dep)) {
          var depModifier = map.get(dep);

          if (depModifier) {
            sort(depModifier);
          }
        }
      });
      result.push(modifier);
    }

    modifiers.forEach(function (modifier) {
      if (!visited.has(modifier.name)) {
        // check for visited object
        sort(modifier);
      }
    });
    return result;
  }

  function orderModifiers(modifiers) {
    // order based on dependencies
    var orderedModifiers = order(modifiers); // order based on phase

    return modifierPhases.reduce(function (acc, phase) {
      return acc.concat(orderedModifiers.filter(function (modifier) {
        return modifier.phase === phase;
      }));
    }, []);
  }

  function debounce(fn) {
    var pending;
    return function () {
      if (!pending) {
        pending = new Promise(function (resolve) {
          Promise.resolve().then(function () {
            pending = undefined;
            resolve(fn());
          });
        });
      }

      return pending;
    };
  }

  function mergeByName(modifiers) {
    var merged = modifiers.reduce(function (merged, current) {
      var existing = merged[current.name];
      merged[current.name] = existing ? Object.assign({}, existing, current, {
        options: Object.assign({}, existing.options, current.options),
        data: Object.assign({}, existing.data, current.data)
      }) : current;
      return merged;
    }, {}); // IE11 does not support Object.values

    return Object.keys(merged).map(function (key) {
      return merged[key];
    });
  }

  var DEFAULT_OPTIONS = {
    placement: 'bottom',
    modifiers: [],
    strategy: 'absolute'
  };

  function areValidElements() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return !args.some(function (element) {
      return !(element && typeof element.getBoundingClientRect === 'function');
    });
  }

  function popperGenerator(generatorOptions) {
    if (generatorOptions === void 0) {
      generatorOptions = {};
    }

    var _generatorOptions = generatorOptions,
        _generatorOptions$def = _generatorOptions.defaultModifiers,
        defaultModifiers = _generatorOptions$def === void 0 ? [] : _generatorOptions$def,
        _generatorOptions$def2 = _generatorOptions.defaultOptions,
        defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
    return function createPopper(reference, popper, options) {
      if (options === void 0) {
        options = defaultOptions;
      }

      var state = {
        placement: 'bottom',
        orderedModifiers: [],
        options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
        modifiersData: {},
        elements: {
          reference: reference,
          popper: popper
        },
        attributes: {},
        styles: {}
      };
      var effectCleanupFns = [];
      var isDestroyed = false;
      var instance = {
        state: state,
        setOptions: function setOptions(setOptionsAction) {
          var options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
          cleanupModifierEffects();
          state.options = Object.assign({}, defaultOptions, state.options, options);
          state.scrollParents = {
            reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
            popper: listScrollParents(popper)
          }; // Orders the modifiers based on their dependencies and `phase`
          // properties

          var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers))); // Strip out disabled modifiers

          state.orderedModifiers = orderedModifiers.filter(function (m) {
            return m.enabled;
          });
          runModifierEffects();
          return instance.update();
        },
        // Sync update – it will always be executed, even if not necessary. This
        // is useful for low frequency updates where sync behavior simplifies the
        // logic.
        // For high frequency updates (e.g. `resize` and `scroll` events), always
        // prefer the async Popper#update method
        forceUpdate: function forceUpdate() {
          if (isDestroyed) {
            return;
          }

          var _state$elements = state.elements,
              reference = _state$elements.reference,
              popper = _state$elements.popper; // Don't proceed if `reference` or `popper` are not valid elements
          // anymore

          if (!areValidElements(reference, popper)) {
            return;
          } // Store the reference and popper rects to be read by modifiers


          state.rects = {
            reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
            popper: getLayoutRect(popper)
          }; // Modifiers have the ability to reset the current update cycle. The
          // most common use case for this is the `flip` modifier changing the
          // placement, which then needs to re-run all the modifiers, because the
          // logic was previously ran for the previous placement and is therefore
          // stale/incorrect

          state.reset = false;
          state.placement = state.options.placement; // On each update cycle, the `modifiersData` property for each modifier
          // is filled with the initial data specified by the modifier. This means
          // it doesn't persist and is fresh on each update.
          // To ensure persistent data, use `${name}#persistent`

          state.orderedModifiers.forEach(function (modifier) {
            return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
          });

          for (var index = 0; index < state.orderedModifiers.length; index++) {
            if (state.reset === true) {
              state.reset = false;
              index = -1;
              continue;
            }

            var _state$orderedModifie = state.orderedModifiers[index],
                fn = _state$orderedModifie.fn,
                _state$orderedModifie2 = _state$orderedModifie.options,
                _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2,
                name = _state$orderedModifie.name;

            if (typeof fn === 'function') {
              state = fn({
                state: state,
                options: _options,
                name: name,
                instance: instance
              }) || state;
            }
          }
        },
        // Async and optimistically optimized update – it will not be executed if
        // not necessary (debounced to run at most once-per-tick)
        update: debounce(function () {
          return new Promise(function (resolve) {
            instance.forceUpdate();
            resolve(state);
          });
        }),
        destroy: function destroy() {
          cleanupModifierEffects();
          isDestroyed = true;
        }
      };

      if (!areValidElements(reference, popper)) {
        return instance;
      }

      instance.setOptions(options).then(function (state) {
        if (!isDestroyed && options.onFirstUpdate) {
          options.onFirstUpdate(state);
        }
      }); // Modifiers have the ability to execute arbitrary code before the first
      // update cycle runs. They will be executed in the same order as the update
      // cycle. This is useful when a modifier adds some persistent data that
      // other modifiers need to use, but the modifier is run after the dependent
      // one.

      function runModifierEffects() {
        state.orderedModifiers.forEach(function (_ref) {
          var name = _ref.name,
              _ref$options = _ref.options,
              options = _ref$options === void 0 ? {} : _ref$options,
              effect = _ref.effect;

          if (typeof effect === 'function') {
            var cleanupFn = effect({
              state: state,
              name: name,
              instance: instance,
              options: options
            });

            var noopFn = function noopFn() {};

            effectCleanupFns.push(cleanupFn || noopFn);
          }
        });
      }

      function cleanupModifierEffects() {
        effectCleanupFns.forEach(function (fn) {
          return fn();
        });
        effectCleanupFns = [];
      }

      return instance;
    };
  }
  var createPopper$2 = /*#__PURE__*/popperGenerator(); // eslint-disable-next-line import/no-unused-modules

  var defaultModifiers$1 = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1];
  var createPopper$1 = /*#__PURE__*/popperGenerator({
    defaultModifiers: defaultModifiers$1
  }); // eslint-disable-next-line import/no-unused-modules

  var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
  var createPopper = /*#__PURE__*/popperGenerator({
    defaultModifiers: defaultModifiers
  }); // eslint-disable-next-line import/no-unused-modules

  const Popper = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    afterMain,
    afterRead,
    afterWrite,
    applyStyles: applyStyles$1,
    arrow: arrow$1,
    auto,
    basePlacements,
    beforeMain,
    beforeRead,
    beforeWrite,
    bottom,
    clippingParents,
    computeStyles: computeStyles$1,
    createPopper,
    createPopperBase: createPopper$2,
    createPopperLite: createPopper$1,
    detectOverflow,
    end,
    eventListeners,
    flip: flip$1,
    hide: hide$1,
    left,
    main,
    modifierPhases,
    offset: offset$1,
    placements,
    popper,
    popperGenerator,
    popperOffsets: popperOffsets$1,
    preventOverflow: preventOverflow$1,
    read,
    reference,
    right,
    start,
    top,
    variationPlacements,
    viewport,
    write
  }, Symbol.toStringTag, { value: 'Module' }));

  /**
   * --------------------------------------------------------------------------
   * Bootstrap dropdown.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$a = 'dropdown';
  const DATA_KEY$6 = 'bs.dropdown';
  const EVENT_KEY$6 = `.${DATA_KEY$6}`;
  const DATA_API_KEY$3 = '.data-api';
  const ESCAPE_KEY$2 = 'Escape';
  const TAB_KEY$1 = 'Tab';
  const ARROW_UP_KEY$1 = 'ArrowUp';
  const ARROW_DOWN_KEY$1 = 'ArrowDown';
  const RIGHT_MOUSE_BUTTON = 2; // MouseEvent.button value for the secondary button, usually the right button

  const EVENT_HIDE$5 = `hide${EVENT_KEY$6}`;
  const EVENT_HIDDEN$5 = `hidden${EVENT_KEY$6}`;
  const EVENT_SHOW$5 = `show${EVENT_KEY$6}`;
  const EVENT_SHOWN$5 = `shown${EVENT_KEY$6}`;
  const EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$6}${DATA_API_KEY$3}`;
  const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$6}${DATA_API_KEY$3}`;
  const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$6}${DATA_API_KEY$3}`;
  const CLASS_NAME_SHOW$6 = 'show';
  const CLASS_NAME_DROPUP = 'dropup';
  const CLASS_NAME_DROPEND = 'dropend';
  const CLASS_NAME_DROPSTART = 'dropstart';
  const CLASS_NAME_DROPUP_CENTER = 'dropup-center';
  const CLASS_NAME_DROPDOWN_CENTER = 'dropdown-center';
  const SELECTOR_DATA_TOGGLE$3 = '[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)';
  const SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE$3}.${CLASS_NAME_SHOW$6}`;
  const SELECTOR_MENU = '.dropdown-menu';
  const SELECTOR_NAVBAR = '.navbar';
  const SELECTOR_NAVBAR_NAV = '.navbar-nav';
  const SELECTOR_VISIBLE_ITEMS = '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)';
  const PLACEMENT_TOP = isRTL() ? 'top-end' : 'top-start';
  const PLACEMENT_TOPEND = isRTL() ? 'top-start' : 'top-end';
  const PLACEMENT_BOTTOM = isRTL() ? 'bottom-end' : 'bottom-start';
  const PLACEMENT_BOTTOMEND = isRTL() ? 'bottom-start' : 'bottom-end';
  const PLACEMENT_RIGHT = isRTL() ? 'left-start' : 'right-start';
  const PLACEMENT_LEFT = isRTL() ? 'right-start' : 'left-start';
  const PLACEMENT_TOPCENTER = 'top';
  const PLACEMENT_BOTTOMCENTER = 'bottom';
  const Default$9 = {
    autoClose: true,
    boundary: 'clippingParents',
    display: 'dynamic',
    offset: [0, 2],
    popperConfig: null,
    reference: 'toggle'
  };
  const DefaultType$9 = {
    autoClose: '(boolean|string)',
    boundary: '(string|element)',
    display: 'string',
    offset: '(array|string|function)',
    popperConfig: '(null|object|function)',
    reference: '(string|element|object)'
  };

  /**
   * Class definition
   */

  class Dropdown extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._popper = null;
      this._parent = this._element.parentNode; // dropdown wrapper
      // TODO: v6 revert #37011 & change markup https://getbootstrap.com/docs/5.3/forms/input-group/
      this._menu = SelectorEngine.next(this._element, SELECTOR_MENU)[0] || SelectorEngine.prev(this._element, SELECTOR_MENU)[0] || SelectorEngine.findOne(SELECTOR_MENU, this._parent);
      this._inNavbar = this._detectNavbar();
    }

    // Getters
    static get Default() {
      return Default$9;
    }
    static get DefaultType() {
      return DefaultType$9;
    }
    static get NAME() {
      return NAME$a;
    }

    // Public
    toggle() {
      return this._isShown() ? this.hide() : this.show();
    }
    show() {
      if (isDisabled(this._element) || this._isShown()) {
        return;
      }
      const relatedTarget = {
        relatedTarget: this._element
      };
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$5, relatedTarget);
      if (showEvent.defaultPrevented) {
        return;
      }
      this._createPopper();

      // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
      if ('ontouchstart' in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.on(element, 'mouseover', noop);
        }
      }
      this._element.focus();
      this._element.setAttribute('aria-expanded', true);
      this._menu.classList.add(CLASS_NAME_SHOW$6);
      this._element.classList.add(CLASS_NAME_SHOW$6);
      EventHandler.trigger(this._element, EVENT_SHOWN$5, relatedTarget);
    }
    hide() {
      if (isDisabled(this._element) || !this._isShown()) {
        return;
      }
      const relatedTarget = {
        relatedTarget: this._element
      };
      this._completeHide(relatedTarget);
    }
    dispose() {
      if (this._popper) {
        this._popper.destroy();
      }
      super.dispose();
    }
    update() {
      this._inNavbar = this._detectNavbar();
      if (this._popper) {
        this._popper.update();
      }
    }

    // Private
    _completeHide(relatedTarget) {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$5, relatedTarget);
      if (hideEvent.defaultPrevented) {
        return;
      }

      // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support
      if ('ontouchstart' in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.off(element, 'mouseover', noop);
        }
      }
      if (this._popper) {
        this._popper.destroy();
      }
      this._menu.classList.remove(CLASS_NAME_SHOW$6);
      this._element.classList.remove(CLASS_NAME_SHOW$6);
      this._element.setAttribute('aria-expanded', 'false');
      Manipulator.removeDataAttribute(this._menu, 'popper');
      EventHandler.trigger(this._element, EVENT_HIDDEN$5, relatedTarget);
    }
    _getConfig(config) {
      config = super._getConfig(config);
      if (typeof config.reference === 'object' && !isElement$1(config.reference) && typeof config.reference.getBoundingClientRect !== 'function') {
        // Popper virtual elements require a getBoundingClientRect method
        throw new TypeError(`${NAME$a.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
      }
      return config;
    }
    _createPopper() {
      if (typeof Popper === 'undefined') {
        throw new TypeError('Bootstrap\'s dropdowns require Popper (https://popper.js.org/docs/v2/)');
      }
      let referenceElement = this._element;
      if (this._config.reference === 'parent') {
        referenceElement = this._parent;
      } else if (isElement$1(this._config.reference)) {
        referenceElement = getElement(this._config.reference);
      } else if (typeof this._config.reference === 'object') {
        referenceElement = this._config.reference;
      }
      const popperConfig = this._getPopperConfig();
      this._popper = createPopper(referenceElement, this._menu, popperConfig);
    }
    _isShown() {
      return this._menu.classList.contains(CLASS_NAME_SHOW$6);
    }
    _getPlacement() {
      const parentDropdown = this._parent;
      if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
        return PLACEMENT_RIGHT;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
        return PLACEMENT_LEFT;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) {
        return PLACEMENT_TOPCENTER;
      }
      if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) {
        return PLACEMENT_BOTTOMCENTER;
      }

      // We need to trim the value because custom properties can also include spaces
      const isEnd = getComputedStyle(this._menu).getPropertyValue('--bs-position').trim() === 'end';
      if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
        return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
      }
      return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
    }
    _detectNavbar() {
      return this._element.closest(SELECTOR_NAVBAR) !== null;
    }
    _getOffset() {
      const {
        offset
      } = this._config;
      if (typeof offset === 'string') {
        return offset.split(',').map(value => Number.parseInt(value, 10));
      }
      if (typeof offset === 'function') {
        return popperData => offset(popperData, this._element);
      }
      return offset;
    }
    _getPopperConfig() {
      const defaultBsPopperConfig = {
        placement: this._getPlacement(),
        modifiers: [{
          name: 'preventOverflow',
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: 'offset',
          options: {
            offset: this._getOffset()
          }
        }]
      };

      // Disable Popper if we have a static display or Dropdown is in Navbar
      if (this._inNavbar || this._config.display === 'static') {
        Manipulator.setDataAttribute(this._menu, 'popper', 'static'); // TODO: v6 remove
        defaultBsPopperConfig.modifiers = [{
          name: 'applyStyles',
          enabled: false
        }];
      }
      return {
        ...defaultBsPopperConfig,
        ...execute(this._config.popperConfig, [undefined, defaultBsPopperConfig])
      };
    }
    _selectMenuItem({
      key,
      target
    }) {
      const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter(element => isVisible(element));
      if (!items.length) {
        return;
      }

      // if target isn't included in items (e.g. when expanding the dropdown)
      // allow cycling to get the last item in case key equals ARROW_UP_KEY
      getNextActiveElement(items, target, key === ARROW_DOWN_KEY$1, !items.includes(target)).focus();
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Dropdown.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
    static clearMenus(event) {
      if (event.button === RIGHT_MOUSE_BUTTON || event.type === 'keyup' && event.key !== TAB_KEY$1) {
        return;
      }
      const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN);
      for (const toggle of openToggles) {
        const context = Dropdown.getInstance(toggle);
        if (!context || context._config.autoClose === false) {
          continue;
        }
        const composedPath = event.composedPath();
        const isMenuTarget = composedPath.includes(context._menu);
        if (composedPath.includes(context._element) || context._config.autoClose === 'inside' && !isMenuTarget || context._config.autoClose === 'outside' && isMenuTarget) {
          continue;
        }

        // Tab navigation through the dropdown menu or events from contained inputs shouldn't close the menu
        if (context._menu.contains(event.target) && (event.type === 'keyup' && event.key === TAB_KEY$1 || /input|select|option|textarea|form/i.test(event.target.tagName))) {
          continue;
        }
        const relatedTarget = {
          relatedTarget: context._element
        };
        if (event.type === 'click') {
          relatedTarget.clickEvent = event;
        }
        context._completeHide(relatedTarget);
      }
    }
    static dataApiKeydownHandler(event) {
      // If not an UP | DOWN | ESCAPE key => not a dropdown command
      // If input/textarea && if key is other than ESCAPE => not a dropdown command

      const isInput = /input|textarea/i.test(event.target.tagName);
      const isEscapeEvent = event.key === ESCAPE_KEY$2;
      const isUpOrDownEvent = [ARROW_UP_KEY$1, ARROW_DOWN_KEY$1].includes(event.key);
      if (!isUpOrDownEvent && !isEscapeEvent) {
        return;
      }
      if (isInput && !isEscapeEvent) {
        return;
      }
      event.preventDefault();

      // TODO: v6 revert #37011 & change markup https://getbootstrap.com/docs/5.3/forms/input-group/
      const getToggleButton = this.matches(SELECTOR_DATA_TOGGLE$3) ? this : SelectorEngine.prev(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.next(this, SELECTOR_DATA_TOGGLE$3)[0] || SelectorEngine.findOne(SELECTOR_DATA_TOGGLE$3, event.delegateTarget.parentNode);
      const instance = Dropdown.getOrCreateInstance(getToggleButton);
      if (isUpOrDownEvent) {
        event.stopPropagation();
        instance.show();
        instance._selectMenuItem(event);
        return;
      }
      if (instance._isShown()) {
        // else is escape and we check if it is shown
        event.stopPropagation();
        instance.hide();
        getToggleButton.focus();
      }
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$3, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
  EventHandler.on(document, EVENT_CLICK_DATA_API$3, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_KEYUP_DATA_API, Dropdown.clearMenus);
  EventHandler.on(document, EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$3, function (event) {
    event.preventDefault();
    Dropdown.getOrCreateInstance(this).toggle();
  });

  /**
   * jQuery
   */

  defineJQueryPlugin(Dropdown);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/backdrop.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$9 = 'backdrop';
  const CLASS_NAME_FADE$4 = 'fade';
  const CLASS_NAME_SHOW$5 = 'show';
  const EVENT_MOUSEDOWN = `mousedown.bs.${NAME$9}`;
  const Default$8 = {
    className: 'modal-backdrop',
    clickCallback: null,
    isAnimated: false,
    isVisible: true,
    // if false, we use the backdrop helper without adding any element to the dom
    rootElement: 'body' // give the choice to place backdrop under different elements
  };
  const DefaultType$8 = {
    className: 'string',
    clickCallback: '(function|null)',
    isAnimated: 'boolean',
    isVisible: 'boolean',
    rootElement: '(element|string)'
  };

  /**
   * Class definition
   */

  class Backdrop extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
      this._isAppended = false;
      this._element = null;
    }

    // Getters
    static get Default() {
      return Default$8;
    }
    static get DefaultType() {
      return DefaultType$8;
    }
    static get NAME() {
      return NAME$9;
    }

    // Public
    show(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }
      this._append();
      const element = this._getElement();
      if (this._config.isAnimated) {
        reflow(element);
      }
      element.classList.add(CLASS_NAME_SHOW$5);
      this._emulateAnimation(() => {
        execute(callback);
      });
    }
    hide(callback) {
      if (!this._config.isVisible) {
        execute(callback);
        return;
      }
      this._getElement().classList.remove(CLASS_NAME_SHOW$5);
      this._emulateAnimation(() => {
        this.dispose();
        execute(callback);
      });
    }
    dispose() {
      if (!this._isAppended) {
        return;
      }
      EventHandler.off(this._element, EVENT_MOUSEDOWN);
      this._element.remove();
      this._isAppended = false;
    }

    // Private
    _getElement() {
      if (!this._element) {
        const backdrop = document.createElement('div');
        backdrop.className = this._config.className;
        if (this._config.isAnimated) {
          backdrop.classList.add(CLASS_NAME_FADE$4);
        }
        this._element = backdrop;
      }
      return this._element;
    }
    _configAfterMerge(config) {
      // use getElement() with the default "body" to get a fresh Element on each instantiation
      config.rootElement = getElement(config.rootElement);
      return config;
    }
    _append() {
      if (this._isAppended) {
        return;
      }
      const element = this._getElement();
      this._config.rootElement.append(element);
      EventHandler.on(element, EVENT_MOUSEDOWN, () => {
        execute(this._config.clickCallback);
      });
      this._isAppended = true;
    }
    _emulateAnimation(callback) {
      executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/focustrap.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$8 = 'focustrap';
  const DATA_KEY$5 = 'bs.focustrap';
  const EVENT_KEY$5 = `.${DATA_KEY$5}`;
  const EVENT_FOCUSIN$2 = `focusin${EVENT_KEY$5}`;
  const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$5}`;
  const TAB_KEY = 'Tab';
  const TAB_NAV_FORWARD = 'forward';
  const TAB_NAV_BACKWARD = 'backward';
  const Default$7 = {
    autofocus: true,
    trapElement: null // The element to trap focus inside of
  };
  const DefaultType$7 = {
    autofocus: 'boolean',
    trapElement: 'element'
  };

  /**
   * Class definition
   */

  class FocusTrap extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
      this._isActive = false;
      this._lastTabNavDirection = null;
    }

    // Getters
    static get Default() {
      return Default$7;
    }
    static get DefaultType() {
      return DefaultType$7;
    }
    static get NAME() {
      return NAME$8;
    }

    // Public
    activate() {
      if (this._isActive) {
        return;
      }
      if (this._config.autofocus) {
        this._config.trapElement.focus();
      }
      EventHandler.off(document, EVENT_KEY$5); // guard against infinite focus loop
      EventHandler.on(document, EVENT_FOCUSIN$2, event => this._handleFocusin(event));
      EventHandler.on(document, EVENT_KEYDOWN_TAB, event => this._handleKeydown(event));
      this._isActive = true;
    }
    deactivate() {
      if (!this._isActive) {
        return;
      }
      this._isActive = false;
      EventHandler.off(document, EVENT_KEY$5);
    }

    // Private
    _handleFocusin(event) {
      const {
        trapElement
      } = this._config;
      if (event.target === document || event.target === trapElement || trapElement.contains(event.target)) {
        return;
      }
      const elements = SelectorEngine.focusableChildren(trapElement);
      if (elements.length === 0) {
        trapElement.focus();
      } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
        elements[elements.length - 1].focus();
      } else {
        elements[0].focus();
      }
    }
    _handleKeydown(event) {
      if (event.key !== TAB_KEY) {
        return;
      }
      this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/scrollBar.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const SELECTOR_FIXED_CONTENT = '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top';
  const SELECTOR_STICKY_CONTENT = '.sticky-top';
  const PROPERTY_PADDING = 'padding-right';
  const PROPERTY_MARGIN = 'margin-right';

  /**
   * Class definition
   */

  class ScrollBarHelper {
    constructor() {
      this._element = document.body;
    }

    // Public
    getWidth() {
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
      const documentWidth = document.documentElement.clientWidth;
      return Math.abs(window.innerWidth - documentWidth);
    }
    hide() {
      const width = this.getWidth();
      this._disableOverFlow();
      // give padding to element to balance the hidden scrollbar width
      this._setElementAttributes(this._element, PROPERTY_PADDING, calculatedValue => calculatedValue + width);
      // trick: We adjust positive paddingRight and negative marginRight to sticky-top elements to keep showing fullwidth
      this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, calculatedValue => calculatedValue + width);
      this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, calculatedValue => calculatedValue - width);
    }
    reset() {
      this._resetElementAttributes(this._element, 'overflow');
      this._resetElementAttributes(this._element, PROPERTY_PADDING);
      this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);
      this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
    }
    isOverflowing() {
      return this.getWidth() > 0;
    }

    // Private
    _disableOverFlow() {
      this._saveInitialAttribute(this._element, 'overflow');
      this._element.style.overflow = 'hidden';
    }
    _setElementAttributes(selector, styleProperty, callback) {
      const scrollbarWidth = this.getWidth();
      const manipulationCallBack = element => {
        if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
          return;
        }
        this._saveInitialAttribute(element, styleProperty);
        const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
        element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`);
      };
      this._applyManipulationCallback(selector, manipulationCallBack);
    }
    _saveInitialAttribute(element, styleProperty) {
      const actualValue = element.style.getPropertyValue(styleProperty);
      if (actualValue) {
        Manipulator.setDataAttribute(element, styleProperty, actualValue);
      }
    }
    _resetElementAttributes(selector, styleProperty) {
      const manipulationCallBack = element => {
        const value = Manipulator.getDataAttribute(element, styleProperty);
        // We only want to remove the property if the value is `null`; the value can also be zero
        if (value === null) {
          element.style.removeProperty(styleProperty);
          return;
        }
        Manipulator.removeDataAttribute(element, styleProperty);
        element.style.setProperty(styleProperty, value);
      };
      this._applyManipulationCallback(selector, manipulationCallBack);
    }
    _applyManipulationCallback(selector, callBack) {
      if (isElement$1(selector)) {
        callBack(selector);
        return;
      }
      for (const sel of SelectorEngine.find(selector, this._element)) {
        callBack(sel);
      }
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap modal.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$7 = 'modal';
  const DATA_KEY$4 = 'bs.modal';
  const EVENT_KEY$4 = `.${DATA_KEY$4}`;
  const DATA_API_KEY$2 = '.data-api';
  const ESCAPE_KEY$1 = 'Escape';
  const EVENT_HIDE$4 = `hide${EVENT_KEY$4}`;
  const EVENT_HIDE_PREVENTED$1 = `hidePrevented${EVENT_KEY$4}`;
  const EVENT_HIDDEN$4 = `hidden${EVENT_KEY$4}`;
  const EVENT_SHOW$4 = `show${EVENT_KEY$4}`;
  const EVENT_SHOWN$4 = `shown${EVENT_KEY$4}`;
  const EVENT_RESIZE$1 = `resize${EVENT_KEY$4}`;
  const EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY$4}`;
  const EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY$4}`;
  const EVENT_KEYDOWN_DISMISS$1 = `keydown.dismiss${EVENT_KEY$4}`;
  const EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$4}${DATA_API_KEY$2}`;
  const CLASS_NAME_OPEN = 'modal-open';
  const CLASS_NAME_FADE$3 = 'fade';
  const CLASS_NAME_SHOW$4 = 'show';
  const CLASS_NAME_STATIC = 'modal-static';
  const OPEN_SELECTOR$1 = '.modal.show';
  const SELECTOR_DIALOG = '.modal-dialog';
  const SELECTOR_MODAL_BODY = '.modal-body';
  const SELECTOR_DATA_TOGGLE$2 = '[data-bs-toggle="modal"]';
  const Default$6 = {
    backdrop: true,
    focus: true,
    keyboard: true
  };
  const DefaultType$6 = {
    backdrop: '(boolean|string)',
    focus: 'boolean',
    keyboard: 'boolean'
  };

  /**
   * Class definition
   */

  class Modal extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._isShown = false;
      this._isTransitioning = false;
      this._scrollBar = new ScrollBarHelper();
      this._addEventListeners();
    }

    // Getters
    static get Default() {
      return Default$6;
    }
    static get DefaultType() {
      return DefaultType$6;
    }
    static get NAME() {
      return NAME$7;
    }

    // Public
    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }
    show(relatedTarget) {
      if (this._isShown || this._isTransitioning) {
        return;
      }
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$4, {
        relatedTarget
      });
      if (showEvent.defaultPrevented) {
        return;
      }
      this._isShown = true;
      this._isTransitioning = true;
      this._scrollBar.hide();
      document.body.classList.add(CLASS_NAME_OPEN);
      this._adjustDialog();
      this._backdrop.show(() => this._showElement(relatedTarget));
    }
    hide() {
      if (!this._isShown || this._isTransitioning) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$4);
      if (hideEvent.defaultPrevented) {
        return;
      }
      this._isShown = false;
      this._isTransitioning = true;
      this._focustrap.deactivate();
      this._element.classList.remove(CLASS_NAME_SHOW$4);
      this._queueCallback(() => this._hideModal(), this._element, this._isAnimated());
    }
    dispose() {
      EventHandler.off(window, EVENT_KEY$4);
      EventHandler.off(this._dialog, EVENT_KEY$4);
      this._backdrop.dispose();
      this._focustrap.deactivate();
      super.dispose();
    }
    handleUpdate() {
      this._adjustDialog();
    }

    // Private
    _initializeBackDrop() {
      return new Backdrop({
        isVisible: Boolean(this._config.backdrop),
        // 'static' option will be translated to true, and booleans will keep their value,
        isAnimated: this._isAnimated()
      });
    }
    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }
    _showElement(relatedTarget) {
      // try to append dynamic modal
      if (!document.body.contains(this._element)) {
        document.body.append(this._element);
      }
      this._element.style.display = 'block';
      this._element.removeAttribute('aria-hidden');
      this._element.setAttribute('aria-modal', true);
      this._element.setAttribute('role', 'dialog');
      this._element.scrollTop = 0;
      const modalBody = SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._dialog);
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_SHOW$4);
      const transitionComplete = () => {
        if (this._config.focus) {
          this._focustrap.activate();
        }
        this._isTransitioning = false;
        EventHandler.trigger(this._element, EVENT_SHOWN$4, {
          relatedTarget
        });
      };
      this._queueCallback(transitionComplete, this._dialog, this._isAnimated());
    }
    _addEventListeners() {
      EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS$1, event => {
        if (event.key !== ESCAPE_KEY$1) {
          return;
        }
        if (this._config.keyboard) {
          this.hide();
          return;
        }
        this._triggerBackdropTransition();
      });
      EventHandler.on(window, EVENT_RESIZE$1, () => {
        if (this._isShown && !this._isTransitioning) {
          this._adjustDialog();
        }
      });
      EventHandler.on(this._element, EVENT_MOUSEDOWN_DISMISS, event => {
        // a bad trick to segregate clicks that may start inside dialog but end outside, and avoid listen to scrollbar clicks
        EventHandler.one(this._element, EVENT_CLICK_DISMISS, event2 => {
          if (this._element !== event.target || this._element !== event2.target) {
            return;
          }
          if (this._config.backdrop === 'static') {
            this._triggerBackdropTransition();
            return;
          }
          if (this._config.backdrop) {
            this.hide();
          }
        });
      });
    }
    _hideModal() {
      this._element.style.display = 'none';
      this._element.setAttribute('aria-hidden', true);
      this._element.removeAttribute('aria-modal');
      this._element.removeAttribute('role');
      this._isTransitioning = false;
      this._backdrop.hide(() => {
        document.body.classList.remove(CLASS_NAME_OPEN);
        this._resetAdjustments();
        this._scrollBar.reset();
        EventHandler.trigger(this._element, EVENT_HIDDEN$4);
      });
    }
    _isAnimated() {
      return this._element.classList.contains(CLASS_NAME_FADE$3);
    }
    _triggerBackdropTransition() {
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED$1);
      if (hideEvent.defaultPrevented) {
        return;
      }
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
      const initialOverflowY = this._element.style.overflowY;
      // return if the following background transition hasn't yet completed
      if (initialOverflowY === 'hidden' || this._element.classList.contains(CLASS_NAME_STATIC)) {
        return;
      }
      if (!isModalOverflowing) {
        this._element.style.overflowY = 'hidden';
      }
      this._element.classList.add(CLASS_NAME_STATIC);
      this._queueCallback(() => {
        this._element.classList.remove(CLASS_NAME_STATIC);
        this._queueCallback(() => {
          this._element.style.overflowY = initialOverflowY;
        }, this._dialog);
      }, this._dialog);
      this._element.focus();
    }

    /**
     * The following methods are used to handle overflowing modals
     */

    _adjustDialog() {
      const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
      const scrollbarWidth = this._scrollBar.getWidth();
      const isBodyOverflowing = scrollbarWidth > 0;
      if (isBodyOverflowing && !isModalOverflowing) {
        const property = isRTL() ? 'paddingLeft' : 'paddingRight';
        this._element.style[property] = `${scrollbarWidth}px`;
      }
      if (!isBodyOverflowing && isModalOverflowing) {
        const property = isRTL() ? 'paddingRight' : 'paddingLeft';
        this._element.style[property] = `${scrollbarWidth}px`;
      }
    }
    _resetAdjustments() {
      this._element.style.paddingLeft = '';
      this._element.style.paddingRight = '';
    }

    // Static
    static jQueryInterface(config, relatedTarget) {
      return this.each(function () {
        const data = Modal.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](relatedTarget);
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$2, function (event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }
    EventHandler.one(target, EVENT_SHOW$4, showEvent => {
      if (showEvent.defaultPrevented) {
        // only register focus restorer if modal will actually get shown
        return;
      }
      EventHandler.one(target, EVENT_HIDDEN$4, () => {
        if (isVisible(this)) {
          this.focus();
        }
      });
    });

    // avoid conflict when clicking modal toggler while another one is open
    const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR$1);
    if (alreadyOpen) {
      Modal.getInstance(alreadyOpen).hide();
    }
    const data = Modal.getOrCreateInstance(target);
    data.toggle(this);
  });
  enableDismissTrigger(Modal);

  /**
   * jQuery
   */

  defineJQueryPlugin(Modal);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap offcanvas.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$6 = 'offcanvas';
  const DATA_KEY$3 = 'bs.offcanvas';
  const EVENT_KEY$3 = `.${DATA_KEY$3}`;
  const DATA_API_KEY$1 = '.data-api';
  const EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$3}${DATA_API_KEY$1}`;
  const ESCAPE_KEY = 'Escape';
  const CLASS_NAME_SHOW$3 = 'show';
  const CLASS_NAME_SHOWING$1 = 'showing';
  const CLASS_NAME_HIDING = 'hiding';
  const CLASS_NAME_BACKDROP = 'offcanvas-backdrop';
  const OPEN_SELECTOR = '.offcanvas.show';
  const EVENT_SHOW$3 = `show${EVENT_KEY$3}`;
  const EVENT_SHOWN$3 = `shown${EVENT_KEY$3}`;
  const EVENT_HIDE$3 = `hide${EVENT_KEY$3}`;
  const EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY$3}`;
  const EVENT_HIDDEN$3 = `hidden${EVENT_KEY$3}`;
  const EVENT_RESIZE = `resize${EVENT_KEY$3}`;
  const EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$3}${DATA_API_KEY$1}`;
  const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY$3}`;
  const SELECTOR_DATA_TOGGLE$1 = '[data-bs-toggle="offcanvas"]';
  const Default$5 = {
    backdrop: true,
    keyboard: true,
    scroll: false
  };
  const DefaultType$5 = {
    backdrop: '(boolean|string)',
    keyboard: 'boolean',
    scroll: 'boolean'
  };

  /**
   * Class definition
   */

  class Offcanvas extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._isShown = false;
      this._backdrop = this._initializeBackDrop();
      this._focustrap = this._initializeFocusTrap();
      this._addEventListeners();
    }

    // Getters
    static get Default() {
      return Default$5;
    }
    static get DefaultType() {
      return DefaultType$5;
    }
    static get NAME() {
      return NAME$6;
    }

    // Public
    toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    }
    show(relatedTarget) {
      if (this._isShown) {
        return;
      }
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$3, {
        relatedTarget
      });
      if (showEvent.defaultPrevented) {
        return;
      }
      this._isShown = true;
      this._backdrop.show();
      if (!this._config.scroll) {
        new ScrollBarHelper().hide();
      }
      this._element.setAttribute('aria-modal', true);
      this._element.setAttribute('role', 'dialog');
      this._element.classList.add(CLASS_NAME_SHOWING$1);
      const completeCallBack = () => {
        if (!this._config.scroll || this._config.backdrop) {
          this._focustrap.activate();
        }
        this._element.classList.add(CLASS_NAME_SHOW$3);
        this._element.classList.remove(CLASS_NAME_SHOWING$1);
        EventHandler.trigger(this._element, EVENT_SHOWN$3, {
          relatedTarget
        });
      };
      this._queueCallback(completeCallBack, this._element, true);
    }
    hide() {
      if (!this._isShown) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$3);
      if (hideEvent.defaultPrevented) {
        return;
      }
      this._focustrap.deactivate();
      this._element.blur();
      this._isShown = false;
      this._element.classList.add(CLASS_NAME_HIDING);
      this._backdrop.hide();
      const completeCallback = () => {
        this._element.classList.remove(CLASS_NAME_SHOW$3, CLASS_NAME_HIDING);
        this._element.removeAttribute('aria-modal');
        this._element.removeAttribute('role');
        if (!this._config.scroll) {
          new ScrollBarHelper().reset();
        }
        EventHandler.trigger(this._element, EVENT_HIDDEN$3);
      };
      this._queueCallback(completeCallback, this._element, true);
    }
    dispose() {
      this._backdrop.dispose();
      this._focustrap.deactivate();
      super.dispose();
    }

    // Private
    _initializeBackDrop() {
      const clickCallback = () => {
        if (this._config.backdrop === 'static') {
          EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
          return;
        }
        this.hide();
      };

      // 'static' option will be translated to true, and booleans will keep their value
      const isVisible = Boolean(this._config.backdrop);
      return new Backdrop({
        className: CLASS_NAME_BACKDROP,
        isVisible,
        isAnimated: true,
        rootElement: this._element.parentNode,
        clickCallback: isVisible ? clickCallback : null
      });
    }
    _initializeFocusTrap() {
      return new FocusTrap({
        trapElement: this._element
      });
    }
    _addEventListeners() {
      EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS, event => {
        if (event.key !== ESCAPE_KEY) {
          return;
        }
        if (this._config.keyboard) {
          this.hide();
          return;
        }
        EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
      });
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Offcanvas.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](this);
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE$1, function (event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }
    if (isDisabled(this)) {
      return;
    }
    EventHandler.one(target, EVENT_HIDDEN$3, () => {
      // focus on trigger when it is closed
      if (isVisible(this)) {
        this.focus();
      }
    });

    // avoid conflict when clicking a toggler of an offcanvas, while another is open
    const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);
    if (alreadyOpen && alreadyOpen !== target) {
      Offcanvas.getInstance(alreadyOpen).hide();
    }
    const data = Offcanvas.getOrCreateInstance(target);
    data.toggle(this);
  });
  EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => {
    for (const selector of SelectorEngine.find(OPEN_SELECTOR)) {
      Offcanvas.getOrCreateInstance(selector).show();
    }
  });
  EventHandler.on(window, EVENT_RESIZE, () => {
    for (const element of SelectorEngine.find('[aria-modal][class*=show][class*=offcanvas-]')) {
      if (getComputedStyle(element).position !== 'fixed') {
        Offcanvas.getOrCreateInstance(element).hide();
      }
    }
  });
  enableDismissTrigger(Offcanvas);

  /**
   * jQuery
   */

  defineJQueryPlugin(Offcanvas);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/sanitizer.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  // js-docs-start allow-list
  const ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
  const DefaultAllowlist = {
    // Global attributes allowed on any supplied element below.
    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    dd: [],
    div: [],
    dl: [],
    dt: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: []
  };
  // js-docs-end allow-list

  const uriAttributes = new Set(['background', 'cite', 'href', 'itemtype', 'longdesc', 'poster', 'src', 'xlink:href']);

  /**
   * A pattern that recognizes URLs that are safe wrt. XSS in URL navigation
   * contexts.
   *
   * Shout-out to Angular https://github.com/angular/angular/blob/15.2.8/packages/core/src/sanitization/url_sanitizer.ts#L38
   */
  const SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
  const allowedAttribute = (attribute, allowedAttributeList) => {
    const attributeName = attribute.nodeName.toLowerCase();
    if (allowedAttributeList.includes(attributeName)) {
      if (uriAttributes.has(attributeName)) {
        return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue));
      }
      return true;
    }

    // Check if a regular expression validates the attribute.
    return allowedAttributeList.filter(attributeRegex => attributeRegex instanceof RegExp).some(regex => regex.test(attributeName));
  };
  function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
    if (!unsafeHtml.length) {
      return unsafeHtml;
    }
    if (sanitizeFunction && typeof sanitizeFunction === 'function') {
      return sanitizeFunction(unsafeHtml);
    }
    const domParser = new window.DOMParser();
    const createdDocument = domParser.parseFromString(unsafeHtml, 'text/html');
    const elements = [].concat(...createdDocument.body.querySelectorAll('*'));
    for (const element of elements) {
      const elementName = element.nodeName.toLowerCase();
      if (!Object.keys(allowList).includes(elementName)) {
        element.remove();
        continue;
      }
      const attributeList = [].concat(...element.attributes);
      const allowedAttributes = [].concat(allowList['*'] || [], allowList[elementName] || []);
      for (const attribute of attributeList) {
        if (!allowedAttribute(attribute, allowedAttributes)) {
          element.removeAttribute(attribute.nodeName);
        }
      }
    }
    return createdDocument.body.innerHTML;
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap util/template-factory.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$5 = 'TemplateFactory';
  const Default$4 = {
    allowList: DefaultAllowlist,
    content: {},
    // { selector : text ,  selector2 : text2 , }
    extraClass: '',
    html: false,
    sanitize: true,
    sanitizeFn: null,
    template: '<div></div>'
  };
  const DefaultType$4 = {
    allowList: 'object',
    content: 'object',
    extraClass: '(string|function)',
    html: 'boolean',
    sanitize: 'boolean',
    sanitizeFn: '(null|function)',
    template: 'string'
  };
  const DefaultContentType = {
    entry: '(string|element|function|null)',
    selector: '(string|element)'
  };

  /**
   * Class definition
   */

  class TemplateFactory extends Config {
    constructor(config) {
      super();
      this._config = this._getConfig(config);
    }

    // Getters
    static get Default() {
      return Default$4;
    }
    static get DefaultType() {
      return DefaultType$4;
    }
    static get NAME() {
      return NAME$5;
    }

    // Public
    getContent() {
      return Object.values(this._config.content).map(config => this._resolvePossibleFunction(config)).filter(Boolean);
    }
    hasContent() {
      return this.getContent().length > 0;
    }
    changeContent(content) {
      this._checkContent(content);
      this._config.content = {
        ...this._config.content,
        ...content
      };
      return this;
    }
    toHtml() {
      const templateWrapper = document.createElement('div');
      templateWrapper.innerHTML = this._maybeSanitize(this._config.template);
      for (const [selector, text] of Object.entries(this._config.content)) {
        this._setContent(templateWrapper, text, selector);
      }
      const template = templateWrapper.children[0];
      const extraClass = this._resolvePossibleFunction(this._config.extraClass);
      if (extraClass) {
        template.classList.add(...extraClass.split(' '));
      }
      return template;
    }

    // Private
    _typeCheckConfig(config) {
      super._typeCheckConfig(config);
      this._checkContent(config.content);
    }
    _checkContent(arg) {
      for (const [selector, content] of Object.entries(arg)) {
        super._typeCheckConfig({
          selector,
          entry: content
        }, DefaultContentType);
      }
    }
    _setContent(template, content, selector) {
      const templateElement = SelectorEngine.findOne(selector, template);
      if (!templateElement) {
        return;
      }
      content = this._resolvePossibleFunction(content);
      if (!content) {
        templateElement.remove();
        return;
      }
      if (isElement$1(content)) {
        this._putElementInTemplate(getElement(content), templateElement);
        return;
      }
      if (this._config.html) {
        templateElement.innerHTML = this._maybeSanitize(content);
        return;
      }
      templateElement.textContent = content;
    }
    _maybeSanitize(arg) {
      return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
    }
    _resolvePossibleFunction(arg) {
      return execute(arg, [undefined, this]);
    }
    _putElementInTemplate(element, templateElement) {
      if (this._config.html) {
        templateElement.innerHTML = '';
        templateElement.append(element);
        return;
      }
      templateElement.textContent = element.textContent;
    }
  }

  /**
   * --------------------------------------------------------------------------
   * Bootstrap tooltip.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$4 = 'tooltip';
  const DISALLOWED_ATTRIBUTES = new Set(['sanitize', 'allowList', 'sanitizeFn']);
  const CLASS_NAME_FADE$2 = 'fade';
  const CLASS_NAME_MODAL = 'modal';
  const CLASS_NAME_SHOW$2 = 'show';
  const SELECTOR_TOOLTIP_INNER = '.tooltip-inner';
  const SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
  const EVENT_MODAL_HIDE = 'hide.bs.modal';
  const TRIGGER_HOVER = 'hover';
  const TRIGGER_FOCUS = 'focus';
  const TRIGGER_CLICK = 'click';
  const TRIGGER_MANUAL = 'manual';
  const EVENT_HIDE$2 = 'hide';
  const EVENT_HIDDEN$2 = 'hidden';
  const EVENT_SHOW$2 = 'show';
  const EVENT_SHOWN$2 = 'shown';
  const EVENT_INSERTED = 'inserted';
  const EVENT_CLICK$1 = 'click';
  const EVENT_FOCUSIN$1 = 'focusin';
  const EVENT_FOCUSOUT$1 = 'focusout';
  const EVENT_MOUSEENTER = 'mouseenter';
  const EVENT_MOUSELEAVE = 'mouseleave';
  const AttachmentMap = {
    AUTO: 'auto',
    TOP: 'top',
    RIGHT: isRTL() ? 'left' : 'right',
    BOTTOM: 'bottom',
    LEFT: isRTL() ? 'right' : 'left'
  };
  const Default$3 = {
    allowList: DefaultAllowlist,
    animation: true,
    boundary: 'clippingParents',
    container: false,
    customClass: '',
    delay: 0,
    fallbackPlacements: ['top', 'right', 'bottom', 'left'],
    html: false,
    offset: [0, 6],
    placement: 'top',
    popperConfig: null,
    sanitize: true,
    sanitizeFn: null,
    selector: false,
    template: '<div class="tooltip" role="tooltip">' + '<div class="tooltip-arrow"></div>' + '<div class="tooltip-inner"></div>' + '</div>',
    title: '',
    trigger: 'hover focus'
  };
  const DefaultType$3 = {
    allowList: 'object',
    animation: 'boolean',
    boundary: '(string|element)',
    container: '(string|element|boolean)',
    customClass: '(string|function)',
    delay: '(number|object)',
    fallbackPlacements: 'array',
    html: 'boolean',
    offset: '(array|string|function)',
    placement: '(string|function)',
    popperConfig: '(null|object|function)',
    sanitize: 'boolean',
    sanitizeFn: '(null|function)',
    selector: '(string|boolean)',
    template: 'string',
    title: '(string|element|function)',
    trigger: 'string'
  };

  /**
   * Class definition
   */

  class Tooltip extends BaseComponent {
    constructor(element, config) {
      if (typeof Popper === 'undefined') {
        throw new TypeError('Bootstrap\'s tooltips require Popper (https://popper.js.org/docs/v2/)');
      }
      super(element, config);

      // Private
      this._isEnabled = true;
      this._timeout = 0;
      this._isHovered = null;
      this._activeTrigger = {};
      this._popper = null;
      this._templateFactory = null;
      this._newContent = null;

      // Protected
      this.tip = null;
      this._setListeners();
      if (!this._config.selector) {
        this._fixTitle();
      }
    }

    // Getters
    static get Default() {
      return Default$3;
    }
    static get DefaultType() {
      return DefaultType$3;
    }
    static get NAME() {
      return NAME$4;
    }

    // Public
    enable() {
      this._isEnabled = true;
    }
    disable() {
      this._isEnabled = false;
    }
    toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    }
    toggle() {
      if (!this._isEnabled) {
        return;
      }
      if (this._isShown()) {
        this._leave();
        return;
      }
      this._enter();
    }
    dispose() {
      clearTimeout(this._timeout);
      EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
      if (this._element.getAttribute('data-bs-original-title')) {
        this._element.setAttribute('title', this._element.getAttribute('data-bs-original-title'));
      }
      this._disposePopper();
      super.dispose();
    }
    show() {
      if (this._element.style.display === 'none') {
        throw new Error('Please use show on visible elements');
      }
      if (!(this._isWithContent() && this._isEnabled)) {
        return;
      }
      const showEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOW$2));
      const shadowRoot = findShadowRoot(this._element);
      const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element);
      if (showEvent.defaultPrevented || !isInTheDom) {
        return;
      }

      // TODO: v6 remove this or make it optional
      this._disposePopper();
      const tip = this._getTipElement();
      this._element.setAttribute('aria-describedby', tip.getAttribute('id'));
      const {
        container
      } = this._config;
      if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
        container.append(tip);
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
      }
      this._popper = this._createPopper(tip);
      tip.classList.add(CLASS_NAME_SHOW$2);

      // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
      if ('ontouchstart' in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.on(element, 'mouseover', noop);
        }
      }
      const complete = () => {
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOWN$2));
        if (this._isHovered === false) {
          this._leave();
        }
        this._isHovered = false;
      };
      this._queueCallback(complete, this.tip, this._isAnimated());
    }
    hide() {
      if (!this._isShown()) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDE$2));
      if (hideEvent.defaultPrevented) {
        return;
      }
      const tip = this._getTipElement();
      tip.classList.remove(CLASS_NAME_SHOW$2);

      // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support
      if ('ontouchstart' in document.documentElement) {
        for (const element of [].concat(...document.body.children)) {
          EventHandler.off(element, 'mouseover', noop);
        }
      }
      this._activeTrigger[TRIGGER_CLICK] = false;
      this._activeTrigger[TRIGGER_FOCUS] = false;
      this._activeTrigger[TRIGGER_HOVER] = false;
      this._isHovered = null; // it is a trick to support manual triggering

      const complete = () => {
        if (this._isWithActiveTrigger()) {
          return;
        }
        if (!this._isHovered) {
          this._disposePopper();
        }
        this._element.removeAttribute('aria-describedby');
        EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN$2));
      };
      this._queueCallback(complete, this.tip, this._isAnimated());
    }
    update() {
      if (this._popper) {
        this._popper.update();
      }
    }

    // Protected
    _isWithContent() {
      return Boolean(this._getTitle());
    }
    _getTipElement() {
      if (!this.tip) {
        this.tip = this._createTipElement(this._newContent || this._getContentForTemplate());
      }
      return this.tip;
    }
    _createTipElement(content) {
      const tip = this._getTemplateFactory(content).toHtml();

      // TODO: remove this check in v6
      if (!tip) {
        return null;
      }
      tip.classList.remove(CLASS_NAME_FADE$2, CLASS_NAME_SHOW$2);
      // TODO: v6 the following can be achieved with CSS only
      tip.classList.add(`bs-${this.constructor.NAME}-auto`);
      const tipId = getUID(this.constructor.NAME).toString();
      tip.setAttribute('id', tipId);
      if (this._isAnimated()) {
        tip.classList.add(CLASS_NAME_FADE$2);
      }
      return tip;
    }
    setContent(content) {
      this._newContent = content;
      if (this._isShown()) {
        this._disposePopper();
        this.show();
      }
    }
    _getTemplateFactory(content) {
      if (this._templateFactory) {
        this._templateFactory.changeContent(content);
      } else {
        this._templateFactory = new TemplateFactory({
          ...this._config,
          // the `content` var has to be after `this._config`
          // to override config.content in case of popover
          content,
          extraClass: this._resolvePossibleFunction(this._config.customClass)
        });
      }
      return this._templateFactory;
    }
    _getContentForTemplate() {
      return {
        [SELECTOR_TOOLTIP_INNER]: this._getTitle()
      };
    }
    _getTitle() {
      return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute('data-bs-original-title');
    }

    // Private
    _initializeOnDelegatedTarget(event) {
      return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
    }
    _isAnimated() {
      return this._config.animation || this.tip && this.tip.classList.contains(CLASS_NAME_FADE$2);
    }
    _isShown() {
      return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW$2);
    }
    _createPopper(tip) {
      const placement = execute(this._config.placement, [this, tip, this._element]);
      const attachment = AttachmentMap[placement.toUpperCase()];
      return createPopper(this._element, tip, this._getPopperConfig(attachment));
    }
    _getOffset() {
      const {
        offset
      } = this._config;
      if (typeof offset === 'string') {
        return offset.split(',').map(value => Number.parseInt(value, 10));
      }
      if (typeof offset === 'function') {
        return popperData => offset(popperData, this._element);
      }
      return offset;
    }
    _resolvePossibleFunction(arg) {
      return execute(arg, [this._element, this._element]);
    }
    _getPopperConfig(attachment) {
      const defaultBsPopperConfig = {
        placement: attachment,
        modifiers: [{
          name: 'flip',
          options: {
            fallbackPlacements: this._config.fallbackPlacements
          }
        }, {
          name: 'offset',
          options: {
            offset: this._getOffset()
          }
        }, {
          name: 'preventOverflow',
          options: {
            boundary: this._config.boundary
          }
        }, {
          name: 'arrow',
          options: {
            element: `.${this.constructor.NAME}-arrow`
          }
        }, {
          name: 'preSetPlacement',
          enabled: true,
          phase: 'beforeMain',
          fn: data => {
            // Pre-set Popper's placement attribute in order to read the arrow sizes properly.
            // Otherwise, Popper mixes up the width and height dimensions since the initial arrow style is for top placement
            this._getTipElement().setAttribute('data-popper-placement', data.state.placement);
          }
        }]
      };
      return {
        ...defaultBsPopperConfig,
        ...execute(this._config.popperConfig, [undefined, defaultBsPopperConfig])
      };
    }
    _setListeners() {
      const triggers = this._config.trigger.split(' ');
      for (const trigger of triggers) {
        if (trigger === 'click') {
          EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$1), this._config.selector, event => {
            const context = this._initializeOnDelegatedTarget(event);
            context._activeTrigger[TRIGGER_CLICK] = !(context._isShown() && context._activeTrigger[TRIGGER_CLICK]);
            context.toggle();
          });
        } else if (trigger !== TRIGGER_MANUAL) {
          const eventIn = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSEENTER) : this.constructor.eventName(EVENT_FOCUSIN$1);
          const eventOut = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSELEAVE) : this.constructor.eventName(EVENT_FOCUSOUT$1);
          EventHandler.on(this._element, eventIn, this._config.selector, event => {
            const context = this._initializeOnDelegatedTarget(event);
            context._activeTrigger[event.type === 'focusin' ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
            context._enter();
          });
          EventHandler.on(this._element, eventOut, this._config.selector, event => {
            const context = this._initializeOnDelegatedTarget(event);
            context._activeTrigger[event.type === 'focusout' ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._element.contains(event.relatedTarget);
            context._leave();
          });
        }
      }
      this._hideModalHandler = () => {
        if (this._element) {
          this.hide();
        }
      };
      EventHandler.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
    }
    _fixTitle() {
      const title = this._element.getAttribute('title');
      if (!title) {
        return;
      }
      if (!this._element.getAttribute('aria-label') && !this._element.textContent.trim()) {
        this._element.setAttribute('aria-label', title);
      }
      this._element.setAttribute('data-bs-original-title', title); // DO NOT USE IT. Is only for backwards compatibility
      this._element.removeAttribute('title');
    }
    _enter() {
      if (this._isShown() || this._isHovered) {
        this._isHovered = true;
        return;
      }
      this._isHovered = true;
      this._setTimeout(() => {
        if (this._isHovered) {
          this.show();
        }
      }, this._config.delay.show);
    }
    _leave() {
      if (this._isWithActiveTrigger()) {
        return;
      }
      this._isHovered = false;
      this._setTimeout(() => {
        if (!this._isHovered) {
          this.hide();
        }
      }, this._config.delay.hide);
    }
    _setTimeout(handler, timeout) {
      clearTimeout(this._timeout);
      this._timeout = setTimeout(handler, timeout);
    }
    _isWithActiveTrigger() {
      return Object.values(this._activeTrigger).includes(true);
    }
    _getConfig(config) {
      const dataAttributes = Manipulator.getDataAttributes(this._element);
      for (const dataAttribute of Object.keys(dataAttributes)) {
        if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
          delete dataAttributes[dataAttribute];
        }
      }
      config = {
        ...dataAttributes,
        ...(typeof config === 'object' && config ? config : {})
      };
      config = this._mergeConfigObj(config);
      config = this._configAfterMerge(config);
      this._typeCheckConfig(config);
      return config;
    }
    _configAfterMerge(config) {
      config.container = config.container === false ? document.body : getElement(config.container);
      if (typeof config.delay === 'number') {
        config.delay = {
          show: config.delay,
          hide: config.delay
        };
      }
      if (typeof config.title === 'number') {
        config.title = config.title.toString();
      }
      if (typeof config.content === 'number') {
        config.content = config.content.toString();
      }
      return config;
    }
    _getDelegateConfig() {
      const config = {};
      for (const [key, value] of Object.entries(this._config)) {
        if (this.constructor.Default[key] !== value) {
          config[key] = value;
        }
      }
      config.selector = false;
      config.trigger = 'manual';

      // In the future can be replaced with:
      // const keysWithDifferentValues = Object.entries(this._config).filter(entry => this.constructor.Default[entry[0]] !== this._config[entry[0]])
      // `Object.fromEntries(keysWithDifferentValues)`
      return config;
    }
    _disposePopper() {
      if (this._popper) {
        this._popper.destroy();
        this._popper = null;
      }
      if (this.tip) {
        this.tip.remove();
        this.tip = null;
      }
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Tooltip.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  }

  /**
   * jQuery
   */

  defineJQueryPlugin(Tooltip);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap popover.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$3 = 'popover';
  const SELECTOR_TITLE = '.popover-header';
  const SELECTOR_CONTENT = '.popover-body';
  const Default$2 = {
    ...Tooltip.Default,
    content: '',
    offset: [0, 8],
    placement: 'right',
    template: '<div class="popover" role="tooltip">' + '<div class="popover-arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div>' + '</div>',
    trigger: 'click'
  };
  const DefaultType$2 = {
    ...Tooltip.DefaultType,
    content: '(null|string|element|function)'
  };

  /**
   * Class definition
   */

  class Popover extends Tooltip {
    // Getters
    static get Default() {
      return Default$2;
    }
    static get DefaultType() {
      return DefaultType$2;
    }
    static get NAME() {
      return NAME$3;
    }

    // Overrides
    _isWithContent() {
      return this._getTitle() || this._getContent();
    }

    // Private
    _getContentForTemplate() {
      return {
        [SELECTOR_TITLE]: this._getTitle(),
        [SELECTOR_CONTENT]: this._getContent()
      };
    }
    _getContent() {
      return this._resolvePossibleFunction(this._config.content);
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Popover.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (typeof data[config] === 'undefined') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  }

  /**
   * jQuery
   */

  defineJQueryPlugin(Popover);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap scrollspy.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$2 = 'scrollspy';
  const DATA_KEY$2 = 'bs.scrollspy';
  const EVENT_KEY$2 = `.${DATA_KEY$2}`;
  const DATA_API_KEY = '.data-api';
  const EVENT_ACTIVATE = `activate${EVENT_KEY$2}`;
  const EVENT_CLICK = `click${EVENT_KEY$2}`;
  const EVENT_LOAD_DATA_API$1 = `load${EVENT_KEY$2}${DATA_API_KEY}`;
  const CLASS_NAME_DROPDOWN_ITEM = 'dropdown-item';
  const CLASS_NAME_ACTIVE$1 = 'active';
  const SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
  const SELECTOR_TARGET_LINKS = '[href]';
  const SELECTOR_NAV_LIST_GROUP = '.nav, .list-group';
  const SELECTOR_NAV_LINKS = '.nav-link';
  const SELECTOR_NAV_ITEMS = '.nav-item';
  const SELECTOR_LIST_ITEMS = '.list-group-item';
  const SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_NAV_ITEMS} > ${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`;
  const SELECTOR_DROPDOWN = '.dropdown';
  const SELECTOR_DROPDOWN_TOGGLE$1 = '.dropdown-toggle';
  const Default$1 = {
    offset: null,
    // TODO: v6 @deprecated, keep it for backwards compatibility reasons
    rootMargin: '0px 0px -25%',
    smoothScroll: false,
    target: null,
    threshold: [0.1, 0.5, 1]
  };
  const DefaultType$1 = {
    offset: '(number|null)',
    // TODO v6 @deprecated, keep it for backwards compatibility reasons
    rootMargin: 'string',
    smoothScroll: 'boolean',
    target: 'element',
    threshold: 'array'
  };

  /**
   * Class definition
   */

  class ScrollSpy extends BaseComponent {
    constructor(element, config) {
      super(element, config);

      // this._element is the observablesContainer and config.target the menu links wrapper
      this._targetLinks = new Map();
      this._observableSections = new Map();
      this._rootElement = getComputedStyle(this._element).overflowY === 'visible' ? null : this._element;
      this._activeTarget = null;
      this._observer = null;
      this._previousScrollData = {
        visibleEntryTop: 0,
        parentScrollTop: 0
      };
      this.refresh(); // initialize
    }

    // Getters
    static get Default() {
      return Default$1;
    }
    static get DefaultType() {
      return DefaultType$1;
    }
    static get NAME() {
      return NAME$2;
    }

    // Public
    refresh() {
      this._initializeTargetsAndObservables();
      this._maybeEnableSmoothScroll();
      if (this._observer) {
        this._observer.disconnect();
      } else {
        this._observer = this._getNewObserver();
      }
      for (const section of this._observableSections.values()) {
        this._observer.observe(section);
      }
    }
    dispose() {
      this._observer.disconnect();
      super.dispose();
    }

    // Private
    _configAfterMerge(config) {
      // TODO: on v6 target should be given explicitly & remove the {target: 'ss-target'} case
      config.target = getElement(config.target) || document.body;

      // TODO: v6 Only for backwards compatibility reasons. Use rootMargin only
      config.rootMargin = config.offset ? `${config.offset}px 0px -30%` : config.rootMargin;
      if (typeof config.threshold === 'string') {
        config.threshold = config.threshold.split(',').map(value => Number.parseFloat(value));
      }
      return config;
    }
    _maybeEnableSmoothScroll() {
      if (!this._config.smoothScroll) {
        return;
      }

      // unregister any previous listeners
      EventHandler.off(this._config.target, EVENT_CLICK);
      EventHandler.on(this._config.target, EVENT_CLICK, SELECTOR_TARGET_LINKS, event => {
        const observableSection = this._observableSections.get(event.target.hash);
        if (observableSection) {
          event.preventDefault();
          const root = this._rootElement || window;
          const height = observableSection.offsetTop - this._element.offsetTop;
          if (root.scrollTo) {
            root.scrollTo({
              top: height,
              behavior: 'smooth'
            });
            return;
          }

          // Chrome 60 doesn't support `scrollTo`
          root.scrollTop = height;
        }
      });
    }
    _getNewObserver() {
      const options = {
        root: this._rootElement,
        threshold: this._config.threshold,
        rootMargin: this._config.rootMargin
      };
      return new IntersectionObserver(entries => this._observerCallback(entries), options);
    }

    // The logic of selection
    _observerCallback(entries) {
      const targetElement = entry => this._targetLinks.get(`#${entry.target.id}`);
      const activate = entry => {
        this._previousScrollData.visibleEntryTop = entry.target.offsetTop;
        this._process(targetElement(entry));
      };
      const parentScrollTop = (this._rootElement || document.documentElement).scrollTop;
      const userScrollsDown = parentScrollTop >= this._previousScrollData.parentScrollTop;
      this._previousScrollData.parentScrollTop = parentScrollTop;
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          this._activeTarget = null;
          this._clearActiveClass(targetElement(entry));
          continue;
        }
        const entryIsLowerThanPrevious = entry.target.offsetTop >= this._previousScrollData.visibleEntryTop;
        // if we are scrolling down, pick the bigger offsetTop
        if (userScrollsDown && entryIsLowerThanPrevious) {
          activate(entry);
          // if parent isn't scrolled, let's keep the first visible item, breaking the iteration
          if (!parentScrollTop) {
            return;
          }
          continue;
        }

        // if we are scrolling up, pick the smallest offsetTop
        if (!userScrollsDown && !entryIsLowerThanPrevious) {
          activate(entry);
        }
      }
    }
    _initializeTargetsAndObservables() {
      this._targetLinks = new Map();
      this._observableSections = new Map();
      const targetLinks = SelectorEngine.find(SELECTOR_TARGET_LINKS, this._config.target);
      for (const anchor of targetLinks) {
        // ensure that the anchor has an id and is not disabled
        if (!anchor.hash || isDisabled(anchor)) {
          continue;
        }
        const observableSection = SelectorEngine.findOne(decodeURI(anchor.hash), this._element);

        // ensure that the observableSection exists & is visible
        if (isVisible(observableSection)) {
          this._targetLinks.set(decodeURI(anchor.hash), anchor);
          this._observableSections.set(anchor.hash, observableSection);
        }
      }
    }
    _process(target) {
      if (this._activeTarget === target) {
        return;
      }
      this._clearActiveClass(this._config.target);
      this._activeTarget = target;
      target.classList.add(CLASS_NAME_ACTIVE$1);
      this._activateParents(target);
      EventHandler.trigger(this._element, EVENT_ACTIVATE, {
        relatedTarget: target
      });
    }
    _activateParents(target) {
      // Activate dropdown parents
      if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
        SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, target.closest(SELECTOR_DROPDOWN)).classList.add(CLASS_NAME_ACTIVE$1);
        return;
      }
      for (const listGroup of SelectorEngine.parents(target, SELECTOR_NAV_LIST_GROUP)) {
        // Set triggered links parents as active
        // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor
        for (const item of SelectorEngine.prev(listGroup, SELECTOR_LINK_ITEMS)) {
          item.classList.add(CLASS_NAME_ACTIVE$1);
        }
      }
    }
    _clearActiveClass(parent) {
      parent.classList.remove(CLASS_NAME_ACTIVE$1);
      const activeNodes = SelectorEngine.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE$1}`, parent);
      for (const node of activeNodes) {
        node.classList.remove(CLASS_NAME_ACTIVE$1);
      }
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = ScrollSpy.getOrCreateInstance(this, config);
        if (typeof config !== 'string') {
          return;
        }
        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(window, EVENT_LOAD_DATA_API$1, () => {
    for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) {
      ScrollSpy.getOrCreateInstance(spy);
    }
  });

  /**
   * jQuery
   */

  defineJQueryPlugin(ScrollSpy);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap tab.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME$1 = 'tab';
  const DATA_KEY$1 = 'bs.tab';
  const EVENT_KEY$1 = `.${DATA_KEY$1}`;
  const EVENT_HIDE$1 = `hide${EVENT_KEY$1}`;
  const EVENT_HIDDEN$1 = `hidden${EVENT_KEY$1}`;
  const EVENT_SHOW$1 = `show${EVENT_KEY$1}`;
  const EVENT_SHOWN$1 = `shown${EVENT_KEY$1}`;
  const EVENT_CLICK_DATA_API = `click${EVENT_KEY$1}`;
  const EVENT_KEYDOWN = `keydown${EVENT_KEY$1}`;
  const EVENT_LOAD_DATA_API = `load${EVENT_KEY$1}`;
  const ARROW_LEFT_KEY = 'ArrowLeft';
  const ARROW_RIGHT_KEY = 'ArrowRight';
  const ARROW_UP_KEY = 'ArrowUp';
  const ARROW_DOWN_KEY = 'ArrowDown';
  const HOME_KEY = 'Home';
  const END_KEY = 'End';
  const CLASS_NAME_ACTIVE = 'active';
  const CLASS_NAME_FADE$1 = 'fade';
  const CLASS_NAME_SHOW$1 = 'show';
  const CLASS_DROPDOWN = 'dropdown';
  const SELECTOR_DROPDOWN_TOGGLE = '.dropdown-toggle';
  const SELECTOR_DROPDOWN_MENU = '.dropdown-menu';
  const NOT_SELECTOR_DROPDOWN_TOGGLE = `:not(${SELECTOR_DROPDOWN_TOGGLE})`;
  const SELECTOR_TAB_PANEL = '.list-group, .nav, [role="tablist"]';
  const SELECTOR_OUTER = '.nav-item, .list-group-item';
  const SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
  const SELECTOR_DATA_TOGGLE = '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]'; // TODO: could only be `tab` in v6
  const SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE}`;
  const SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE}[data-bs-toggle="tab"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="pill"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="list"]`;

  /**
   * Class definition
   */

  class Tab extends BaseComponent {
    constructor(element) {
      super(element);
      this._parent = this._element.closest(SELECTOR_TAB_PANEL);
      if (!this._parent) {
        return;
        // TODO: should throw exception in v6
        // throw new TypeError(`${element.outerHTML} has not a valid parent ${SELECTOR_INNER_ELEM}`)
      }

      // Set up initial aria attributes
      this._setInitialAttributes(this._parent, this._getChildren());
      EventHandler.on(this._element, EVENT_KEYDOWN, event => this._keydown(event));
    }

    // Getters
    static get NAME() {
      return NAME$1;
    }

    // Public
    show() {
      // Shows this elem and deactivate the active sibling if exists
      const innerElem = this._element;
      if (this._elemIsActive(innerElem)) {
        return;
      }

      // Search for active tab on same parent to deactivate it
      const active = this._getActiveElem();
      const hideEvent = active ? EventHandler.trigger(active, EVENT_HIDE$1, {
        relatedTarget: innerElem
      }) : null;
      const showEvent = EventHandler.trigger(innerElem, EVENT_SHOW$1, {
        relatedTarget: active
      });
      if (showEvent.defaultPrevented || hideEvent && hideEvent.defaultPrevented) {
        return;
      }
      this._deactivate(active, innerElem);
      this._activate(innerElem, active);
    }

    // Private
    _activate(element, relatedElem) {
      if (!element) {
        return;
      }
      element.classList.add(CLASS_NAME_ACTIVE);
      this._activate(SelectorEngine.getElementFromSelector(element)); // Search and activate/show the proper section

      const complete = () => {
        if (element.getAttribute('role') !== 'tab') {
          element.classList.add(CLASS_NAME_SHOW$1);
          return;
        }
        element.removeAttribute('tabindex');
        element.setAttribute('aria-selected', true);
        this._toggleDropDown(element, true);
        EventHandler.trigger(element, EVENT_SHOWN$1, {
          relatedTarget: relatedElem
        });
      };
      this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
    }
    _deactivate(element, relatedElem) {
      if (!element) {
        return;
      }
      element.classList.remove(CLASS_NAME_ACTIVE);
      element.blur();
      this._deactivate(SelectorEngine.getElementFromSelector(element)); // Search and deactivate the shown section too

      const complete = () => {
        if (element.getAttribute('role') !== 'tab') {
          element.classList.remove(CLASS_NAME_SHOW$1);
          return;
        }
        element.setAttribute('aria-selected', false);
        element.setAttribute('tabindex', '-1');
        this._toggleDropDown(element, false);
        EventHandler.trigger(element, EVENT_HIDDEN$1, {
          relatedTarget: relatedElem
        });
      };
      this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
    }
    _keydown(event) {
      if (![ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, ARROW_DOWN_KEY, HOME_KEY, END_KEY].includes(event.key)) {
        return;
      }
      event.stopPropagation(); // stopPropagation/preventDefault both added to support up/down keys without scrolling the page
      event.preventDefault();
      const children = this._getChildren().filter(element => !isDisabled(element));
      let nextActiveElement;
      if ([HOME_KEY, END_KEY].includes(event.key)) {
        nextActiveElement = children[event.key === HOME_KEY ? 0 : children.length - 1];
      } else {
        const isNext = [ARROW_RIGHT_KEY, ARROW_DOWN_KEY].includes(event.key);
        nextActiveElement = getNextActiveElement(children, event.target, isNext, true);
      }
      if (nextActiveElement) {
        nextActiveElement.focus({
          preventScroll: true
        });
        Tab.getOrCreateInstance(nextActiveElement).show();
      }
    }
    _getChildren() {
      // collection of inner elements
      return SelectorEngine.find(SELECTOR_INNER_ELEM, this._parent);
    }
    _getActiveElem() {
      return this._getChildren().find(child => this._elemIsActive(child)) || null;
    }
    _setInitialAttributes(parent, children) {
      this._setAttributeIfNotExists(parent, 'role', 'tablist');
      for (const child of children) {
        this._setInitialAttributesOnChild(child);
      }
    }
    _setInitialAttributesOnChild(child) {
      child = this._getInnerElement(child);
      const isActive = this._elemIsActive(child);
      const outerElem = this._getOuterElement(child);
      child.setAttribute('aria-selected', isActive);
      if (outerElem !== child) {
        this._setAttributeIfNotExists(outerElem, 'role', 'presentation');
      }
      if (!isActive) {
        child.setAttribute('tabindex', '-1');
      }
      this._setAttributeIfNotExists(child, 'role', 'tab');

      // set attributes to the related panel too
      this._setInitialAttributesOnTargetPanel(child);
    }
    _setInitialAttributesOnTargetPanel(child) {
      const target = SelectorEngine.getElementFromSelector(child);
      if (!target) {
        return;
      }
      this._setAttributeIfNotExists(target, 'role', 'tabpanel');
      if (child.id) {
        this._setAttributeIfNotExists(target, 'aria-labelledby', `${child.id}`);
      }
    }
    _toggleDropDown(element, open) {
      const outerElem = this._getOuterElement(element);
      if (!outerElem.classList.contains(CLASS_DROPDOWN)) {
        return;
      }
      const toggle = (selector, className) => {
        const element = SelectorEngine.findOne(selector, outerElem);
        if (element) {
          element.classList.toggle(className, open);
        }
      };
      toggle(SELECTOR_DROPDOWN_TOGGLE, CLASS_NAME_ACTIVE);
      toggle(SELECTOR_DROPDOWN_MENU, CLASS_NAME_SHOW$1);
      outerElem.setAttribute('aria-expanded', open);
    }
    _setAttributeIfNotExists(element, attribute, value) {
      if (!element.hasAttribute(attribute)) {
        element.setAttribute(attribute, value);
      }
    }
    _elemIsActive(elem) {
      return elem.classList.contains(CLASS_NAME_ACTIVE);
    }

    // Try to get the inner element (usually the .nav-link)
    _getInnerElement(elem) {
      return elem.matches(SELECTOR_INNER_ELEM) ? elem : SelectorEngine.findOne(SELECTOR_INNER_ELEM, elem);
    }

    // Try to get the outer element (usually the .nav-item)
    _getOuterElement(elem) {
      return elem.closest(SELECTOR_OUTER) || elem;
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Tab.getOrCreateInstance(this);
        if (typeof config !== 'string') {
          return;
        }
        if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      });
    }
  }

  /**
   * Data API implementation
   */

  EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
    if (['A', 'AREA'].includes(this.tagName)) {
      event.preventDefault();
    }
    if (isDisabled(this)) {
      return;
    }
    Tab.getOrCreateInstance(this).show();
  });

  /**
   * Initialize on focus
   */
  EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
    for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE_ACTIVE)) {
      Tab.getOrCreateInstance(element);
    }
  });
  /**
   * jQuery
   */

  defineJQueryPlugin(Tab);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap toast.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */


  /**
   * Constants
   */

  const NAME = 'toast';
  const DATA_KEY = 'bs.toast';
  const EVENT_KEY = `.${DATA_KEY}`;
  const EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`;
  const EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`;
  const EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
  const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
  const EVENT_HIDE = `hide${EVENT_KEY}`;
  const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
  const EVENT_SHOW = `show${EVENT_KEY}`;
  const EVENT_SHOWN = `shown${EVENT_KEY}`;
  const CLASS_NAME_FADE = 'fade';
  const CLASS_NAME_HIDE = 'hide'; // @deprecated - kept here only for backwards compatibility
  const CLASS_NAME_SHOW = 'show';
  const CLASS_NAME_SHOWING = 'showing';
  const DefaultType = {
    animation: 'boolean',
    autohide: 'boolean',
    delay: 'number'
  };
  const Default = {
    animation: true,
    autohide: true,
    delay: 5000
  };

  /**
   * Class definition
   */

  class Toast extends BaseComponent {
    constructor(element, config) {
      super(element, config);
      this._timeout = null;
      this._hasMouseInteraction = false;
      this._hasKeyboardInteraction = false;
      this._setListeners();
    }

    // Getters
    static get Default() {
      return Default;
    }
    static get DefaultType() {
      return DefaultType;
    }
    static get NAME() {
      return NAME;
    }

    // Public
    show() {
      const showEvent = EventHandler.trigger(this._element, EVENT_SHOW);
      if (showEvent.defaultPrevented) {
        return;
      }
      this._clearTimeout();
      if (this._config.animation) {
        this._element.classList.add(CLASS_NAME_FADE);
      }
      const complete = () => {
        this._element.classList.remove(CLASS_NAME_SHOWING);
        EventHandler.trigger(this._element, EVENT_SHOWN);
        this._maybeScheduleHide();
      };
      this._element.classList.remove(CLASS_NAME_HIDE); // @deprecated
      reflow(this._element);
      this._element.classList.add(CLASS_NAME_SHOW, CLASS_NAME_SHOWING);
      this._queueCallback(complete, this._element, this._config.animation);
    }
    hide() {
      if (!this.isShown()) {
        return;
      }
      const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE);
      if (hideEvent.defaultPrevented) {
        return;
      }
      const complete = () => {
        this._element.classList.add(CLASS_NAME_HIDE); // @deprecated
        this._element.classList.remove(CLASS_NAME_SHOWING, CLASS_NAME_SHOW);
        EventHandler.trigger(this._element, EVENT_HIDDEN);
      };
      this._element.classList.add(CLASS_NAME_SHOWING);
      this._queueCallback(complete, this._element, this._config.animation);
    }
    dispose() {
      this._clearTimeout();
      if (this.isShown()) {
        this._element.classList.remove(CLASS_NAME_SHOW);
      }
      super.dispose();
    }
    isShown() {
      return this._element.classList.contains(CLASS_NAME_SHOW);
    }

    // Private
    _maybeScheduleHide() {
      if (!this._config.autohide) {
        return;
      }
      if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
        return;
      }
      this._timeout = setTimeout(() => {
        this.hide();
      }, this._config.delay);
    }
    _onInteraction(event, isInteracting) {
      switch (event.type) {
        case 'mouseover':
        case 'mouseout':
          {
            this._hasMouseInteraction = isInteracting;
            break;
          }
        case 'focusin':
        case 'focusout':
          {
            this._hasKeyboardInteraction = isInteracting;
            break;
          }
      }
      if (isInteracting) {
        this._clearTimeout();
        return;
      }
      const nextElement = event.relatedTarget;
      if (this._element === nextElement || this._element.contains(nextElement)) {
        return;
      }
      this._maybeScheduleHide();
    }
    _setListeners() {
      EventHandler.on(this._element, EVENT_MOUSEOVER, event => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_MOUSEOUT, event => this._onInteraction(event, false));
      EventHandler.on(this._element, EVENT_FOCUSIN, event => this._onInteraction(event, true));
      EventHandler.on(this._element, EVENT_FOCUSOUT, event => this._onInteraction(event, false));
    }
    _clearTimeout() {
      clearTimeout(this._timeout);
      this._timeout = null;
    }

    // Static
    static jQueryInterface(config) {
      return this.each(function () {
        const data = Toast.getOrCreateInstance(this, config);
        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
          data[config](this);
        }
      });
    }
  }

  /**
   * Data API implementation
   */

  enableDismissTrigger(Toast);

  /**
   * jQuery
   */

  defineJQueryPlugin(Toast);

  /**
   * --------------------------------------------------------------------------
   * Bootstrap index.umd.js
   * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
   * --------------------------------------------------------------------------
   */

  const index_umd = {
    Alert,
    Button,
    Carousel,
    Collapse,
    Dropdown,
    Modal,
    Offcanvas,
    Popover,
    ScrollSpy,
    Tab,
    Toast,
    Tooltip
  };

  return index_umd;

}));
;
/* GERADO por tools/gen_cursors.py — não editar. Tabela de frames de cursor animado. */
(function(g){g.__CRO_CUR={"default":{"u":["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"],"q":[0,0,0,0,0,0,1,2,3,4,5],"d":[100,100,100,100,100,100,100,100,100,100,100],"h":[1,1],"fb":"default"},"pointer":{"u":["iVBORw0KGgoAAAANSUhEUgAAAB0AAAAZCAYAAADNAiUZAAABZElEQVR42tVWS26DMBR8Rt0HhSWcgW13SKgHqFSx7R3SE/QI7UHcSjlAFMm7bHMGZ0lETjBZJEbG2Nh8oqojWQKMPZ5heDbRH4DNGIup87DASWAO5EK211WRTSIHFxIKBgnqBh1wIcGFRN2gbVxI2BZnQ2RdAaDUgQtJ61W3v8xTIiLaH0+dZ3f1mERKRFQ36FhIRHS+3JpObC4mlNhqsYKyTr/3NZ/VvcDUDXp2ni83K23qXEhi5gyWaS9LYtZaqLBe0ShCLd0I/aZW4iXx5LI9iRnqBg8hjYY69V9iLMo8pffPH6vFQ6SsKrJZxK8vz+OVzsH+eNLLI0JJYRYHHzZfv60zZZ6aBQa+II1Wtd0d6PvjzVmlNNVhpEOFwUU4lIVojBobtrtDLzDmu3eVLEQpq4oM+t7pItZdCEl76KaLoXJn2+pcKuceV9rFqMrls3Wp9DIighk03/GFLVQL8KB5/zmuN7EMXdHw8mEAAAAASUVORK5CYII=","iVBORw0KGgoAAAANSUhEUgAAAB0AAAAZCAYAAADNAiUZAAABcElEQVR42uVWPW6DMBR+Rt0jZTVnYGwnkOgV4BS0V+gtaE7QkVwhSGQio8+Ax6BwgteB2DLGYBxnaj/pDZjn95nv/WCA/wLy4D70iUMeIamabvIyT0KneIEWGDUCBABERFBNIIspZDGF6w3FQdBJrqJspQmyomyxajrUcb2Npr4Tz1uIiUIK3x+vAADQD+Nizbh0TCMK+910s/BTUTMu5CZb5JXY70ZLIwppRGWw45lDP4A0E9KIWqWekB7P3Eq+BTZfoldo1XQzKZe+ag1rMgfaAUiehFAzu4w+MOVUEvuiKFtjboMl2fMkhK+fixfp+0JuA9smF+KacamQKD5TJa+NLVTH3VpF1ozDiXHZ53oB6kX14tsCglCVUm89J3m3QBBmMd1EaCU93fOzVMli3YXQJi85fL7h4T4w1lqoH2A2lw2/PrKFVDrmSTjrNVFkIpcuQ4R4pBPVA6QRNaphGoXkSZMNXW4TzyL1vjf9TfwC/9jm5zojLs8AAAAASUVORK5CYII="],"q":[0,1,1],"d":[100,100,100],"h":[1,3],"fb":"pointer"},"help":{"u":["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"],"q":[0,1,2,3,4,5,6,6,6],"d":[100,100,100,100,100,100,100,100,100],"h":[16,12],"fb":"help"},"ro-lock":{"u":["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"],"q":[0,1,2,3,4,5,5,5,4,6,7,3,8,9,2,10,1,0,0,0,0],"d":[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],"h":[8,11],"fb":"default"},"ro-warp":{"u":["iVBORw0KGgoAAAANSUhEUgAAABQAAAAhCAYAAADZPosTAAAAp0lEQVR42mNgoDJgZGBg+E8lcxgYGBgYWBgYGBj+/yffTEZGRhQ+E7W9zAJjrD38lGTN+y49xW0gLgXYwNRsM5wOYEEXcNKTpsjLVA/DEWggRqQE20pTz0AnPWmy0iOGgdlTTzE46UkTnQ7xJS8WBgYGhmdXTzAw6AUTnQ6DbXH7hDaxLKVtQV0Dp2abjeaUwZr1qBE5KAZSmu1Qst6grZdHwSggAwAAqf4nEzeAc5IAAAAASUVORK5CYII=","iVBORw0KGgoAAAANSUhEUgAAABQAAAAhCAYAAADZPosTAAAA0UlEQVR42mNgoDJghNL/qWQOAwsxqrOmnISzp2aboZrEyIjChxv4/z9pjlx7+ClWcRZSFKODfZee4jdw7eGnWBUhg8+vnzAwMDAw+DubE+9CBgYGBic9aRwy0gzBttI4fcFEmmGEARO10+EINJAFW4QE20pTz0BSEjZeA7OnnmJw0pMmmLAJJS24gc+unmBg0AsmKh2SnLCpEstS2hbUNRC9nBvNKZQlbFxJhSwDcUUOerrDlQFYSMl2xOQiFlI1MDAwMEzLMad6Rc/IMApGMAAAyJU8NKNKOF4AAAAASUVORK5CYII=","iVBORw0KGgoAAAANSUhEUgAAABQAAAAhCAYAAADZPosTAAAA7klEQVR42mNgoDJghNL/qWQOAwupOtcceoLCD7GTQeHjNfD/f9wOX3v4KVZxFkoNwGsguuZ9l3Ab4qQnTZyBaw8/xTAIXTM+i1hIdQFMLthWGmswMFE7HQ4OA/GF4cC7EJ/r8BqITWOwrTTD1GwzvCmABZumYFtpBkIJHpcaFmKzGCGv4jRw496TDLyiMmRHCt7SBldYkZRsYK7DF/AkxTK5BlGcsHFF3hAuHLDF5L5LTwmmRxZC+RYWScg5CF8VgVIvk1JJwQyblmOOtV5mhBmKLfbQXQI1BKOSx+plXGGEzxBcEoSaI4wMo4AuAABeyWTZw+RPUAAAAABJRU5ErkJggg==","iVBORw0KGgoAAAANSUhEUgAAABQAAAAhCAYAAADZPosTAAAA/ElEQVR42u2WuxGCQBCGf5hLDY2gBkLNDKjB2AawCJuQLrAEEjqgBi8ytIAzAeY477GrGxi4M8zNHPDd7t6+AGHJptUIcaA++dsYg27QAIDjoVy9U1SAT/pRv+0pDqQbNPpR4/m4AwA22zINdEE+yAyqqwItVUMbZENSkqc+oILIwLoqVuvXQA6MDBQ1ORRvv29y6BDFMffa7JYYJVebUN66oPmg9rynVxtXE8rlBH14utwWyPxQ/JhLhUsSaFcUESAXxA5s0eLA0Vq8OJC7nnvjdVXwmpQPZJscCikVa/iuz2zIlHKrtGNrGAMlgU7ye8eO6EwSmXEy/CUmL4n9bU34ka7tAAAAAElFTkSuQmCC","iVBORw0KGgoAAAANSUhEUgAAABQAAAAhCAYAAADZPosTAAAA00lEQVR42u3UMQ7CIBQG4B/j6uikZ3B19zyex1PUK3SoN+gZYGLkAM9BSSiFvgdioknf0qSQLz/hPYDGpd5fauRgUyt0g0Y36Nn/YpCIQPQ6UD+a2fq2BPJ1f5gkJgKlEAuGkBQTJZRCH9/yCv4geDkd6tomB+VaKfvapBrbVz8aOKux2x9xu54nr42osUMIAJzV9ZMSH80nq74UZ/Uk0RL2lbZhj8wlKk6Y67d19NqMXjwlIajiyeNmOIWJEyZSJTExKIG4RfKvjVJKBLGgYM+f1hPkmWWCwSaVhAAAAABJRU5ErkJggg=="],"q":[0,1,2,3,3,4,3,2,1,1],"d":[50,50,50,50,50,50,50,50,50,50],"h":[9,14],"fb":"default"},"ro-warp-2":{"u":["iVBORw0KGgoAAAANSUhEUgAAABQAAAAhCAYAAADZPosTAAAAp0lEQVR42mNgoDJgZGBg+E8lcxgYGBgYWBgYGBj+/yffTEZGRhQ+E7W9zAJjrD38lGTN+y49xW0gLgXYwNRsM5wOYEEXcNKTpsjLVA/DEWggRqQE20pTz0AnPWmy0iOGgdlTTzE46UkTnQ7xJS8WBgYGhmdXTzAw6AUTnQ6DbXH7hDaxLKVtQV0Dp2abjeaUwZr1qBE5KAZSmu1Qst6grZdHwSggAwAAqf4nEzeAc5IAAAAASUVORK5CYII=","iVBORw0KGgoAAAANSUhEUgAAABQAAAAhCAYAAADZPosTAAAA00lEQVR42u3UMQ7CIBQG4B/j6uikZ3B19zyex1PUK3SoN+gZYGLkAM9BSSiFvgdioknf0qSQLz/hPYDGpd5fauRgUyt0g0Y36Nn/YpCIQPQ6UD+a2fq2BPJ1f5gkJgKlEAuGkBQTJZRCH9/yCv4geDkd6tomB+VaKfvapBrbVz8aOKux2x9xu54nr42osUMIAJzV9ZMSH80nq74UZ/Uk0RL2lbZhj8wlKk6Y67d19NqMXjwlIajiyeNmOIWJEyZSJTExKIG4RfKvjVJKBLGgYM+f1hPkmWWCwSaVhAAAAABJRU5ErkJggg=="],"q":[0,1],"d":[400,400],"h":[9,14],"fb":"default"},"ro-target":{"u":["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"],"q":[0,1,2,3,4,5,5,5,4,3,6,7,0,0,0,0,0,0,0,0],"d":[50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50],"h":[18,32],"fb":"default"},"ro-target-2":{"u":["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"],"q":[0,1,2,3,4,5,5,5,4,3,6,7,0,0,0,0,0,0,0,0],"d":[50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50],"h":[18,32],"fb":"default"},"wait":{"u":["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"],"q":[0,1,2,3],"d":[167,167,167,167],"h":[18,19],"fb":"wait"},"progress":{"u":["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"],"q":[0,1,2,3],"d":[84,84,84,84],"h":[0,0],"fb":"progress"},"move":{"u":["iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABN0lEQVR42u1XPQ7CIBQG4l5XE29g4lZP0kVv0HTqSTo13kAXT6Kb0RNo4qoneA5KUygPWsDSJn5J0wF43/d+eAAhIwe4GmAu5Lvj04sIW3IAAMgKgL5FVOQAAJdbvyIEci7ARQSzyHkD28PnnxXw05rgHlZRUHjfbyp85J+FbiSsRch9pK2zALTgusLUrBhGvo4jb2HWiWA68trCNlXemMdtreMIFUFNnu9PL9Sz5Swi5wc+rrK1WU0FXqojv97dw7+YE60IIQJZASRN1F1OhTQxj8u2ylzkndTTUeYUCAHB8HcBUliRdg5PObcnk6uKkJY5lcmp4lOhMY8Lw8ixbUhxj+yAkesakTcROnK5BnRb1BZGG8EPo+D3gS5hRptVvReYcj64O+HobsWDeBcIIkKRe3sb/vEGj5kwwxGTOikAAAAASUVORK5CYII=","iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABUElEQVR42u1XsW7CMBB9tjIwdky3MrJmYuEjoJ9hKR+DlP4F9CMY2sljGekWtnbsEOk6gNMYzk5TTGKkPummnO89n+8uNnAJEhAGQwJavZQ0jIgjORGRetI9i2iQExG9lR89ijghNwIuESE7kW9K9lPxvAMAqKW+YmEmIGMmC2e7N9bXUYQ4f4mBEamAkGfZEkt2qfa/YrUpnd0hOfLFNA2eapcI6SKvF3DW0qZWyx5jLqYpK0L4dr5+3Xt3NXkYYfv+5fXhYj7O7oHqwC1c5Nv9Z7D0T9I7p4g6A2qpoeZjdsS6oObjX/mcxizyrM5AAgCoIIo8I0BbQYs88xeVCerxA7QltkluF+FBhE1eQbDGweFrxHHk523YWBAaHDk/iK4gwkX+UwNcOkOhJdb/33DwG5HoIsA1MZvDyFdwUd6Kb+xdEMXLKIq3YRSv40D4Bkb5WBCaOVw3AAAAAElFTkSuQmCC"],"q":[0,1],"d":[667,83],"h":[15,15],"fb":"move"},"ns-resize":{"u":["iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAqUlEQVR42mNgGJSAheH/gFq+9vjz/wPjCKjl/////5897RydHYFk+f////9fe/6ejo5AsxzmAHo4gomBheH/2sPPsUpOXX+fgYGBgSF70jkaJkwWhv8wDAsFDN/DML2igp7xzzTQRc6oA0YdMOqAUQeMOmDAKyNGWHUcZCGBInH9xQd4dczAwMAwNc+IgeEPA+Owa5AMkibZoGiUDopm+aDomIyCUUBnAABAUNICV+t1/wAAAABJRU5ErkJggg==","iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAqUlEQVR42u2XsQ3CMBBFXyIPwRxUzMEakRgGKWwRMQQFXcpQUpoOBkD6NBglkJazBfelq674zz5L/gdzCohsCqg7RuWBeJpLUrPrjSFG5pI0xKshxJt5ArCAqAmoO8TZZrs/A9Bs+y8+zIBSpVv4OH0qq1FYzr8msxzAARzAARzAAbJ/x1UKJOvVYtI4XW6vQALQbpZwp/q5SFZIKC0ilhexmBSxmrn+TQ8AiNIGrItz0QAAAABJRU5ErkJggg=="],"q":[0,1],"d":[667,83],"h":[5,13],"fb":"ns-resize"},"ew-resize":{"u":["iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA0ElEQVR42u2UMQ6CMBiFH4QDOOLo6Mrk4iHUYzTpYUzKLdBDMODU1dGxjByApA6ERgKV/jCw/F/SpAOv7/0vtICPBBYJLKgQdbHvkKI0WEpRGoSGiH3m11OKNVBCDM0rY3uKylhXaeCa1P8hmpv88apJM0zpb+c90P54jQJ4zN91s6j+Y7oLDjFoQNw1xOUw+EA9PyTzKb2SmbeBxO1aREpmFuhC9MZKZsT5tQsyZ+79EUWurcj14neAoh9fw64JrIU++UYvIcMwDMMwDMNszhdI6YSOuVHycgAAAABJRU5ErkJggg==","iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA0ElEQVR42u2UMQ6CMBiFH6QHcMTR0ZXJxUOox2jCYUzKLdBDMODU1dGxjByApA5IDckPKYWE5f+Sjv97739pC1AIWAhYhDJjPqaGi9JgKUVp4BMipsyvpwRr4Bvib14Z21NUxroqZx5SZ4RoavPHqw7anNK5nfdA+/MbBBgxf9fNovqPyc4rhGtA3jXk5TAYUs9PkDmlo7KUbEAAAFpEKkst0IXojVWWBu6vXZApc/IiylxbmevF/4CvzvAZdk1gLfw33/AnZBiGYRiGYZjN+QKE7oaUArtXrAAAAABJRU5ErkJggg=="],"q":[0,1],"d":[667,83],"h":[14,5],"fb":"ew-resize"},"nwse-resize":{"u":["iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABoElEQVR42u2WzUoCYRSGX+VzUftWRXfQIjdRXcS0EIKiRRBEtTJJixZFEBRtKrGuoZ9FQovIRSujoqI/UCkLajJSMVuok9q8LSqxkspwFGKe1Rw48D1z5nxnDlBhDAAAAX6blX3L0wDx/rB2mCyY0Gau1rQCIj+QGqo+lsdk0PTtAcCYH8QUBYCKjKpCUcvTAx8EtnxpRBQj5HgCqSzQ1ev4uT9KKSCECUcy4N6N4yoG2Mam0Dfs0lwCEODaSZIQIATYKI3QuRnm+SO5E4yz2zpObSXeDs6Pm6R+utZ99EeeeHDzyB77NLWvxCeppvYJLmwleJkmT6Jkj2Om/BItFhvn3Gc8Cz1w2x8qw+coIGGWBun0hHmpkMdRcmBssRISQ1z03DIQe+beRZQd/fYvfaN5ozZbrJxfD9AXSXNfTnF5ZTV3c3K3SOtKtHZOcnYjTDnFHIkM/yxgLCo7C4N3aRTpZwNCd/dQ+XpetSjRJPythF2qgRzNIJZSSjuKi6G2vg7eIHAavC7BQlLs2P5udyjy9/0ngUptTzo6Ojo6/5MXwNzjFWLCYkQAAAAASUVORK5CYII=","iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABoklEQVR42u2WTS8DQRjH/9uMA3cn4hs4cBF8iHWQSIiDRCI4IYo4EImEuHgJPoOXA4mDcHAiCEI1qQ0lYVW0zapDdbXd/TugIaTS1d1e9neaySQzv5nnmZlHggCRjTQk2IgAgLWTl18HG6pLYDfisyFXFn8bkIok23cPAJ7PhqbrAEykTBO6CcfICOwEkojoHqixOBJpoLVjAH/mRz4FhCjCqQqsH8RwowF9IxPoHJx3QEKAa74XQoAQYJU8xLmtMC+fyf1gjG09o7RX4mPhr/0auYvzGwFeRF55fPfMdu8knQjHN6mapjEu7MR5nSR9UbJ9YMp5ibrGPs6s++kPPXHvIuRAOLJIKJpBRTMKexIFlaiWezm3HaaiGTyLkt0ji4WQ6Ofi9j0VzeDhVZTNXd4fN8j2K1vb2MPZDYWBSJJHaoLLK6uZNyTznth9EvUt45zeDFNNMEM8RUsCnpwF0pB2l4aRNCSEHh5h8n29EvHPvyBXCa9cCjWagpbQ8/MZWaGsohy7QeA8eGt5DslqHmStonIoZCwLFLKOdHFxcXHJK29KogUfEFArRQAAAABJRU5ErkJggg=="],"q":[0,1],"d":[667,83],"h":[10,10],"fb":"nwse-resize"},"nesw-resize":{"u":["iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABjklEQVR42u2WvUtCURjGH+UkaEW6tAQhBE3Z0NLmUmODNLW1B0FD5NofUP9AS6MVBCYUUhAkORgpemlIRfEDG/rw5lXvVa/5NpRpHxT3kjeI+5sOHM55nvc5L+cc4I8xKF7BQN/ON5XtydS4XnJvYmZuAVIhjIHxWRSSV3DYLXBOT2iUGwPxDXrjsVKn6yrRj+l8gVGtB2tfZzzUb0IwUlK1j1FN9cvr22g0WxAaDcgAQhkegxamMkyF4t6ICLlaAV+rIfXA8CTd4CIpw2wb7XECr+ImkjE5ZkYgLmNv/xhOxwhW5+2IJzO9bTovJ9JRrETpokQ+rkwu9+77pmNQ1YTKxWPCZ3HNKv+/4h/PT/PKGeg00aK2ES8n0kGYpzQvkY/TInYG2gnkqFi8J5GI6i2iSF4gz3mGXGtanDkDec6y1E1BKNPiRki7hus2wIsSxW8FTcQ7V7Hh5RkXASTvZCSyJWiBoZ2AP1pDLuqHyTaMpnUKl8ET5DMpHG6tKP5kqDLwm78cHR0dHR0dJTwDjsQmO0Ka4OQAAAAASUVORK5CYII=","iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABpUlEQVR42u2WzStEURjGn8udzcTSiuysrMxG+COuxZQiC6VklEJmyIKUhWaDCX+Dj8WoWcgslCLJRz5q3HwVY2RmukaZD3fceSwM8pGPy52S+1udzqnzvO9z3nPeI0APIvjh+h2Er2+lE+9m4t35WpsVuUEEX+PdSfBTd37LAQBIZYB8ZGDJA5SUqjMPndk3triQvANiN3EUWAuxFFAhipYcBCCCrT3jaGl34EQBlrZiKC8r1CWuK/OmjgGuHsV4cE16FsKskHofzl2Erhr4lnizc5gbZ9fcj9xy3BdgpeR4KZgNxBhxl5s7UfJYJScW46ysGzQw23dsX9kPcS90xdG5PVbbu3In3uxyU1Y0yor2z8Tb+ie5HSVlRaPHH6ZN6jSuwF5Xcr3DybXDKGVF46T/nDap29jr9XR/RXB6ZpbrwSQDEZVjPplV9g6Dbc8GEE8/N5VgkhyZD7OmYcjwM897HFizj3KGROjiEqomYHmq71u9/UcBPKIkUwhG03BKRYaLv2lGu0enOE4Uobi0BLlCgAh++Lsx2AXhN/93JiYmJiZ/kntQOxNGOCR3yQAAAABJRU5ErkJggg=="],"q":[0,1],"d":[667,83],"h":[10,10],"fb":"nesw-resize"},"crosshair":{"u":["iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA+ElEQVR42u1XwQ2DMAy0o/47TYfpDHkxSV6IDXgxCe92gnYANnAfbWhDSuKkhhSJk5AAWb4jOGcHIQ4CPhASceAEtf0A59PReXe9AzTd+7mukrmTQG0/0Ccut+elDVHiKsmIWJvcE1GC3BFRijxnZ/w/1ljOWQ5l9/mCIuiVH2YFZIigFPKpiXlBFsLV7fhGKK/jcEIiPOdkCwiIIMb9V/KoAOvrgvZK2pCTNyjABgvbKyvv2I6bbmypyNwFsTisK6TY96hJP+c2dXYcZ04o6oSb7h8iUD94e7lhpNREVHQmXGwqVgn/3IM9F2hD2TWBwhWPsGPH1vAAqYNWSAEz21YAAAAASUVORK5CYII=","iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA8klEQVR42u1XwQ2DMAx0UP+dpsN0hryYJC/EBryYhHc7QTsAG7iPNi0mSnuBpP7kJCRA5nyE+GyIlGGAGM7MJ3BAgoZppvPpKO5d70T9+LnuWlN0pXiYZl7icnse1jEnrlIeEf9OHojQSC5EaCXfUhkwIRcUG+VulqVWQAS/eOmngEQRjCZf+0c02CPTBhMli/AJk9kpIjCtZAEREdD5OjkswFtrBodj61jwQQL8Q5kcDuYT3bAf313NAFXwLcZ0rWHkPUQZgsnhmJQWreaE6r2g2WGveq1Yax5QnYiKzYRNwjcP4Kdi63jznlD/L6ioqHgAe/5WSKOw++EAAAAASUVORK5CYII=","iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA7klEQVR42u1Wuw3DIBAFlD7TZJjMQOVJqCxv4MqTuHYmSAbwBi9FRBKMEccvWApPcmHA754O371j7N/BCWeQmc/AiXJonFd2vZyNtduDsWH6vPcdL5opjPOKbyz31yMVEJilPCJ+HdwSUSO4IaJE8BBS5OIU27+dSM6JmfIeEnslRxABSvBt6XoVayTesVEtITxGnUeKsPpFtIAdEXBcAVzBgwXo7pbQZCAVDJ4gAfrjxCYTxGOZ0TC9jYV7qsC1z/uOg6rfKkNCcNJ+jDtW6YSH8oLDu2HVeaDYRCRSXE3PhFKBxYqoPhU3NDRUxxObw1dGBBQVYQAAAABJRU5ErkJggg=="],"q":[0,1,2,1],"d":[667,33,33,33],"h":[13,13],"fb":"crosshair"},"win-uparrow":{"u":["iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAj0lEQVR42u3XsQmAMBAF0K9kW7cRdAtxAxsLO+1sLVO6gPBtDEgUrLyI/INrksC95EIgwCfDgUmLN4NnGsRRnCSLejRGnIqT5OxXQ0RUPAAsEDkc2PT+drJqFwBAUY4vXkwHhgyncNl9SKtWWPY/T/3kCCCAAAIIIIAAyQEuHugmj26yA2SPH5ItWqNQ/C12O2Nzrwn77fQAAAAASUVORK5CYII=","iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAkklEQVR42u3XMQrEIBAF0L9hbpvbLGxuEXIDmxTbmS5tSstcIPC3WWExQprs2PwPNirM07ERqMVANIuB4zuxDeJbnCT7ITojfoqT5Jp2R0RRPAM8EB0MHOdUXXxNGwCgf8Y/PkwD88i3cDp9Hl6t8Ox/h8YRQAABBBBAAAEEaA6wciIsCWHxAzwuv2RHsUdRbs4Hhi9zsz8QyGIAAAAASUVORK5CYII="],"q":[0,1],"d":[667,83],"h":[5,0],"fb":"n-resize"},"win-help-hand":{"u":["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"],"q":[0,1],"d":[234,234],"h":[0,0],"fb":"help"},"win-link-alt":{"u":["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"],"q":[0,1],"d":[234,234],"h":[0,0],"fb":"not-allowed"}};})(typeof window!=="undefined"?window:this);
/**
 * C-RO cursor (PLANO_CURSOR C2) — anima o cursor do Ragnarok. O CSS não anima cursor: aqui o JS troca o valor dos tokens --cro-cur-<estado> em <html>.
 *   • anima SÓ o estado que está sob o ponteiro (lê o cursor calculado do alvo); sem animação em repouso
 *   • desliga com prefers-reduced-motion, aba oculta, ponteiro fora da janela, ou html[data-cro-cursor-anim="off"]
 *   • caneta: marca html[data-cro-pen] quando o ponteiro é uma caneta/stylus (o CSS troca a barra I pela caneta nos campos editáveis)
 * A tabela de frames (window.__CRO_CUR) é gerada por tools/gen_cursors.py.
 */
(function (g) {
  var T = g.__CRO_CUR;
  if (!T || typeof document === "undefined") return;
  try { delete g.__CRO_CUR; } catch (e) { g.__CRO_CUR = undefined; }
  var root = document.documentElement, byUrl = {}, active = [], timer = 0, idx = 0, last = null, ev = null, ticking = false;
  var mq = g.matchMedia ? g.matchMedia("(prefers-reduced-motion: reduce)") : null;
  Object.keys(T).forEach(function (k) {
    T[k].u.forEach(function (b) { (byUrl[b] = byUrl[b] || []).indexOf(k) < 0 && byUrl[b].push(k); });
  });
  function value(k, i) { var s = T[k]; return 'url("data:image/png;base64,' + s.u[s.q[i % s.q.length]] + '") ' + s.h[0] + " " + s.h[1] + ", " + s.fb; }
  function stop() {
    clearTimeout(timer); timer = 0;
    active.forEach(function (k) { root.style.removeProperty("--cro-cur-" + k); });
    active = [];
  }
  function step() {
    active.forEach(function (k) { root.style.setProperty("--cro-cur-" + k, value(k, idx)); });
    var d = T[active[0]].d; timer = setTimeout(step, d[idx % d.length]); idx++;
  }
  function start(keys) {
    if (active.join() === keys.join()) return;
    stop();
    if ((mq && mq.matches) || document.hidden || root.getAttribute("data-cro-cursor-anim") === "off") return;
    active = keys; idx = 0; step();
  }
  function check() {
    ticking = false;
    var t = ev && ev.target;
    if (!t || t === last || t.nodeType !== 1) return;
    last = t;
    var m = /url\("?data:image\/png;base64,([^"')]+)/.exec(getComputedStyle(t).cursor);
    var ks = m && byUrl[m[1]];
    if (ks) start(ks); else stop();
  }
  function onMove(e) {
    ev = e;
    if (e.pointerType === "pen") { if (!root.hasAttribute("data-cro-pen")) root.setAttribute("data-cro-pen", ""); }
    else if (root.hasAttribute("data-cro-pen")) root.removeAttribute("data-cro-pen");
    if (!ticking) { ticking = true; (g.requestAnimationFrame || setTimeout)(check); }
  }
  function recheck(e) { last = null; onMove(e); }
  document.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerdown", recheck, { passive: true });
  document.addEventListener("pointerup", recheck, { passive: true });
  document.addEventListener("pointerleave", function () { last = null; stop(); });
  document.documentElement.addEventListener("mouseleave", function () { last = null; stop(); });
  document.addEventListener("visibilitychange", function () { if (document.hidden) { last = null; stop(); } });
  if (mq && mq.addEventListener) mq.addEventListener("change", function () { if (mq.matches) stop(); });
})(typeof window !== "undefined" ? window : this);
/* GERADO por tools/gen_favicon.py — não editar. Favicon padrão do kit (data URIs). */
(function(g){g.__CRO_FAV={"png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAIF0lEQVR42u2XS2xdVxWGv7X3PteP2EnatB0wgiJI3MT2fdmx0zZUpSqqxIDHAJqiUNvxtVMnqpSiqkIghCpVqBTSJnETx3ESGlR1yKAVCKlS6SPx49x7fW3nUSFRxBCSkBDHj3vO2YvBTdNatYsYw56co/3Sp7XX+tda8L8+5OOfdY0pVVW8BoBfsUMQQFGtfT85prdWBBFQ1Y8PgE+IXYJgbl+ltZ0EzrFwfVEA3MeL1WrMkVfexpsUouAFXj7Yz+CGRgbfH0XLFTK9z9O/bj1PfzBGND3B9l3D9G7cSE+hjYZtbaSfPAImYWTn/XTtzrB8YRavddz/qz+gIuxobOCr1vLTizO3ocwKc0g9xjjEpLBShyFgXQRBuUh9bgtDjZt4/coi3i7TIJbYeU5f+ztNuTacEbzxGPWkxBN0ZrkULvH6yAd4ozzUsI6+zgxDh55a8QQrALxobUrAG+WZA6d4dX6BqbEJvFHyuRYWAouUL6LpVkZ2Psyyc5j2NLEVgiShd0MTnX2dRNKIquHg0g12NjSzq7uNzp4usNHqAI899g28AcWDgk0MVaNUxTBdLJPMlOnq287QhjqsrxJbZf2yYlWBBC0v4R080J7Ft7cS/+YoYXiB+qhKBqiPBfWOo/uHVwC4TztboAlIws3jP8ZKxCuL84g1QMTskRlyg1vpauvg3Ngk28USBTEDTY2o1OF8A94LVh3J3IecH08QiajadeSzOdKFdooj43xYZQ0AL3zf/Y7Uk7sIel6iOHQcCWfxxnNs/jqUSySjyxixzIUh3emAqdIEKW/wpWlmwkmGmprJFNohnCSSgMMLNziwro5MT56pkUmmwxL3ubrVAd74ZgvTxcvExREaI2UmnMHZZXKZbgaO7cecPMzJV6fI5rOId0yHHofgjWCSWtQYIlSEShhjjOHkzq9hVQlPT1IJpzEi5LJpuFj5LEC5fI2/tO5l0Rqseg7+qUBlbhRvDcg8gtJf6ObYiQmcGsJyCCo4rzAzgVFlRzpHMj0OmqIyGZLN5UGqVIolqlboznRyU3V1IapzRg8dmkCNoXSswPBAFunrwxvLzOAx5sbLLNZVsUkdsYHO/j0oSnjsFFYiVAM6OtJ4oFgsoxLjMaCOosQ4n5AVx4KB5y7NsnyzulKIEgxQxWCIraBWMWOnKJc8pbDEcHWBU50PQmcOISGbBU8KKezGl85js21MnDxFLruN3sEsoyNljAeRmLSBGQSvgoqiop8NQxFBjWB8QrsEGE1RLC8ThiUOVm8QW8eUA2889z6Y51pThqvNm2kdfICvHHicdAd07OlnolzC9/ayZyCHNzE+n6PiE1ySEHjFoyvk51NCpDivLIw9w450G9NTVU6GFcqSIFj2NTZRmSxjJmcItKYVmzYLTiLWtzSi2U4yGYON6xCfw/b0ICp4qeUKNcKSg4tJjE3M6kpYSyUCWmU0nCYzOMzZmwmv7XiEEgu8c+UGifEEy+e5Y4sgdCPkELJ4aYd8DpUYPfMU4i2tnd2AkM/nAKUu8Wy19WtLMSIInrA8S3fhCN7XU2iuZ6x4FqdKZJcYLZYI/DKX/xyhWkIpk2iRwvY8A9t7mPPCgeEJ/OnTnJk4S5vxWO/Ynd/BojVcSBY/B+CWHWY0YdHeig4fIZKQ7z+NSoBSc6CGyJCUKwzk9jDUMUDKg1GlryNLq4GKj/hhPs+ZiRDsTToyAQ0+4T6T+k8AtXdz3mDwVNSSLQzjJUA0YGR8HHwdqeVZ9haOYIzwzpVreHGIWo6XQ8reUDw+Rb0Xejq6iEhh+n5AJrcdI3w+gALdfSN4cSQGYlFEAywRzz1ajxWpeYpajh/dT6FQQDCIKjkMbVhiawiNEpZLOIXEKqJKqRjetuCaAIKSCCAe1JEvjJJoHb54lO/tP4QqXG9qYb5hK5hlMuk6lIiOxLE7fJ+9547QhsEo2CRh0Sl7fz1Aed8YrR1pCocH1gIQPIrH4AGPYFmuWcUpqEO0CTUV1m9pYH2L5XpjjsTAcxubaOvyOAWRNPs+OEjWC9VAaWrbhp7+LdO+5uClscraFoiNqdV9Akbj28vGK5EFT8SNi0uob0OwbGwx3Gxo4Yn9D9Fx+D2Mj8GHMHeB7OAQJjFEBFSmYjqzGWJSHLr8j7XSscP5GDP4KrFWETUIIOJJMLx7+Sr58QlymQZKQ6+x+ekBICIylvkdj9M8/TpWFRGlVExwxGTznRAWETz/nJ3j5avXUJOsDlDvPYrDaALY22lKUJw3PPzos7z0x1/yrH+Erft6ufjeOXJZB9QuVLEoAcWSJ5Aq1fIMk1IPBt69fIW5qSI779pAVezqAInEK6NBFSO1UhpRjBeKUyGTd26gWg7p2pOHaAluFRjioVKMsUQsTV+ijKNSOse/7v0CP3r0i5z4611k1LNohDdWA3D4TyVnEAFRh9qIF1/4FgnC1zfdw3RYpIRS0YicBGi2A0Vxk2eJnKMolveuXqb5o4+YkoBf7Bpg7/M/Z6SwlVNHz/NlK2v4gBpUFZEYsLWWQxNefP4JHrznboIEYhsRJIo3kE/XMzQ6iQ9DUBgfOcHO/n6WnNJ6Xyvx1m288O3v8Le33gQzD9qMlxiT6YLzl1YBACwRmgSoxKBQNcL9d9+BeGXJJjivbLYBF3xMa74XOV4ErT3dd3/2E94eHSFIt6EYfv/WmxwbPcEdm+4En8LEwhaXYslWsX7psxXRl8ToNfytZqumiFVbj5fkVg7/74aqYrCIRKAO5JOWLnCW+cVF4f8D+Ddov8aWHsSyhAAAAABJRU5ErkJggg==","apple":"data:image/png;base64,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"};})(typeof window!=="undefined"?window:this);
/**
 * C-RO favicon — se a página NÃO declara favicon, aplica o do kit automaticamente.
 *   • "declara" = existe <link rel~="icon"> (inclui "shortcut icon") com href não vazio, fora o nosso. apple-touch-icon só é injetado se não houver nenhum.
 *   • se o site adicionar um favicon depois, o do kit sai; se o site remover o dele, o do kit volta (MutationObserver no <head>).
 *   • desliga com <html data-cro-favicon="off">.
 *   • limitação: um /favicon.ico "implícito" (sem <link>) não é detectável sem requisição; nesse caso o do kit vale (declare o seu <link> para vencer).
 * Os data URIs (window.__CRO_FAV) são gerados por tools/gen_favicon.py.
 */
(function (g) {
  var F = g.__CRO_FAV, d = g.document;
  if (!F || !d) return;
  try { delete g.__CRO_FAV; } catch (e) { g.__CRO_FAV = undefined; }
  var MINE = "data-cro-favicon-link";
  function head() { return d.head || d.getElementsByTagName("head")[0]; }
  function declared(sel) {
    var l = d.querySelectorAll(sel);
    for (var i = 0; i < l.length; i++) if (!l[i].hasAttribute(MINE) && (l[i].getAttribute("href") || "").replace(/\s/g, "")) return true;
    return false;
  }
  function mine() { return d.querySelectorAll("link[" + MINE + "]"); }
  function add(rel, href, type, sizes) {
    var l = d.createElement("link"); l.rel = rel; l.href = href; if (type) l.type = type; if (sizes) l.setAttribute("sizes", sizes);
    l.setAttribute(MINE, ""); head().appendChild(l);
  }
  var busy = false;
  function sync() {
    var h = head(); if (!h || busy) return;
    busy = true;
    var off = d.documentElement.getAttribute("data-cro-favicon") === "off", has = declared('link[rel~="icon" i]'), m = mine();
    if (off || has) { for (var i = 0; i < m.length; i++) m[i].parentNode.removeChild(m[i]); }
    else if (!m.length) {
      add("icon", F.png, "image/png", "32x32");
      if (!declared('link[rel~="apple-touch-icon" i]')) add("apple-touch-icon", F.apple, "image/png", "180x180");
    }
    busy = false;
  }
  function init() {
    sync();
    if (g.MutationObserver && head()) new MutationObserver(sync).observe(head(), { childList: true, subtree: true, attributes: true, attributeFilter: ["rel", "href"] });
    new MutationObserver(sync).observe(d.documentElement, { attributes: true, attributeFilter: ["data-cro-favicon"] });
  }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", init); else init();
})(typeof window !== "undefined" ? window : this);
/**
 * C-RO JS (P6) — sem dependências. O visual é CSS; aqui só comportamento/acessibilidade:
 *   • abas  [data-cro-tabs] / [data-cro-tab] / [data-cro-panel]: roles ARIA, roving tabindex, setas/Home/End
 *   • CRO.alert / CRO.confirm / CRO.prompt  → Promises, substitutos dos diálogos nativos (usa <dialog class="cro-modal">)
 *   • CRO.bar(el, perc)  → define a largura da barra HP/SP (.cro-progress ou __bar) e troca para vermelho se perc < 25 (sem data-cro-color)
 *   • CRO.menu(items, x, y)  → menu de contexto (.cro-menu) que resolve com o item escolhido
 *   • select[data-cro-select] → popup de opções no visual do kit (o popup nativo não aceita CSS)
 * Idempotente: CRO.init(root) pode ser chamado de novo para conteúdo inserido depois.
 */
(function (global) {
  var uid = 0;
  function nid(p) { return "cro-" + p + "-" + (++uid); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- abas ---------- */
  function selectTab(btn, focus) {
    var bar = btn.closest("[data-cro-tabs]");
    if (!bar) return;
    var btns = bar.querySelectorAll("[data-cro-tab]");
    var panelRoot = bar._croPanels;
    Array.prototype.forEach.call(btns, function (b) {
      var on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    if (panelRoot) {
      panelRoot.querySelectorAll("[data-cro-panel]").forEach(function (p) {
        p.hidden = p.getAttribute("data-cro-panel") !== btn.getAttribute("data-cro-tab");
      });
    }
    if (focus) btn.focus();
  }

  function initTabs(root) {
    (root || document).querySelectorAll("[data-cro-tabs]").forEach(function (bar) {
      if (bar._croTabs) return;
      bar._croTabs = true;
      var btns = Array.prototype.slice.call(bar.querySelectorAll("[data-cro-tab]"));
      bar._croPanels = bar.dataset.croPanels ? document.querySelector(bar.dataset.croPanels) : bar.parentElement;
      bar.setAttribute("role", "tablist");
      var vertical = bar.classList.contains("cro-tabs-v");
      if (vertical) bar.setAttribute("aria-orientation", "vertical");
      var active = btns.filter(function (b) { return b.classList.contains("is-active"); })[0] || btns[0];
      btns.forEach(function (b) {
        if (!b.id) b.id = nid("tab");
        b.setAttribute("role", "tab");
        if (b.tagName === "BUTTON") b.type = "button";
        var panel = bar._croPanels && bar._croPanels.querySelector('[data-cro-panel="' + b.getAttribute("data-cro-tab") + '"]');
        if (panel) {
          if (!panel.id) panel.id = nid("panel");
          panel.setAttribute("role", "tabpanel");
          panel.setAttribute("aria-labelledby", b.id);
          b.setAttribute("aria-controls", panel.id);
        }
        b.addEventListener("click", function () { selectTab(b); });
      });
      bar.addEventListener("keydown", function (ev) {
        var i = btns.indexOf(document.activeElement);
        if (i < 0) return;
        var k = ev.key, n = btns.length, to = -1;
        if (k === "ArrowRight" || k === "ArrowDown") to = (i + 1) % n;
        else if (k === "ArrowLeft" || k === "ArrowUp") to = (i - 1 + n) % n;
        else if (k === "Home") to = 0;
        else if (k === "End") to = n - 1;
        if (to < 0) return;
        ev.preventDefault();
        selectTab(btns[to], true);
      });
      if (active) selectTab(active);
    });
  }

  /* ---------- diálogos (substitutos de alert/confirm/prompt) ---------- */
  function modal(opts) {
    // opts: title, message, input(bool|string valor inicial), buttons:[{label, value, primary, cancel}]
    return new Promise(function (resolve) {
      var dlg = el("dialog", "cro-modal");
      var win = el("div", "cro-window");
      var tb = el("header", "cro-titlebar");
      tb.appendChild(el("span", "cro-titlebar__title", opts.title || "Aviso"));
      var body = el("div", "cro-window__body");
      var msgId = nid("msg");
      var msg = el("p", null, opts.message == null ? "" : String(opts.message));
      msg.id = msgId; msg.style.margin = "0 0 6px"; msg.style.whiteSpace = "pre-wrap";
      body.appendChild(msg);
      var input = null;
      if (opts.input !== undefined && opts.input !== false) {
        input = el("input", "cro-input");
        input.type = "text"; input.value = opts.input === true ? "" : String(opts.input);
        input.style.width = "100%"; input.setAttribute("aria-labelledby", msgId);
        body.appendChild(input);
      }
      var foot = el("div", "cro-window__footer");
      var result = opts.dismiss;
      var primary = null;
      opts.buttons.forEach(function (d) {
        var b = el("button", "cro-btn", d.label);
        b.type = "button";
        b.addEventListener("click", function () {
          result = d.value === "__input__" ? input.value : d.value;
          dlg.close();
        });
        if (d.primary) primary = b;
        foot.appendChild(b);
      });
      win.appendChild(tb); win.appendChild(body); win.appendChild(foot);
      dlg.appendChild(win);
      dlg.setAttribute("aria-labelledby", msgId);
      if (opts.role) dlg.setAttribute("role", opts.role);
      dlg.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" && input && ev.target === input) { ev.preventDefault(); primary && primary.click(); }
      });
      dlg.addEventListener("close", function () {
        dlg.remove();
        if (prev && prev.focus) try { prev.focus(); } catch (e) {}
        resolve(result);
      });
      var prev = document.activeElement;
      document.body.appendChild(dlg);
      dlg.showModal();
      (input || primary).focus();
      if (input) input.select();
    });
  }

  function alertBox(message, o) {
    o = o || {};
    return modal({ title: o.title || "Aviso", message: message, role: "alertdialog", dismiss: undefined,
      buttons: [{ label: o.ok || "OK", value: undefined, primary: true }] });
  }
  function confirmBox(message, o) {
    o = o || {};
    return modal({ title: o.title || "Confirmar", message: message, role: "alertdialog", dismiss: false,
      buttons: [{ label: o.ok || "OK", value: true, primary: true }, { label: o.cancel || "Cancelar", value: false }] });
  }
  function promptBox(message, def, o) {
    o = o || {};
    return modal({ title: o.title || "Entrada", message: message, input: def == null ? true : def, dismiss: null,
      buttons: [{ label: o.ok || "OK", value: "__input__", primary: true }, { label: o.cancel || "Cancelar", value: null }] });
  }

  /* ---------- menu de contexto ---------- */
  function menu(items, x, y) {
    // items: [{label, value, disabled}] ou "-" (separador). Resolve com value (ou undefined se fechado).
    return new Promise(function (resolve) {
      var ul = el("ul", "cro-menu");
      ul.setAttribute("role", "menu");
      ul.style.position = "fixed"; ul.style.zIndex = 2147483000;
      var lis = [];
      items.forEach(function (it) {
        var li = el("li");
        if (it === "-") { li.setAttribute("role", "separator"); ul.appendChild(li); return; }
        li.textContent = it.label; li.setAttribute("role", "menuitem"); li.tabIndex = -1;
        if (it.disabled) li.setAttribute("aria-disabled", "true");
        else { lis.push(li); li.addEventListener("click", function () { done(it.value); }); }
        ul.appendChild(li);
      });
      var finished = false;
      function done(v) {
        if (finished) return; finished = true;
        document.removeEventListener("mousedown", away, true);
        ul.remove(); resolve(v);
      }
      function away(ev) { if (!ul.contains(ev.target)) done(undefined); }
      ul.addEventListener("keydown", function (ev) {
        var i = lis.indexOf(document.activeElement);
        if (ev.key === "Escape") done(undefined);
        else if (ev.key === "ArrowDown") { ev.preventDefault(); lis[(i + 1) % lis.length].focus(); }
        else if (ev.key === "ArrowUp") { ev.preventDefault(); lis[(i - 1 + lis.length) % lis.length].focus(); }
        else if (ev.key === "Enter" && i >= 0) document.activeElement.click();
      });
      document.body.appendChild(ul);
      var r = ul.getBoundingClientRect();
      ul.style.left = Math.max(0, Math.min(x, innerWidth - r.width)) + "px";
      ul.style.top = Math.max(0, Math.min(y, innerHeight - r.height)) + "px";
      document.addEventListener("mousedown", away, true);
      if (lis[0]) lis[0].focus();
    });
  }

  /* ---------- select com popup do kit ---------- */
  function initSelects(root) {
    (root || document).querySelectorAll("select[data-cro-select]").forEach(function (sel) {
      if (sel._croSel) return;
      sel._croSel = true;
      function open(ev) {
        if (sel.disabled || sel.multiple) return;
        ev.preventDefault();
        var r = sel.getBoundingClientRect();
        var items = Array.prototype.map.call(sel.options, function (o, i) {
          return { label: o.textContent, value: i, disabled: o.disabled };
        });
        menu(items, r.left, r.bottom).then(function (i) {
          if (i === undefined) return;
          sel.selectedIndex = i;
          sel.dispatchEvent(new Event("input", { bubbles: true }));
          sel.dispatchEvent(new Event("change", { bubbles: true }));
          sel.focus();
        });
      }
      sel.addEventListener("mousedown", open);
      sel.addEventListener("keydown", function (ev) {
        if (ev.key === " " || ev.key === "Enter" || (ev.altKey && ev.key === "ArrowDown")) open(ev);
      });
    });
  }

  function bar(el, perc) {
    var b = el.classList.contains("cro-progress") ? el.querySelector(".cro-progress__bar") : el;
    if (!b) return;
    var p = Math.max(0, Math.min(100, Number(perc) || 0));
    b.style.removeProperty("width");
    b.style.setProperty("--p", String(p));
    if (!b.hasAttribute("data-cro-color")) b.classList.toggle("cro-progress__bar--red", p < 25);
  }

  function init(root) { initTabs(root); initSelects(root); }
  global.CRO = { init: init, initTabs: initTabs, selectTab: selectTab, alert: alertBox, confirm: confirmBox, prompt: promptBox, menu: menu, bar: bar };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(); });
  else init();
})(typeof window !== "undefined" ? window : this);
