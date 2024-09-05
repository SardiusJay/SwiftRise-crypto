import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

const WithdrawModal = (props) => {
	return (
		<div>
			<Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
				<Modal.Header closeButton />
				<Modal.Body className="text-center">
					<p>Withdraw Funds</p>
					<div className="mt-4">
						<input
							type="text"
							placeholder="ENTER WITHDRAW AMOUNT"
							className="col col-7 fw-bolder text-white withdraw-input"
						/>
					</div>
					<div className="mt-4">
						<div>
							<select name="" id="" className="btn2 col col-7 fw-bolder text-white">
								<option className="fw-bolder" value="BTCB ">
									BTCB - $0.0000
								</option>
								<option className="fw-bolder" value="Bitcoin ">
									Bitcoin - $0.0200
								</option>
								<option className="fw-bolder" value="Litecoin">
									Litecoin - $0.0200
								</option>
								<option className="fw-bolder" value="Ethereum ">
									Ethereum - $0.0000
								</option>
								<option className="fw-bolder" value="Litecoin">
									Litecoin - $0.0000
								</option>
								<option className="fw-bolder" value="Dodgecoin">
									Dodgecoin - $0.0000
								</option>
								<option className="fw-bolder" value="Tron">
									Tron - $0.0000
								</option>
								<option className="fw-bolder" value="Tether TRC20">
									Tether TRC20 - $0.0000
								</option>
								<option className="fw-bolder" value="BNB">
									BNB - $0.0000
								</option>
								<option className="fw-bolder" value="Tether BEP20">
									Tether BEP20  - $0.0000
								</option>
								<option className="fw-bolder" value="Bitcoin Cash">
									Bitcoin Cash - $0.0000
								</option>
							</select>
						</div>
					</div>
					<div className="mt-4">
						<button className="btn2 col col-7 fw-bolder text-white" onClick={() => {}}>
							WITHDRAW
						</button>
					</div>
				</Modal.Body>
			</Modal>
		</div>
	);
};

export default WithdrawModal;
