
import hKeeper from '../../index.js';

var countStore = {
    state: {
        count: 1
    },
    actions: {
        add: function (store, ...payload) {
            setTimeout(() => {
                store.dispatch('increment', payload);
            }, Math.random() * 1000 + 3000);
        }
    },
    mutations: {
        increment: function (state, ...payload) {
            var addCount = payload[0] ? parseInt(payload[0]) : 1;
            state.count += addCount;
        },

        decrement: function (state, ...payload) {
            state.count -= 1;
        }
    },
    getters: {
        getCount: function (state, ...payload) {
            return state.count + 10;
        }
    }
};
var countStoreStore = new hKeeper(countStore);


new Vue({
    el: '#app',
    data: function () {
        return {
            count: null,
            computedCount: null
        }
    },
    mounted: function () {
        countStoreStore.watch((state) => {
            this.count = state.count;
            this.computedCount = countStoreStore.getters.getCount();
        })

    },
    computed: {

    },
    methods: {
        increment() {
            countStoreStore.dispatch('increment')
        },
        decrement() {
            countStoreStore.dispatch('decrement')
        },
        incrementAction() {
            countStoreStore.actions.add(Math.random() * 10);
        }
    }
})