import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import '../DashBoard.css'

const PurchaseModal = (props) => {
	return (
		<div>
			<Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
				<div style={{backgroundColor: 'white'}}>
					<Modal.Header closeButton />
					<h1 className="text-center">Purchase Details</h1>
					<Card className="m-auto bg-primary p-3 text-center col-7">
						<Card.Body>
							<Modal.Body>
								<p className="fw-bolder text-white mt-4">Purchase Amount: 10 USD</p>
								<p className="fw-bolder text-white">Cloud Mining Machine:</p>
								{/* <p className="fw-bolder text-white">10 Days (Normal)</p> */}
								<p className="text-white">1000 GH/s</p>
							</Modal.Body>
						</Card.Body>
					</Card>
					<div className="text-center mt-3 mb-3">
						<button className="btn2 col col-7 fw-bolder text-white" onClick={() => {}}>
							Click Confirm & Purchase
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default PurchaseModal;
