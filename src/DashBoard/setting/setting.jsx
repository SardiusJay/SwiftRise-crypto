import { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './history.css';
import { SearchIcon } from '@chakra-ui/icons';
import Pagnition from './Pagnition/Pagnition';

const History = () => {
	// State variables for day, month, and year
	const [ day, setDay ] = useState('');
	const [ month, setMonth ] = useState('');
	const [ year, setYear ] = useState('');

	const [ day1, setDay1 ] = useState('');
	const [ month1, setMonth1 ] = useState('');
	const [ year1, setYear1 ] = useState('');
	// Generate an array of numbers for days (1 to 31)
	const days = Array.from({ length: 31 }, (_, index) => index + 1);

	// Array of months
	const months = [
		'January',
		'February',
		'March',
		'April',

		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	// Generate an array of years (from current year to 1900)
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: currentYear - 1900 + 1 }, (_, index) => currentYear - index);

	return (
		<Container>
			<Row className="mt-5">
				<Col>
					<div className="me-5 d-flex align-items-center">
						<div>
							<Link to="/dashboard" className="fw-bolder">
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
							<Link href="#" className="fw-bolder">
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
			<Row className="mt-5">
				<Col>
					<div className="me-5 d-flex align-items-center">
						<div>
							<h5>My Account Statement</h5>
						</div>
						<span className="dividers d-none d-md-block" />
						<div>
							<h5>
								Total Statement: <span className="lead">0.1600 USD</span>
							</h5>
						</div>
					</div>
				</Col>
			</Row>
			<Row className="mt-5">
				<Col className="d-flex">
					<div className="me-3">
						<h6>Start</h6>
						{/* Day Dropdown */}
						<select
							id="day"
							name="day1"
							value={day1}
							className="select fw-bolder"
							onChange={(e) => setDay1(e.target.value)}
						>
							<option value="">Select Day</option>
							{days.map((day) => (
								<option key={day} value={day}>
									{day}
								</option>
							))}
						</select>
						{/* Month Dropdown */}
						<select
							id="month"
							name="month1"
							value={month1}
							className="select fw-bolder"
							onChange={(e) => setMonth1(e.target.value)}
						>
							<option value="">Select Month</option>
							{months.map((month, index) => (
								<option key={index + 1} value={index + 1}>
									{month}
								</option>
							))}
						</select>
						{/* Year Dropdown */}
						<select
							id="year"
							name="year"
							className="select fw-bolder"
							value={year1}
							onChange={(e) => setYear1(e.target.value)}
						>
							<option value="">Select Year</option>
							{years.map((year) => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
					</div>
					<div className="me-4">
						<h6>End</h6>
						{/* Day Dropdown */}
						<select
							id="day"
							name="day"
							value={day}
							className="select fw-bolder"
							onChange={(e) => setDay(e.target.value)}
						>
							<option value="">Select Day</option>
							{days.map((day) => (
								<option key={day} value={day}>
									{day}
								</option>
							))}
						</select>
						{/* Month Dropdown */}
						<select
							id="month"
							name="month"
							value={month}
							className="select fw-bolder"
							onChange={(e) => setMonth(e.target.value)}
						>
							<option value="">Select Month</option>
							{months.map((month, index) => (
								<option key={index + 1} value={index + 1}>
									{month}
								</option>
							))}
						</select>
						{/* Year Dropdown */}
						<select
							id="year"
							name="year"
							className="select fw-bolder"
							value={year}
							onChange={(e) => setYear(e.target.value)}
						>
							<option value="">Select Year</option>
							{years.map((year) => (
								<option key={year} value={year}>
									{year}
								</option>
							))}
						</select>
					</div>
					<div className='me-3'>
						<h6>FIlter By Activity</h6>
						{/* Day Dropdown */}

						<select className="select fw-bolder">
							<option value="">All activty</option>
							{/* <option value="">Transfer From External Processing</option> */}
							<option value="">Purchase</option>
							<option value="">Profits</option>
							<option value="">WithDraw</option>
							<option value="">Affliate Commision</option>
						</select>
					</div>
					<div>
						<h6>FIlter By Payment Methods</h6>

						<select className="select fw-bolder">
							<option value="">All Payment Method</option>
							
						</select>
					</div>
					<div className="search">
						<SearchIcon className="text-black h3 mt-3" />
					</div>
				</Col>
			</Row>
			<Row className="mt-5">
				<Col>
					<Pagnition />
				</Col>
			</Row>
		</Container>
	);
};

export default History;
