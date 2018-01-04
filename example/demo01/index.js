
import hKeeper from '../../index.js';
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
var account = {
    name: 'ACCOUNT',
    state: {
        count: 1
    },
    actions: {
        add: function (store, ...payload) {
            // console.log(store.state);
            // console.log(store.dispatch);
            // console.log(...payload);
            store.dispatch('add', ...payload);
        }
    },
    mutations: {
        add: function (state, ...payload) {
            // console.log(state, ...payload);
            state.count += 1;
        }
    },
    getters: {
        getCount: function (state, ...payload) {
            return state.count;
        }
    }
};
 accountStore = new hKeeper(account);
// accountStore.applyMiddleware(logger, logger);
// accountStore.dispatch('add', { name: 1 }, { age: 1 });
// accountStore.actions.add({ name: 2 }, { age: 2 });
// accountStore.getters.getCount({ name: 3 }, { age: 3 });
accountStore.watch(function (store) {
    console.log(store);
})