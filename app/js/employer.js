// var web3 = require('web3');
// var contract = require('truffle-contract');
// var salary_easy_pay_artifacts = require('../../build/contracts/SalaryEasyPay.json');
import "../css/employer.css";
import "../img/home.png";
var Vue = require("./vue.js");
var Web3 = require("web3");
import { default as contract } from 'truffle-contract';
import salary_easy_pay_artifacts from '../../build/contracts/SalaryEasyPay.json';


var index = 0;
var contracts = new Array();
var salary_easy_pay = contract(salary_easy_pay_artifacts);


var vm = new Vue({
    el: '#index_page',

    data: {
        employer: {
            address: 0x00,
            password: '',
            balance: 'unknown'
        },
        new_employee: {
            address: 0x00,
            salary: 0,
            pay_period: 0,
            salary_stored: 0,
            contract_address: 0x00
        },
        employees: []
    },

    methods:{
        check_balance: function() {
            try {
                var that = this;
                web3.eth.getBalance(this.employer.address, function(err, balance) {
                    that.employer.balance = balance.toString();
                });
            } catch (e) {
                this.employer.balance = e.toString();
            }
        },

        add_contract: function() {
            try {
                if (!web3.personal.unlockAccount(this.employer.address, this.employer.password)) {
                    throw('your address or password not correct');
                }
                var that = this;
                var contract;
                var new_contract = {address:this.new_employee.contract_address};
                salary_easy_pay.at(this.new_employee.contract_address).then(function(instance) {
                    contract = instance;
                    return contract;
                }).then(function() {
                    try {
                        return contract.employer.call({from:that.employer.address, gas:3000000});
                    } catch(e) {
                        throw('get contract employer failed, maybe there is no more balance in your account.');
                    }
                }).then(function(employer) {
                    new_contract.employer = employer;
                    return;
                }).then(function() {
                    try {
                        return contract.employee.call({from:that.employer.address, gas:3000000});
                    } catch(e) {
                        throw('get contract employee failed, maybe there is no more balance in your account.');
                    }
                }).then(function(employee) {
                    new_contract.employee = employee;
                    return;
                }).then(function() {
                    try {
                        return contract.showSalary({from:that.employer.address, gas:3000000});
                    } catch(e) {
                        throw('get salary failed, maybe there is no more balance in your account.');
                    }
                }).then(function(salary) {
                    new_contract.salary = salary;
                    return;
                }).then(function() {
                    try {
                        return contract.showPayPeriod({from:that.employer.address, gas:3000000});
                    } catch(e) {
                        throw('get pay period failed, maybe there is no more balance in your account.');
                    }
                }).then(function(pay_period) {
                    new_contract.pay_period = pay_period;
                    return;
                }).then(function() {
                    contracts.push(new_contract);
                    localStorage.setItem(new_contract.address, JSON.stringify(new_contract));
                    var temp_info = new Object();
                    temp_info.employer_address = new_contract.employer;
                    temp_info.contract_address = new_contract.address;
                    temp_info.address = new_contract.employee;
                    temp_info.salary = new_contract.salary;
                    temp_info.pay_period = new_contract.pay_period;
                    temp_info.salary_unpay = '0';
                    temp_info.state = false;
                    temp_info.salary_to_pay = 0;
                    that.employees.push(temp_info);
                    return;
                });
            } catch(e) {
                alert(e.toString());
            }
        },

        create_contract: function() {
            try {
                if (!web3.personal.unlockAccount(this.employer.address, this.employer.password)) {
                    throw('address or password not correct');
                }
                if (this.new_employee.salary <= 0 || this.new_employee.salary%1 !== 0) {
                    throw('salary should be int type and more than 0');
                }
                if (this.new_employee.pay_period <= 0 || this.new_employee.pay_period%1 !== 0) {
                    throw('pay period should be int type and more than 0');
                }
                if (this.new_employee.salary_stored <= 0 || this.new_employee.salary_stored%1 !== 0) {
                    throw('salary stored should be int type and more than 0');
                }
                var that = this;
                var new_contract = {};
                salary_easy_pay.new(this.new_employee.address, this.new_employee.salary, 
                    this.new_employee.pay_period, {from:this.employer.address, gas: 3000000, value: this.new_employee.salary_stored}).then(function (instance) {
                    new_contract.address = instance.address;
                    new_contract.employer = that.employer.address;
                    new_contract.employee = that.new_employee.address;
                    new_contract.salary = that.new_employee.salary;
                    new_contract.pay_period = that.new_employee.pay_period;
                    return new_contract;
                }).then(function (new_contract) {
                    contracts.push(new_contract);
                    localStorage.setItem(new_contract.address, JSON.stringify(new_contract));
                    var temp_info = new Object();
                    temp_info.employer_address = new_contract.employer;
                    temp_info.contract_address = new_contract.address;
                    temp_info.address = new_contract.employee;
                    temp_info.salary = new_contract.salary;
                    temp_info.pay_period = new_contract.pay_period;
                    temp_info.salary_unpay = '0';
                    temp_info.state = false;
                    temp_info.salary_to_pay = 0;
                    that.employees.push(temp_info);
                    return;
                }, function(err) {
                    alert('maybe salary stored is not 3 times than salary, or balance in your account is not enough, more detail:\n' + err.toString());
                }).then(function() {
                    web3.eth.getBalance(that.employer.address, function(err, balance) {
                        that.employer.balance = balance.toString();
                    });
                    return;
                });
            } catch(e) {
                alert(e.toString());
            }
        },

        pay_salary: function() {
            try {
                if (index != 0) {
                    throw('there some operation during pending, you should wait for them.');
                }

                var lastTransaction = -1;
                for (var i = 0; i < this.employees.length; i++) {
                    if (this.employees[i].state) {
                        lastTransaction = i;
                    }
                }
                if (lastTransaction == -1) return;

                for (var iter = 0; iter < this.employees.length; iter++) {
                    var employee = this.employees[iter];
                    index = index + 1;
                    if (!employee.state) {
                        continue;
                    }
                    if (employee.salary_to_pay <= 0 || employee.salary_to_pay%1 !== 0) {
                        throw('you can only input integer salary more than 0!');
                    }
                    if (!web3.personal.unlockAccount(this.employer.address, this.employer.password)) {
                        throw('your address or password not correct');
                    }
                    if (contracts[index-1].employer != this.employer.address) {
                        throw('this account is not the employer of ' + contracts[index-1].employee 
                            + ', you should use address ' + contracts[index-1].employer + ' as employer.');
                    }

                    // we must use async, otherwise the 'i' and employee will be wrong 
                    var that = this;
                    (function(temp_employee, i){
                        salary_easy_pay.at(contracts[i-1].address).then(function(instance) {
                            var contract = instance;
                            return contract;
                        }).then(function(contract) {
                            try {
                                contract.paySalary({from:that.employer.address, gas: 3000000, value:temp_employee.salary_to_pay});
                            } catch(e) {
                                throw('the pay operation to ' + contracts[i-1].employee + ' was rejected.');
                            }
                            return contract;
                        }).then(function(contract) {
                            try {
                                return contract.salaryShouldPay({from:that.employer.address, gas:3000000});
                            } catch(e) {
                                throw('the show salary unpay operation to ' + contracts[i-1].employee + ' was rejected.');
                            }
                        }).then(function(salary_unpay) {
                            temp_employee.salary_unpay = salary_unpay.toString();
                            return;
                        }).then(function() {
                            web3.eth.getBalance(that.employer.address, function(err, balance) {
                                that.employer.balance = balance.toString();
                            });
                            return;
                        }).then(function() {
                            if (i-1 == lastTransaction) {
                                index = 0;
                            }
                            return;
                        });
                    })(employee, index)
                }
            } catch(e) {
                alert(e.toString());
                index = 0;
            }
        },

        delete_contract: function() {
            var i = 0;
            while(i < this.employees.length) {
                if (this.employees[i].state) {
                    this.employees.splice(i, 1);
                    localStorage.removeItem(contracts[i].address);
                    contracts.splice(i, 1);
                } else {
                    i = i + 1;
                }
            }
        },

        update_state: function (employee) {
            employee.state = !employee.state;
        },

        show_salary_unpay: function () {
            try {
                for (var i = 0; i < this.employees.length; i++) {
                    if (!this.employees[i].state) {
                        continue;
                    }
                    if (!web3.personal.unlockAccount(this.employer.address, this.employer.password)) {
                        throw('your address or password not correct');
                    }
                    if (contracts[i].employer != this.employer.address) {
                        throw('this account is not the employer of ' + contracts[i].employee 
                            + ', you should use address ' + contracts[i].employer + ' as employer.');
                    }
                    (function(employee, i, that) {
                        salary_easy_pay.at(contracts[i].address).then(function(instance) {
                            var contract = instance;
                            return contract;
                        }).then(function(contract) {
                            try {
                                return contract.salaryShouldPay({from:that.employer.address, gas:3000000});
                            } catch(e) {
                                throw('the show salary unpay operation to ' + contracts[i].employee + ' was rejected.');
                            }
                        }).then(function(salary_unpay) {
                            employee.salary_unpay = salary_unpay.toString();
                        });
                    })(this.employees[i], i, this)
                }
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

    // localStorage.clear(); // used for debug
    for(var i = 0; i < localStorage.length; i++) {
        var temp_address = localStorage.key(i);
        if (temp_address[0] !== '0' || temp_address[1] !== 'x') {
            continue;
        }
        var temp_info = JSON.parse(localStorage.getItem(temp_address));
        contracts.push({
            address: temp_address,
            employer: temp_info.employer,
            employee: temp_info.employee,
            salary: temp_info.salary,
            pay_period: temp_info.pay_period
        });
        vm.employees.push({
            employer_address: contracts[i].employer,
            contract_address: contracts[i].address,
            address: contracts[i].employee,
            salary: contracts[i].salary,
            pay_period: contracts[i].pay_period,
            salary_unpay: 'unknown',
            state: false,
            salary_to_pay: 0
        });
    }
});

