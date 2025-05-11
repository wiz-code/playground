class TupleKeyMap {
  constructor(data = null) {
    this.list = [];
    this.map = new Map();

    if (data != null) {
      for (let i = 0, l = data.length; i < l; i += 1) {
        const keyValue = data[i];
        this.setValue(...keyValue);
      }
    }
  }

  #findTupleKey(keys) {
    for (let i = 0, l = this.list.length; i < l; i += 1) {
      const tupleKey = this.list[i];

      if (keys.length === tupleKey.length) {
        let found = true;

        for (let j = 0, m = keys.length; j < m; j += 1) {
          if (keys[j] !== tupleKey[j]) {
            found = false;
            break;
          }
        }

        if (found) {
          return tupleKey;
        }
      }
    }

    return undefined;
  }

  hasValue(...args) {
    const keys = !Array.isArray(args[0]) ? args : args[0];
    const tupleKey = this.#findTupleKey(keys);

    if (tupleKey != null) {
      return true;
    }

    return false;
  }

  setValue(...args) {
    const value = args.pop();
    const keys = !Array.isArray(args[0]) ? args : args[0];
    let tupleKey = this.#findTupleKey(keys);

    if (tupleKey == null) {
      tupleKey = [...keys];
      this.list.push(tupleKey);
    }

    this.map.set(tupleKey, value);
  }

  getValue(...args) {
    const keys = !Array.isArray(args[0]) ? args : args[0];
    const tupleKey = this.#findTupleKey(keys);
    const value = this.map.get(tupleKey);

    return value;
  }

  deleteValue(...args) {
    const keys = !Array.isArray(args[0]) ? args : args[0];
    const tupleKey = this.#findTupleKey(keys);

    if (tupleKey != null) {
      this.map.delete(tupleKey);
    }
  }
}

export default TupleKeyMap;
