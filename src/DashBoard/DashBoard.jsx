import { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import CardGroup from 'react-bootstrap/CardGroup';
import './DashBoard.css';
import Card from 'react-bootstrap/Card';
import PurchaseModal from './Modals/PurchaseModal';
import WithdrawModal from './Modals/WithdrawModal';
// import { BsCurrencyBitcoin } from 'react-icons/bs';
import { LiaEthereum } from 'react-icons/lia';
import { FiLogOut } from 'react-icons/fi';
import { SiEthereum, SiDogecoin, SiBitcoin, SiBitcoincash } from 'react-icons/si';
import { Link } from 'react-router-dom';

const DashBoard = () => {
	const [ purchaseModal, setPurchaseModal ] = useState(false);
	const [ withdrawModal, setWithdrawModal ] = useState(false);
	return (
		<Container className="p-" style={{ padding: '3rem 0 0 6rem' }}>
			<Row className="align-items-center">
				<Col>
					<div className="logoTexts">
						<p>SWIFTRISE</p>
						<p className="navLetterSpacing">MINING</p>
					</div>
				</Col>
				<Col className="ms-5">
					<div className=" d-flex align-items-center">
						<div>
							<span>Last access</span>
							<p>Aug-24-2023 03:27:55 PM</p>
						</div>
						<span className="divider d-none d-md-block" />

						<div>
							<span>Tayo</span>
							<p>My Profile</p>
						</div>
						<span className="divider d-none d-md-block" />
						<div>
							<FiLogOut className="h2" />
						</div>
					</div>
				</Col>
			</Row>
			<Row className="mt-5">
				<Col>
					<div className="me-5 d-flex align-items-center">
						<div>
							<Link className="fw-bolder">
								My Dashboard
							</Link>
						</div>
						<span className="dividers d-none d-md-block" />

						<div>
							<Link href="#" className="fw-bolder">
								Make Deposit
							</Link>
						</div>
						<span className="dividers d-none d-md-block" />
						<div>
							<Link href="#" className="fw-bolder">
								Withdraw
							</Link>
						</div>
						<span className="dividers d-none d-md-block" />
						<div>
							<Link href="#" className="fw-bolder">
								My Contracts
							</Link>
						</div>
						<span className="dividers d-none d-md-block" />
						<div>
							<Link to="/history" className="fw-bolder">
								History
							</Link>
						</div>
						<span className="dividers d-none d-md-block" />
						<div>
							<Link href="#" className="fw-bolder">
								Promote Banners
							</Link>
						</div>
						<span className="dividers d-none d-md-block" />
						<div>
							<Link href="#" className="fw-bolder">
								Affiliate
							</Link>
						</div>
						<span className="dividers d-none d-md-block" />
						<div>
							<Link href=".../../setting" className="fw-bolder">
								Security Settings
							</Link>
						</div>
						<span className="dividers d-none d-md-block" />
						<div>
							<Link href="#" className="fw-bolder">
								Edit Address{' '}
							</Link>
						</div>
					</div>
				</Col>
			</Row>
			<Row className="mt-4">
				<Col className="d-flex">
					<p className="fw-bold ">
						MACHINES STATUS
						..............................................................................................
					</p>
					<p className="ms-4 fw-bold">
						........................................................................................
						WITHDRAWAL STATUS{' '}
					</p>
				</Col>
			</Row>
			<Row className="align-items-center justify-content-center">
				<Col>
					<CardGroup>
						<Card className="me-4 p-2 text-center dashboard-card rounded">
							<Card.Body>
								<h5 className="fw-bolder">$1.0000</h5>
								<p className=" fw-bolder">CURRENTLY ACTIVE</p>
							</Card.Body>
						</Card>
						<Card className="me-4 text-center dashboard-card rounded">
							<Card.Body>
								<h5 className="fw-bolder">$1.0000</h5>
								<p className=" fw-bolder">RECENTLY PURCHASED</p>
							</Card.Body>
						</Card>
						<Card className="me-4 text-center dashboard-big-card rounded">
							<Card.Body>
								<h5 className="fw-bolder">100 GH/S</h5>
								<p className=" fw-bolder">TOTAL PURCHASED POWERS</p>
							</Card.Body>
						</Card>
						<Card className="me-4 text-center dashboard-big-card rounded">
							<Card.Body>
								<h5 className="fw-bolder">$0.0000</h5>
								<p className=" fw-bolder">TOTAL WITHDRAW</p>
							</Card.Body>
						</Card>
						<Card className="me-4 text-center dashboard-card rounded">
							<Card.Body>
								<h5 className="fw-bolder">$0.0000</h5>
								<p className=" fw-bolder">PENDING WITHDRAW</p>
							</Card.Body>
						</Card>
						<Card className="me-4 text-center dashboard-card rounded">
							<Card.Body>
								<h5 className="fw-bolder">$0.00</h5>
								<p className=" fw-bolder">LAST WITHDRAW</p>
							</Card.Body>
						</Card>
					</CardGroup>
				</Col>
			</Row>
			<Row className="bg-light align-items-center justify-content-center mt-5 p-5">
				<Col className="d-md-flex">
					<span className="dividers-icon d-none d-md-block" />
					<div className="me-5">
						<h1>$0.03</h1>
						<h4>TOTAL BALANCE</h4>
					</div>
					<div className=" text-center ms-auto">
						{/* <BsCurrencyBitcoin className="dashboard-icon" /> */}
						<SiDogecoin className="dashboard-icon" />
						<div className="mt-4 text-primary">
							<p className="fw-bold">Tron</p>
							<p className="fw-bold">$0.01</p>
						</div>
					</div>
					<div className=" text-center ms-auto">
						{/* <SiLitecoin className="dashboard-icon" /> */}
						<SiDogecoin className="dashboard-icon" />
						<div className="mt-4 text-primary">
							<p className="fw-bold">Dodge</p>
							<p className="fw-bold">$0.02</p>
						</div>
					</div>
					<div className=" text-center ms-auto">
						<SiEthereum className="dashboard-icon" />
						<div className="mt-4 text-primary">
							<p className="fw-bold">ETHEREUM</p>
							<p className="fw-bold">$0.00</p>
						</div>
					</div>
					<div className=" text-center ms-auto">
						<SiDogecoin className="dashboard-icon" />
						<div className="mt-4 text-primary">
							<p className="fw-bold">USDT</p>
							<p className="fw-bold">$0.00</p>
						</div>
					</div>
					<div className=" text-center ms-auto">
						<SiDogecoin className="dashboard-icon" />
						<div className="mt-4 text-primary">
							<p className="fw-bold">BUSD</p>
							<p className="fw-bold">$0.00</p>
						</div>
					</div>
				</Col>
			</Row>
			<Row className="bg-light align-items-center justify-content-cente p-5">
				<Col className="d-md-flex">
					<span className="dividers-icon d-none d-md-block" />
					<div className="me-5">
						<h1>$0.0116</h1>
						<h4>All Mined Investment</h4>
					</div>
					<div className=" text-center ms-auto">
						<SiDogecoin className="dashboard-icon" />
						<div className=" text-primary">
							<p className="fw-bold">BTC</p>
							<p className="fw-bold">$0.00</p>
						</div>
					</div>
					<div className=" text-center ms-auto">
						<SiDogecoin className="dashboard-icon" />
						<div className=" text-primary">
							<p className="fw-bold">ETH</p>
							<p className="fw-bold">$0.00</p>
						</div>
					</div>
					<div className=" text-center ms-auto">
						<LiaEthereum className="dashboard-icon" />
						<div className=" text-primary">
							<p className="fw-bold">BNB</p>
							<p className="fw-bold">$0.00</p>
						</div>
					</div>
					<div className=" text-center ms-auto">
						<SiBitcoin className="dashboard-icon" />
						<div className=" text-primary">
							<p className="fw-bold">USD COIN</p>
							<p className="fw-bold">$0.00</p>
						</div>
					</div>
					<div className=" text-center ms-auto">
						<SiBitcoincash className="dashboard-icon" />
						<div className=" text-primary">
							<p className="fw-bold">STELLAR</p>
							<p className="fw-bold">$0.00</p>
						</div>
					</div>
				</Col>
			</Row>
			{/* <Row className="align-items-center justify-content-center mt-5">
				<Col>
					<h5 className="mt-4 fw-bold">
						<a href="#">
							<u> [Bonus]Bitcoin Mining:Preparing for the Upcoming Bull Run💥💥💥</u>
						</a>
					</h5>
					<h5 className="mt-4 fw-bold">
						<a href="#">
							<u> [Check Video]How to Purchase Your First Bitcoin Miner</u>
						</a>
					</h5>
					<h5 className="mt-4 fw-bold">PURCHASE NEW POWER</h5>
					<h5 className="mt-4 fw-bold">Referral Link: https://swiftrise.com/?ref=Chaos</h5>
				</Col>
			</Row> */}
			<Row className="align-items-center justify-content-center mt-5 bg-light dashboard-input p-5">
				<Col>
					<h5 className="mb-3">1 Enter the amount to purchase & Select the Crypto Method</h5>
					<div>
						<input type="text" placeholder="Purchase Amount" className="col col-md-9" />
						<select name="" id="" className="col col-2">
							<option value="Litecoin Direct">Litecoin Direct</option>
							<option value="BTCB Direct">BTCB Direct</option>
							<option value="Bitcoin Direct">Bitcoin Direct</option>
							<option value="Litecoin Direct">Litecoin Direct</option>
							<option value="Ethereum Direct">Ethereum Direct</option>
							<option value="Dodgecoin Direct">Dodgecoin Direct</option>
							<option value="Tron Direct">Tron Direct</option>
							<option value="Tether TRC20 Direct">Tether TRC20 Direct</option>
							<option value="BNB Direct">BNB Direct</option>
							<option value="Tether BEP20 Direct">Tether BEP20 Direct</option>
							<option value="Bitcoin Cash Direct">Bitcoin Cash Direct</option>
							<option value="Bitcoin My Wallet">Bitcoin My Wallet</option>
							<option value="Litecoin My Wallet">Litecoin My Wallet</option>
						</select>
					</div>
				</Col>
			</Row>
			<Row className="align-items-center justify-content-center  bg-light dashboard-input p-5">
				<div>
					<h5>2 Select a Mining Machine[No Withdraw Fee&Electricity Fee]</h5>
				</div>
				<Col className="text-center">
					<CardGroup className="mb-4">
						<Card className="me-4 ">
							<Card.Body>
								{/* <h1 className="mb-4">[NORMAL]</h1> */}
								<h4 className="mb-4 mt-5">$20 [22% interest after 2 months].</h4>
								<h4 className="mb-4">
									Total is 30 and withdraw is 25% of the total money every 2 - 2 weeks for 2 months.
								</h4>
							</Card.Body>
						</Card>
						<Card className="me-4">
							<Card.Body>
								{/* <h1 className="mb-4">[SILVER]</h1> */}
								<h4 className="mb-4 mt-5">$50 to $100 [22% interest after 2 months]. </h4>
								<h4 className="mb-4">
									Total is 30 and withdraw is 25% of the total money every 2 - 2 weeks for 2 months.
								</h4>
							</Card.Body>
						</Card>
						<Card className="me-4">
							<Card.Body>
								{/* <h1 className="mb-4">[VIKING]</h1> */}
								<h4 className="mb-4 mt-5">$300 to $1,500 [22% interest after 2 months] </h4>
								<h4 className="mb-4">
									Total is 30 and withdraw is 25% of the total money every 2 - 2 weeks for 2 months.
								</h4>
							</Card.Body>
						</Card>
						<Card className="me-4">
							<Card.Body>
								{/* <h1 className="mb-4">[SPARTAN]</h1> */}
								<h4 className="mb-4 mt-5">$2,000 to $3,500 [22% interest after 2 months]. </h4>
								<h4 className="mb-4">
									Total is 30 and withdraw is 25% of the total money every 2 - 2 weeks for 2 months.
								</h4>
							</Card.Body>
						</Card>
					</CardGroup>
					<CardGroup className="mb-4">
						<Card className="me-4 p-2">
							<Card.Body>
								{/* <h1 className="mb-4">[ATM]</h1> */}
								<h4 className="mb- mt-5">$4,000 to $5,500 [22% interest after 2 months]. </h4>
								<h4 className="mb-4">
									Total is 30 and withdraw is 25% of the total money every 2 - 2 weeks for 2 months.
								</h4>
							</Card.Body>
						</Card>
						<Card className="me-4">
							<Card.Body>
								{/* <h1 className="mb-4">[SwiftVIP1]</h1> */}
								<h4 className="mb-4 mt-5">$6,000 to $8,000 [22% interest after 2 months]. </h4>
								<h4 className="mb-4">
									Total is 30 and withdraw is 25% of the total money every 2 - 2 weeks for 2 months.
								</h4>
							</Card.Body>
						</Card>
						<Card className="me-4">
							<Card.Body>
								{/* <h1 className="mb-4">[SwiftVIP2]</h1> */}
								<h4 className="mb-4 mt-5">$8,500 to $10,000 [22% interest after 2 months]. </h4>
								<h4 className="mb-4">
									Total is 30 and withdraw is 25% of the total money every 2 - 2 weeks for 2 months.
								</h4>
							</Card.Body>
						</Card>

						<Card className="me-4">
							<Card.Body>
								{/* <h1 className="mb-4">[SwiftVIP2]</h1> */}
								<h4 className="mb-4 mt-5">$11,000 to $15,000 [22% interest after 2 months]. </h4>
								<h4 className="mb-4">
									Total is 30 and withdraw is 25% of the total money every 2 - 2 weeks for 2 months.
								</h4>
							</Card.Body>
						</Card>
					</CardGroup>
					<CardGroup>
						<Card className="me-4">
							<Card.Body>
								{/* <h1 className="mb-4">[SwiftVIP3]</h1> */}
								<h4 className="mb-4 mt-5">$16,000 to $20,000 [22% interest after 2 months]. </h4>
								<h4 className="mb-4">
									Total is 30 and withdraw is 25% of the total money every 2 - 2 weeks for 2 months.
								</h4>
							</Card.Body>
						</Card>
						<Card className="me-4">
							<Card.Body>
								{/* <h1 className="mb-4">[SwiftVIP3]</h1> */}
								<h4 className="mb-4 mt-5">$21,000 to $30,000 [22% interest after 2 months]. </h4>
								<h4 className="mb-4">
									Total is 30 and withdraw is 25% of the total money every 2 - 2 weeks for 2 months.
								</h4>
							</Card.Body>
						</Card>
						<Card className="me-4">
							<Card.Body>
								{/* <h1 className="mb-4">[SwiftVIP3]</h1> */}
								<h4 className="mb-4 mt-5">$31,000 to $40,000 [22 % interest after 2 months]. </h4>
								<h4 className="mb-4">
									Total is 30 and withdraw is 25% of the total money every 2 - 2 weeks for 2 months.
								</h4>
							</Card.Body>
						</Card>
						<Card className="me-4">
							<Card.Body>
								{/* <h1 className="mb-4">[SwiftVIP3]</h1> */}
								<h4 className="mb-4 mt-5">$41,000 to $55,000 [22% interest after 2 months]. </h4>
								<h4 className="mb-4">
									Total is 30 and withdraw is 25% of the total money every 2 - 2 weeks for 2 months.
								</h4>
							</Card.Body>
						</Card>
					</CardGroup>
				</Col>
			</Row>
			<Row className="align-items-center justify-content-center p-4">
				<Col className="d-block">
					<div className="mb-4">
						<button
							className="btn1 col col-11 fw-bolder h2 text-white"
							onClick={() => setPurchaseModal(true)}
						>
							Click Purchase Power
						</button>
						<PurchaseModal show={purchaseModal} onHide={() => setPurchaseModal(false)} />
					</div>
					<div>
						<button
							className="btn2 col col-11 fw-bolder h2 text-white"
							onClick={() => setWithdrawModal(true)}
						>
							Withdraw
						</button>
						<WithdrawModal show={withdrawModal} onHide={() => setWithdrawModal(false)} />
					</div>
				</Col>
			</Row>
		</Container>
	);
};

export default DashBoard;
