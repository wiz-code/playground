import { Vector3, Spherical, Group } from 'three';

import Publisher from '../publisher';
import { Handlers } from './data/methods';
import { genId } from './utils';

const handlerMap = new Map(Handlers);

const NoopCondition = {
  guard() {
    return true;
  },
};
const TimerCondition = {
  elapsedTime: 0,
  guard(delay) {
    return this.elapsedTime > delay;
  },
};

class EventDispatcher extends Publisher {
  // 条件処理はconditionに設定、paramsはイベント発生時に渡されるデータとする
  // name, type, parent, condition, params, handler
  static createListener(parent, data) {
    const { name, type, params, handler: handlerName } = data;
    let { condition = null } = data;
    condition = condition ?? NoopCondition;

    if (type === 'timeout' || type === 'interval') {
      const dest = Object.create(TimerCondition);
      condition = Object.assign(dest, condition);
    }

    const activated = type !== 'timeout' && type !== 'interval';
    const listener = {
      name,
      type,
      activated,
      parent,
      condition,
      params,
      handler: handlerMap.get(handlerName),
    };

    return listener;
  }

  // type: immediate, timeout, interval
  constructor() {
    super();

    this.listenerMap = new Map();
    this.scheduleMap = new Map();

    this.unscribeEvents = this.unscribeEvents.bind(this);
  }

  addEvent(data) {
    const { delegate = true } = data;
    const listener = EventDispatcher.createListener(this, data);
    /* const {
      name,
      type,
      params,
      delegate = true,
      handler: handlerName,
    } = data;
    let { condition = null } = data;

    if (type === 'timeout' || type === 'interval') {
      const target = Object.create(TimerCondition);
      condition = Object.assign(target, condition);
    }

    const activated = type !== 'timeout' && type !== 'interval';
    const listener = {
      name,
      type,
      activated,
      parent: this,
      condition,
      params,
      handler: handlerMap.get(handlerName),
    }; */

    const { name, type } = listener;

    if (delegate) {
      this.publish('add-event', listener);
    } else if (type === 'timeout' || type === 'interval') {
      this.scheduleMap.set(name, listener);
    } else {
      this.listenerMap.set(name, listener);
    }
  }

  /* addEvent(props) {
    const event = EventDispatcher.createEvent(this, props);

    if (event.delegate) {
      this.publish('add-event', event);
    } else {
      this.events.set(event.name, event);
    }
  } */

  addEvents(data) {
    const propList = Array.isArray(data) ? data : [data];

    for (let i = 0, l = propList.length; i < l; i += 1) {
      const props = propList[i];
      this.addEvent(props);
    }
  }

  removeEvent(name) {
    if (this.listenerMap.has(name)) {
      this.listenerMap.delete(name);
    } else if (this.scheduleMap.has(name)) {
      this.scheduleMap.delete(name);
    }
  }

  activate(name) {
    if (this.scheduleMap.has(name)) {
      const listener = this.scheduleMap.get(name);
      listener.activated = true;
    } else {
      this.publish('activate-event', this, name);
    }
  }

  dispatch(name, ...props) {
    if (!this.listenerMap.has(name)) {
      return;
    }

    const { type, parent, condition, params, handler } =
      this.listenerMap.get(name);

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

  unscribeEvents() {
    this.clear('add-event');
    this.clear('activate-event');
  }

  dispose() {
    //
  }

  update(deltaTime, elapsedTime) {
    for (const listener of this.scheduleMap.values()) {
      const { activated } = listener;

      if (activated) {
        const { name, type, parent, condition, params, handler } = listener;
        const { delay } = condition;
        condition.elapsedTime += deltaTime;

        const event = { name, type, parent, params };

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

export default EventDispatcher;
