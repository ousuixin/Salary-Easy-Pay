import "../css/employee.css";
import "../img/home.png";
var Vue = require("./vue.js");
var Web3 = require("web3");
import { default as contract } from 'truffle-contract';
import salary_easy_pay_artifacts from '../../build/contracts/SalaryEasyPay.json'

var salary_easy_pay = contract(salary_easy_pay_artifacts);

var vm = new Vue({
    el: '#index_page',

    data: {
        employee: {
            address: 0x00,
            password: '',
            balance: 'unknown'
        },
        contract: {
            address: 0x00,
            salary: 0,
            pay_period: 0,
            deposit: 0
        },
    },

    methods:{
        check_balance: function() {
            try {
                var that = this;
                web3.eth.getBalance(this.employee.address, function(err, balance) {
                    that.employee.balance = balance.toString();
                });
            } catch (e) {
                this.employee.balance = e.toString();
            }
        },

        get_salary: function() {
            try {
                if (!web3.personal.unlockAccount(this.employee.address, this.employee.password)) {
                    throw('your address or password not correct');
                }
                var that = this;
                salary_easy_pay.at(that.contract.address).then(function(instance) {
                    var contract = instance;
                    return contract;
                }).then(function(contract) {
                    try {
                        contract.getSalary({from:that.employee.address, gas:3000000});
                    } catch(e) {
                        throw('It is not the time to get salary, you should wait for payday!');
                    }
                    return;
                }).then(function() {
                    setTimeout(function(that){web3.eth.getBalance(that.employee.address, function(err, balance) {that.employee.balance = balance.toString();});}, 100, that);
                });
            } catch(e) {
                alert(e.toString());
            }
        },

        check_message: function() {
            try {
                if (!web3.personal.unlockAccount(this.employee.address, this.employee.password)) {
                    throw('your address or password not correct');
                }
                var that = this;
                var contract;
                salary_easy_pay.at(that.contract.address).then(function(instance) {
                    contract = instance;
                    return contract;
                }).then(function() {
                    try {
                        return contract.showDeposit({from:that.employee.address, gas:3000000});
                    } catch(e) {
                        throw('Show deposit failed, maybe there is no more balance in your account.');
                    }
                }).then(function(deposit) {
                    that.contract.deposit = deposit;
                    return;
                }).then(function() {
                    try {
                        return contract.showSalary({from:that.employee.address, gas:3000000});
                    } catch(e) {
                        throw('Show salary failed, maybe there is no more balance in your account.');
                    }
                }).then(function(salary) {
                    that.contract.salary = salary;
                    return;
                }).then(function() {
                    try {
                        return contract.showPayPeriod({from:that.employee.address, gas:3000000});
                    } catch(e) {
                        throw('Show pay period failed, maybe there is no more balance in your account.');
                    }
                }).then(function(pay_period) {
                    that.contract.pay_period = pay_period;
                    return;
                });
            } catch(e) {
                alert(e.toString());
            }
        }
    }
});


window.addEventListener('load', function() {
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    salary_easy_pay.setProvider(web3.currentProvider);
});

