
import hKeeper from '../../index.js';

/**
 * Mocking client-server processing
 */
const _products = [
    { "id": 1, "title": "iPad 4 Mini", "price": 500.01, "inventory": 2 },
    { "id": 2, "title": "H&M T-Shirt White", "price": 10.99, "inventory": 10 },
    { "id": 3, "title": "Charli XCX - Sucker CD", "price": 19.99, "inventory": 5 }
]

var shopApi = {
    getProducts(cb) {
        setTimeout(() => cb(_products), 100)
    },
    buyProducts(products, cb, errorCb) {
        setTimeout(() => {
            // simulate random checkout failure.
            (Math.random() > 0.5 || navigator.userAgent.indexOf('PhantomJS') > -1)
                ? cb()
                : errorCb()
        }, 100)
    }
}
var productStore = {
    state: {
        all: []
    },
    getters: {
    },
    actions: {
        getProducts: function (store, ...payload) {
            shopApi.getProducts(products => {
                store.dispatch('RECEIVE_PRODUCTS', { products })
            })
        },
        addToCart: function (store, product) {
            if (product.inventory > 0) {
                store.dispatch('ADD_TO_CART', {
                    id: product.id
                })
                cartStoreService.dispatch('ADD_TO_CART', {
                    id: product.id
                })
            }
        }
    },
    mutations: {
        'RECEIVE_PRODUCTS': function (state, { products }) {
            state.all = products;
        },
        'ADD_TO_CART': function (state, { id }) {
            state.all.find(p => p.id === id).inventory--
        }
    }
}
var productStoreService = new hKeeper(productStore);
var cartStore = {
    state: {
        added: [],
        checkoutStatus: null
    },
    getters: {
        cartProducts(state, getters) {
            return state.added.map(({ id, quantity }) => {
                const product = productStoreService.state.all.find(p => p.id === id)
                return {
                    title: product.title,
                    price: product.price,
                    quantity
                }
            })
        }
    },
    actions: {
        checkout({ dispatch, state }, products) {
            const savedCartItems = [...state.added]
            dispatch('CHECKOUT_REQUEST')
            shopApi.buyProducts(
                products,
                () => dispatch('CHECKOUT_SUCCESS'),
                () => dispatch('CHECKOUT_FAILURE', { savedCartItems })
            )
        }
    },
    mutations: {
        'ADD_TO_CART': function (state, { id }) {
            state.checkoutStatus = null
            const record = state.added.find(p => p.id === id)
            if (!record) {
                state.added.push({
                    id,
                    quantity: 1
                })
            } else {
                record.quantity++
            }
        },

        'CHECKOUT_REQUEST': function (state) {
            state.added = []
            state.checkoutStatus = null
        },

        'CHECKOUT_SUCCESS': function (state) {
            state.checkoutStatus = 'successful'
        },

        'CHECKOUT_FAILURE': function (state, { savedCartItems }) {
            state.added = savedCartItems
            state.checkoutStatus = 'failed'
        }
    }
}
var cartStoreService = new hKeeper(cartStore);



new Vue({
    el: '#app',
    data: function () {
        return {
            proList: null,
            cartProducts: null,
            checkoutStatus: null,
            total: 0
        }
    },
    mounted: function () {
        productStoreService.actions.getProducts();
        productStoreService.watch((state) => {
            this.proList = state.all;
        })
        console.log(cartStoreService);
        cartStoreService.watch((state) => {
            this.cartProducts = cartStoreService.getters.cartProducts();
            this.checkoutStatus = state.checkoutStatus;
            this.total = this.cartProducts.reduce((total, p) => {
                return total + p.price * p.quantity;
            }, 0);
            console.log(this.total);
        })
    },
    computed: {

    },
    methods: {
        addToCart: function (item) {
            productStoreService.actions.addToCart(item)
        },
        checkout: function () {
            cartStoreService.actions.checkout();
        }
    }
})