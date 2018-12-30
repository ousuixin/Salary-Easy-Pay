pragma solidity > 0.4.18 < 0.5.1;
contract SalaryEasyPay {
	address public employer;
	address public employee;
	
	uint private salary;
	uint private salaryDeposit;

	uint payPeriod;
	uint payday;

	bool private isDestroyed;

	modifier onlyEmployer () 
	{
		require(msg.sender == employer);
		_;
	}

	modifier onlyEmployee () 
	{
		require(msg.sender == employee);
		_;
	}	

	modifier onlyAfterWeek () // 一个周之后才能领工资
	{
		require(now > payday);
		_;
	}

	modifier notDestroyed () 
	{
		require(isDestroyed == false);
		_;
	}

	constructor (address _employee, uint _salary, uint _payPeriod) 
		public 
		payable
	{
		employer = msg.sender;
		employee = _employee;

		salary = _salary;
		// 这是一个策略问题，雇佣者需要提前存入一定的资金到合约中，他可以存两个week的工资，或者是三个week，
		// 如果他违约不给工资，那么预存的这几个week工资将转给员工，然后禁用合约，作为惩罚。
		// 下一次重新创建合约雇佣者又需要重新预存工资，所以这样保证雇主按时按量交付工资，否则将一直接受惩罚。
		
		// 同时如果公司开除员工的话可以不再向合约存钱，那么合约将自动禁用，非常方便
		// （当然开除员工有必要付给员工一定工资，以便员工能够在重新找到工作之前保证自身生存,这是非常人性化的）。
		require(msg.value >= 3*_salary); // 数字3可以根据策略进行更改
		salaryDeposit = msg.value;

		payPeriod = _payPeriod;
		payday = now + _payPeriod*1 minutes; // 一个周之后才能领工资

		isDestroyed = false;
	}

	function paySalary()
		public
		payable
		onlyEmployer()
		notDestroyed()
	{
		salaryDeposit = salaryDeposit + msg.value;
	}

	function getSalary () 
		public
		onlyEmployee()
		onlyAfterWeek()
		notDestroyed()
	{
	    uint amount;
	    
		if (salaryDeposit >= 3*salary) {
			amount = salary;

			payday = payday + payPeriod*1 minutes; // 一个周之后才能领工资
			
			salaryDeposit = salaryDeposit - salary;
		} else { 
			// 禁用合约，作为惩罚,预存的这几个week工资将转给员工
			isDestroyed = true;

			amount = salaryDeposit;

			salaryDeposit = 0;
		}
		msg.sender.transfer(amount);
	}

	function salaryShouldPay ()
		public view
		onlyEmployer()
		notDestroyed()
		returns (uint amount)
	{
		if (now > payday) {
		    if ((uint((now - payday) / (payPeriod*1 minutes)) + 4) * salary > salaryDeposit) {
		        amount = (uint((now - payday) / (payPeriod*1 minutes)) + 4) * salary - salaryDeposit;
		    } else {
		        amount = 0;
		    }
		} else {
		    if (3 * salary > salaryDeposit) {
                amount = 3 * salary - salaryDeposit;
		    } else {
		        amount = 0;
		    }
		}
	}

	function showDeposit ()
		public view
		onlyEmployee()
		notDestroyed()
		returns (uint amount)
	{
		amount = salaryDeposit;
	}

	function showSalary ()
		public view
		notDestroyed()
		returns (uint amount)
	{
		amount = salary;
	}

	function showPayPeriod ()
		public view
		notDestroyed()
		returns (uint amount)
	{
		amount = payPeriod;
	}
}