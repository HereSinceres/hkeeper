
var logger = function ({ state, dispatch }) {
    return function (originDispatch) {
        return function (...args) {
            console.log('mutation:', args[0], 'before', new Date(), state);
            var r = originDispatch(...args);
            console.log('mutation:', args[0], 'after', new Date(), state);
            return r
        }
    }
}
var defaultOption = {
    state: {},
    actions: {},
    mutations: {},
    getters: {},
    isDebug: false
};
function createAction(action, store) {
    if (typeof action === 'function') {
        return (...payload) => action(store, ...payload)
    }
}
export default
    class hKeeper {
    constructor(options = {}) {
        // bind dispatch to self
        options = Object.assign({}, defaultOption, options);
        this._vm = {
            _data: options.state,
        }
        this.listeners = [];
        const dispatch = this.dispatch;
        this.dispatch = (...args) => {
            dispatch.apply(this, args);
        };
        this.name = options.name;
        this.actions = Object.create(null);
        this.getters = Object.create(null);
        this._setupMutations(options.mutations);
        this._setupActions(options.actions);
        this._setupGetters(options.getters);
        if (options.isDebug) {
            this.applyMiddleware(logger);
        }
    }
    get state() {
        return this._vm._data
    }

    set state(v) {
        throw new Error('[hKeeper] hKeeper root state is read only.')
    }
    dispatch(type, ...payload) {
        const mutation = this._mutations[type]
        const state = this.state
        if (mutation) {
            mutation(state, ...payload)
        }
        this.listeners.forEach(listener => listener(this.state))
    }
    // 设置监听Mutations
    _setupMutations(mutations) {
        this._mutations = mutations;
    }
    // 设置action
    _setupActions(actions) {
        this._actions = Object.create(null)
        Object.keys(actions).forEach(name => {
            this._actions[name] = createAction(actions[name], this)
            if (!this.actions[name]) {
                this.actions[name] = (...args) => this._actions[name](...args)
            }
        })
    }
    _setupGetters(getters) {
        this._getters = Object.create(null)
        Object.keys(getters).forEach(name => {
            this._getters[name] = (...payload) => getters[name](this.state, ...payload)
            if (!this.getters[name]) {
                this.getters[name] = (...args) => this._getters[name](...args)
            }
        })
    }
    watch(listener) {
        listener(this.state);
        this.listeners.push(listener)
    }
    applyMiddleware(...args) {
        const enArr = args.map(middleware => middleware({
            state: this.state,
            dispatch: this.dispatch
        }))
        let originDispatch = this.dispatch
        enArr.forEach(en => {
            originDispatch = en(originDispatch)
        })
        this.dispatch = originDispatch
    }
}