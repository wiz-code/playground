import { States } from './constants';
import EventDispatcher from './event-dispatcher';

class EventManager extends EventDispatcher {
  #prevTime = 0;

  constructor() {
    super();
    this.addDelegateEvents = this.addDelegateEvents.bind(this);
    this.activate = this.activate.bind(this);
  }

  addEvent(data) {
    const listener = EventDispatcher.createListener(null, data);
    const { type } = listener;

    if (type === 'timeout' || type === 'interval') {
      if (!this.scheduleMap.has(null)) {
        this.scheduleMap.set(null, new Set());
      }

      const set = this.scheduleMap.get(null);
      set.add(listener);
    } else {
      if (!this.listenerMap.has(null)) {
        this.listenerMap.set(null, new Set());
      }

      const set = this.listenerMap.get(null);
      set.add(listener);
    }
  }

  addEvents(data) {
    const dataList = Array.isArray(data) ? data : [data];

    for (let i = 0, l = dataList.length; i < l; i += 1) {
      const dataObject = dataList[i];
      this.addEvent(dataObject);
    }
  }

  addDelegateEvent(listener) {
    const { name, type, parent } = listener;

    if (type === 'timeout' || type === 'interval') {
      if (!this.scheduleMap.has(parent)) {
        this.scheduleMap.set(parent, new Set());
      }

      const set = this.scheduleMap.get(parent);
      set.add(listener);
    } else {
      if (!this.listenerMap.has(parent)) {
        this.listenerMap.set(parent, new Set());
      }

      const set = this.listenerMap.get(parent);
      set.add(listener);
    }
  }

  addDelegateEvents(data) {
    const listeners = Array.isArray(data) ? data : [data];

    for (let i = 0, l = listeners.length; i < l; i += 1) {
      const listener = listeners[i];
      this.addDelegateEvent(listener);
    }
  }

  watch(object) {
    this.subscribe('unscribe-events', object.unscribeEvents);
    object.subscribe('add-event', this.addDelegateEvents);
    object.subscribe('activate-event', this.activate);
  }

  unwatch() {
    // this.publish('remove-listeners');
    // this.clear('remove-listeners');
  }

  activate(object, name) {
    if (!this.scheduleMap.has(object)) {
      return;
    }

    const set = this.scheduleMap.get(object);

    for (const listener of set) {
      const { name: eventName, parent } = listener;

      if (name === eventName && object === parent) {
        listener.activated = true;
        break;
      }
    }
  }

  clearMap() {
    this.listenerMap.clear();
    this.scheduleMap.clear();
  }

  dispose() {
    this.publish('unscribe-events');
    this.clearMap();
  }

  dispatch(object, name, ...props) {
    if (!this.listenerMap.has(object)) {
      return;
    }

    const set = this.listenerMap.get(object);
    let listener = null;

    for (const eventListener of set) {
      const { name: eventName } = eventListener;

      if (name === eventName) {
        listener = eventListener;
        break;
      }
    }

    if (listener == null) {
      return;
    }

    const { type, parent, condition, params, handler } = listener;

    if (condition != null && typeof condition.guard === 'function') {
      if (!condition.guard()) {
        return;
      }
    }

    const event = {
      name,
      type,
      parent,
      params,
      props,
    };
    handler(event);
  }

  update(deltaTime, elapsedTime) {
    for (const [object, set] of this.scheduleMap) {
      for (const listener of set) {
        const { activated } = listener;

        if (activated) {
          const { name, type, parent, condition, params, handler } = listener;
          const { delay } = condition;
          const event = { name, type, parent, params };
          condition.elapsedTime += deltaTime;

          if (condition.guard(delay)) {
            handler(event);
            condition.elapsedTime = 0;

            if (type === 'timeout') {
              listener.activated = false;
              this.removeEvent(name);
            }
          }
        }
      }
    }
  }
}

export default EventManager;
